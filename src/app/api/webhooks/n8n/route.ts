import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { N8NWebhookSchema } from '@/lib/schemas'
import { sendBulkSMS } from '@/lib/dizparos'
import { normalizeBrazilianPhone } from '@/lib/utils'
import { interpolateMessage } from '@/lib/interpolate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate payload
    const validation = N8NWebhookSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { campaignName, productName, leads } = validation.data

    // Get or create product
    let { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('name', productName)
      .single()

    if (productError && productError.code === 'PGRST116') {
      // Product doesn't exist, create it
      const { data: newProduct, error: createError } = await supabaseAdmin
        .from('products')
        .insert([{ name: productName }])
        .select('id, name')
        .single()

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create product' },
          { status: 500 }
        )
      }
      product = newProduct
    } else if (productError) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get product template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('message_templates')
      .select('message, variables')
      .eq('product_id', product.id)
      .single()

    if (templateError && templateError.code === 'PGRST116') {
      return NextResponse.json(
        { error: `No template configured for product "${productName}"` },
        { status: 400 }
      )
    }

    if (templateError) {
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      )
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert([
        {
          product_id: product.id,
          name: campaignName,
          total_leads: leads.length,
          pending: leads.length,
          metadata: { source: 'n8n' }
        }
      ])
      .select('id')
      .single()

    if (campaignError) {
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }

    // Process leads - interpolate message and prepare for SMS
    const leadsToInsert = leads.map(lead => {
      const message = interpolateMessage(template.message, lead)
      const phone = normalizeBrazilianPhone(lead.phone as string)

      return {
        campaign_id: campaign.id,
        fullphone: phone,
        message,
        status: 'pending'
      }
    })

    // Insert leads
    const { error: leadsError } = await supabaseAdmin
      .from('leads')
      .insert(leadsToInsert)

    if (leadsError) {
      return NextResponse.json(
        { error: 'Failed to create leads' },
        { status: 500 }
      )
    }

    // Send SMS asynchronously (don't wait for completion)
    sendCampaignSMS(campaign.id).catch(err => {
      console.error('Error sending campaign SMS:', err)
    })

    return NextResponse.json(
      {
        success: true,
        campaignId: campaign.id,
        leadsCount: leads.length,
        message: `Campaign created with ${leads.length} leads. SMS will be sent shortly.`
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Send SMS for all leads in a campaign
 */
async function sendCampaignSMS(campaignId: string): Promise<void> {
  try {
    // Get all pending leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('id, fullphone, message')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')

    if (leadsError || !leads) {
      throw new Error('Failed to fetch leads')
    }

    // Send SMS to each lead
    const results = await sendBulkSMS(
      leads.map(lead => ({
        to: lead.fullphone,
        message: lead.message
      }))
    )

    // Update leads with results
    for (let i = 0; i < leads.length; i++) {
      const result = results[i]
      const lead = leads[i]

      await supabaseAdmin
        .from('leads')
        .update({
          status: result.success ? 'sent' : 'failed',
          reference: result.reference,
          status_description: result.error || 'SMS sent to provider'
        })
        .eq('id', lead.id)
    }

    // Update campaign stats
    const successCount = results.filter(r => r.success).length
    await supabaseAdmin
      .from('campaigns')
      .update({
        sent: successCount,
        pending: leads.length - successCount
      })
      .eq('id', campaignId)
  } catch (error) {
    console.error('Error in sendCampaignSMS:', error)
  }
}
