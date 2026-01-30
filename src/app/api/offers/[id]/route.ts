import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface Params {
  id: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const { data: offer, error } = await getSupabaseAdmin()
      .from('offers')
      .update({ name: name.trim() })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating offer:', error)
      return NextResponse.json(
        { error: 'Failed to update offer', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ offer }, { status: 200 })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { error } = await getSupabaseAdmin()
      .from('offers')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting offer:', error)
      return NextResponse.json(
        { error: 'Failed to delete offer', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Offer deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
