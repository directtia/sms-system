import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { DizparosWebhookSchema, BulkDeleteSchema } from '@/lib/schemas'
import { DIZPAROS_STATUS_CODES } from '@/types/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate payload
    const validation = DizparosWebhookSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      )
    }

    const webhook = validation.data

    // Check if webhook already processed (idempotency)
    const { data: existingLog } = await getSupabaseAdmin()
      .from('webhook_logs')
      .select('id')
      .eq('webhook_event_id', webhook.webhook_event_id)
      .single()

    if (existingLog) {
      // Already processed
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Save webhook log
    await getSupabaseAdmin()
      .from('webhook_logs')
      .insert([
        {
          webhook_event_id: webhook.webhook_event_id,
          type: webhook.type,
          type_description: webhook.type_description,
          attempts: webhook.attempts || 1,
          payload: webhook.data
        }
      ])

    // Process webhook based on type
    if (isStatusUpdate(webhook.type)) {
      await processStatusUpdate(webhook)
    } else if (isInvalidUpdate(webhook.type)) {
      await processInvalidUpdate(webhook)
    } else if (isReplyUpdate(webhook.type)) {
      await processReplyUpdate(webhook)
    } else if (isRejectedByHomologation(webhook.type)) {
      await processRejectedByHomologation(webhook)
    }

    // Mark as processed
    await getSupabaseAdmin()
      .from('webhook_logs')
      .update({ processed: true })
      .eq('webhook_event_id', webhook.webhook_event_id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isStatusUpdate(type: number): boolean {
  const statusCodes = [
    DIZPAROS_STATUS_CODES.ATTEMPTING,
    DIZPAROS_STATUS_CODES.SENT,
    DIZPAROS_STATUS_CODES.DELIVERED,
    DIZPAROS_STATUS_CODES.NOT_DELIVERED,
    DIZPAROS_STATUS_CODES.REJECTED_BROKER,
  ] as const

  return statusCodes.includes(type as never)
}

function isInvalidUpdate(type: number): boolean {
  const invalidCodes = [
    DIZPAROS_STATUS_CODES.INVALID_CODE,
    DIZPAROS_STATUS_CODES.INVALID_ANATEL,
    DIZPAROS_STATUS_CODES.DUPLICATE_PHONE,
    DIZPAROS_STATUS_CODES.DO_NOT_DISTURB,
    DIZPAROS_STATUS_CODES.BLACKLIST,
    DIZPAROS_STATUS_CODES.INVALID_MESSAGE,
    DIZPAROS_STATUS_CODES.REJECTED_PROVIDER,
  ] as const

  return invalidCodes.includes(type as never)
}

function isReplyUpdate(type: number): boolean {
  return type === DIZPAROS_STATUS_CODES.REPLY
}

function isRejectedByHomologation(type: number): boolean {
  return type === DIZPAROS_STATUS_CODES.REJECTED_HOMOLOGATION
}

async function processStatusUpdate(webhook: any): Promise<void> {
  const { fullphone, reference } = webhook.data

  // Map Dizparos status codes to our status
  const statusMap: Record<number, string> = {
    [DIZPAROS_STATUS_CODES.ATTEMPTING]: 'pending',
    [DIZPAROS_STATUS_CODES.SENT]: 'sent',
    [DIZPAROS_STATUS_CODES.DELIVERED]: 'delivered',
    [DIZPAROS_STATUS_CODES.NOT_DELIVERED]: 'failed',
    [DIZPAROS_STATUS_CODES.REJECTED_BROKER]: 'failed',
  }

  const newStatus = statusMap[webhook.type] || 'failed'

  // Update lead
  const { data: lead } = await getSupabaseAdmin()
    .from('leads')
    .select('id, campaign_id')
    .eq('reference', reference)
    .single()

  if (!lead) return

  await getSupabaseAdmin()
    .from('leads')
    .update({
      status: newStatus,
      status_code: webhook.type,
      status_description: webhook.type_description,
      updated_at: new Date().toISOString()
    })
    .eq('id', lead.id)

  // Update campaign stats
  await updateCampaignStats(lead.campaign_id)
}

async function processInvalidUpdate(webhook: any): Promise<void> {
  const { fullphone, reference } = webhook.data

  // Update lead as failed
  const { data: lead } = await getSupabaseAdmin()
    .from('leads')
    .select('id, campaign_id')
    .eq('reference', reference)
    .single()

  if (!lead) return

  await getSupabaseAdmin()
    .from('leads')
    .update({
      status: 'failed',
      status_code: webhook.type,
      status_description: webhook.type_description,
      updated_at: new Date().toISOString()
    })
    .eq('id', lead.id)

  // Update campaign stats
  await updateCampaignStats(lead.campaign_id)
}

async function processReplyUpdate(webhook: any): Promise<void> {
  const { sms_msg_id, reply } = webhook.data

  // Update lead with reply
  const { data: lead } = await getSupabaseAdmin()
    .from('leads')
    .select('id, campaign_id')
    .eq('reference', sms_msg_id)
    .single()

  if (!lead) return

  await getSupabaseAdmin()
    .from('leads')
    .update({
      status: 'replied',
      reply,
      status_description: 'Lead replied to SMS',
      updated_at: new Date().toISOString()
    })
    .eq('id', lead.id)
}

async function processRejectedByHomologation(webhook: any): Promise<void> {
  // This is a campaign-level event
  // Mark all pending leads as failed
  console.log('Campaign rejected by homologation:', webhook.data)
}

async function updateCampaignStats(campaignId: string): Promise<void> {
  // Get all leads for this campaign
  const { data: leads } = await getSupabaseAdmin()
    .from('leads')
    .select('status')
    .eq('campaign_id', campaignId)

  if (!leads) return

  const stats = {
    total_leads: leads.length,
    delivered: leads.filter(l => l.status === 'delivered').length,
    failed: leads.filter(l => l.status === 'failed').length,
    pending: leads.filter(l => l.status === 'pending').length,
    sent: leads.filter(l => l.status === 'sent').length,
  }

  // Update campaign
  await getSupabaseAdmin()
    .from('campaigns')
    .update({
      delivered: stats.delivered,
      failed: stats.failed,
      pending: stats.pending,
    })
    .eq('id', campaignId)
}
