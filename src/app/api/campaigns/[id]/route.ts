import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { data: campaign, error } = await getSupabaseAdmin()
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (error) {
      console.error('Error fetching campaign:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaign', details: error.message },
        { status: 500 }
      )
    }

    // Fetch product name if product_id exists
    if (campaign.product_id) {
      const { data: product } = await getSupabaseAdmin()
        .from('products')
        .select('id, name')
        .eq('id', campaign.product_id)
        .single()

      if (product) {
        campaign.products = product
      }
    }

    return NextResponse.json({ campaign }, { status: 200 })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Delete all leads first (cascade should handle this, but be explicit)
    await getSupabaseAdmin()
      .from('leads')
      .delete()
      .eq('campaign_id', params.id)

    // Delete campaign
    const { error } = await getSupabaseAdmin()
      .from('campaigns')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Campaign deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
