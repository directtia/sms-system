import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    let query = getSupabaseAdmin()
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data: campaigns, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    return NextResponse.json({ campaigns }, { status: 200 })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignName, productName, productId, leads } = body

    if (!campaignName) {
      return NextResponse.json(
        { error: 'Missing required field: campaignName' },
        { status: 400 }
      )
    }

    let product: any = null

    // Try to get product by ID first, then by name
    if (productId) {
      const { data, error } = await (getSupabaseAdmin() as any)
        .from('products')
        .select('id')
        .eq('id', productId)
        .single()
      if (!error && data) product = data
    } else if (productName) {
      const { data, error } = await (getSupabaseAdmin() as any)
        .from('products')
        .select('id')
        .eq('name', productName)
        .single()
      if (!error && data) product = data
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found. Please provide productId or valid productName' },
        { status: 404 }
      )
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await (getSupabaseAdmin() as any)
      .from('campaigns')
      .insert([
        {
          name: campaignName,
          product_id: product.id,
          status: 'pending'
        }
      ])
      .select('*')
      .single()

    if (campaignError) {
      console.error('Error creating campaign:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign', details: campaignError.message },
        { status: 500 }
      )
    }

    // Create leads if provided
    if (leads && leads.length > 0) {
      const leadsData = leads.map((lead: any) => ({
        campaign_id: campaign.id,
        phone: lead.phone,
        customer_name: lead.customer_name,
        discount_code: lead.discount_code
      }))

      const { error: leadsError } = await getSupabaseAdmin()
        .from('leads')
        .insert(leadsData)

      if (leadsError) {
        console.error('Error creating leads:', leadsError)
        return NextResponse.json(
          { error: 'Campaign created but failed to add leads' },
          { status: 201 }
        )
      }
    }

    return NextResponse.json(
      {
        campaignId: campaign.id,
        success: true,
        message: `Campaign created with ${leads?.length || 0} leads`
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
