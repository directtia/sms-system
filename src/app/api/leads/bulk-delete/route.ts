import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BulkDeleteSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = BulkDeleteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { leadIds } = validation.data

    // Get campaign IDs for the leads
    const { data: leads, error: fetchError } = await getSupabaseAdmin()
      .from('leads')
      .select('id, campaign_id')
      .in('id', leadIds)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Get unique campaign IDs
    const campaignIds = [...new Set(leads?.map(l => l.campaign_id) || [])]

    // Delete leads
    const { error: deleteError } = await getSupabaseAdmin()
      .from('leads')
      .delete()
      .in('id', leadIds)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete leads' },
        { status: 500 }
      )
    }

    // Update campaign stats for each affected campaign
    for (const campaignId of campaignIds) {
      const { data: remainingLeads } = await getSupabaseAdmin()
        .from('leads')
        .select('status')
        .eq('campaign_id', campaignId)

      const stats = {
        total_leads: remainingLeads?.length || 0,
        delivered: remainingLeads?.filter(l => l.status === 'delivered').length || 0,
        failed: remainingLeads?.filter(l => l.status === 'failed').length || 0,
        pending: remainingLeads?.filter(l => l.status === 'pending').length || 0,
      }

      // If no leads left, delete campaign
      if (stats.total_leads === 0) {
        await getSupabaseAdmin()
          .from('campaigns')
          .delete()
          .eq('id', campaignId)
      } else {
        // Update campaign stats
        await getSupabaseAdmin()
          .from('campaigns')
          .update({
            total_leads: stats.total_leads,
            delivered: stats.delivered,
            failed: stats.failed,
            pending: stats.pending,
          })
          .eq('id', campaignId)
      }
    }

    return NextResponse.json(
      {
        success: true,
        deleted: leadIds.length,
        message: `${leadIds.length} leads deleted successfully`
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
