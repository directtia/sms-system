import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface LeadInput {
  phone: string
  customer_name: string
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, leads } = body

    // Validação
    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Missing required field: campaign_id' },
        { status: 400 }
      )
    }

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty leads array' },
        { status: 400 }
      )
    }

    // Verificar se campanha existe
    const { data: campaign, error: campaignError } = await (getSupabaseAdmin() as any)
      .from('campaigns')
      .select('id, template_id')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Buscar template para preparar mensagem
    let template: any = null
    if (campaign.template_id) {
      const { data: tmpl } = await getSupabaseAdmin()
        .from('templates')
        .select('id, message')
        .eq('id', campaign.template_id)
        .single()
      template = tmpl
    }

    // Preparar dados dos leads
    const leadsToInsert = leads.map((lead: LeadInput) => {
      let message = template?.message || ''

      // Personalizar mensagem com variáveis
      if (message) {
        message = message
          .replace('{name}', lead.customer_name || '')
          .replace('{customer_name}', lead.customer_name || '')
          .replace('{phone}', lead.phone || '')
      }

      return {
        campaign_id,
        phone: lead.phone,
        customer_name: lead.customer_name,
        fullphone: lead.phone,
        message,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    })

    // Inserir leads
    const { data: insertedLeads, error: insertError } = await (getSupabaseAdmin() as any)
      .from('leads')
      .insert(leadsToInsert)
      .select('id, phone, status')

    if (insertError) {
      console.error('Error inserting leads:', insertError)
      return NextResponse.json(
        { error: 'Failed to create leads', details: insertError.message },
        { status: 500 }
      )
    }

    // Atualizar stats da campanha
    const { data: campaignStats } = await (getSupabaseAdmin() as any)
      .from('leads')
      .select('status')
      .eq('campaign_id', campaign_id)

    const stats = {
      total_leads: campaignStats?.length || 0,
      pending: campaignStats?.filter((l: any) => l.status === 'pending').length || 0,
      delivered: campaignStats?.filter((l: any) => l.status === 'delivered').length || 0,
      failed: campaignStats?.filter((l: any) => l.status === 'failed').length || 0,
    }

    await (getSupabaseAdmin() as any)
      .from('campaigns')
      .update({
        total_leads: stats.total_leads,
        delivered: stats.delivered,
        failed: stats.failed
      })
      .eq('id', campaign_id)

    return NextResponse.json(
      {
        success: true,
        created: insertedLeads?.length || 0,
        failed: 0,
        leads: insertedLeads || []
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in webhook/leads:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
