import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface DizparosCallback {
  dizparos_id: string
  phone: string
  status: 'delivered' | 'failed' | 'replied'
  message_id?: string
  timestamp?: string
  error_code?: string | null
  error_message?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body: DizparosCallback = await request.json()
    const { dizparos_id, phone, status, error_message } = body

    // Validação
    if (!dizparos_id || !phone || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: dizparos_id, phone, status' },
        { status: 400 }
      )
    }

    // Validar status
    if (!['delivered', 'failed', 'replied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: delivered, failed, or replied' },
        { status: 400 }
      )
    }

    // Encontrar o lead pelo dizparos_id
    const { data: lead, error: findError } = await (getSupabaseAdmin() as any)
      .from('leads')
      .select('id, campaign_id, status')
      .eq('dizparos_id', dizparos_id)
      .single()

    if (findError || !lead) {
      console.warn(`Lead with dizparos_id ${dizparos_id} not found`)
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Preparar update
    const updateData: any = {
      status
    }

    const now = new Date().toISOString()

    if (status === 'delivered') {
      updateData.delivered_at = now
    } else if (status === 'failed') {
      updateData.failed_at = now
      updateData.reply = error_message || 'Send failed'
    } else if (status === 'replied') {
      updateData.reply = error_message || 'Reply received'
    }

    // Atualizar lead
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('leads')
      .update(updateData)
      .eq('id', lead.id)

    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to update lead', details: updateError.message },
        { status: 500 }
      )
    }

    // Atualizar stats da campanha
    const { data: campaignLeads } = await (getSupabaseAdmin() as any)
      .from('leads')
      .select('status')
      .eq('campaign_id', lead.campaign_id)

    const stats = {
      total_leads: campaignLeads?.length || 0,
      delivered: campaignLeads?.filter((l: any) => l.status === 'delivered').length || 0,
      failed: campaignLeads?.filter((l: any) => l.status === 'failed').length || 0,
    }

    await (getSupabaseAdmin() as any)
      .from('campaigns')
      .update({
        total_leads: stats.total_leads,
        delivered: stats.delivered,
        failed: stats.failed
      })
      .eq('id', lead.campaign_id)

    console.log(`Lead ${lead.id} updated to status: ${status}`)

    return NextResponse.json(
      {
        success: true,
        lead_id: lead.id,
        updated: true,
        new_status: status
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in dizparos callback:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
