import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface Params {
  id: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { error } = await (getSupabaseAdmin() as any)
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Product deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
