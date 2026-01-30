import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface LeadInput {
  body: {
    first_name: string
    phone: string
    product_name?: string
    offer_name?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leads = Array.isArray(body) ? body : []

    // Validação
    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty leads array' },
        { status: 400 }
      )
    }

    // Preparar dados dos leads
    const leadsToInsert = leads.map((item: LeadInput) => ({
      phone: item.body.phone,
      customer_name: item.body.first_name,
      fullphone: item.body.phone,
      status: 'pending',
      created_at: new Date().toISOString()
    }))

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
