import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { UpdateTemplateSchema } from '@/lib/schemas'
import { extractVariables } from '@/lib/interpolate'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { data: template, error } = await getSupabaseAdmin()
      .from('message_templates')
      .select('*')
      .eq('product_id', params.id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ template }, { status: 200 })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const body = await request.json()

    // Validate input
    const validation = UpdateTemplateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    let { message, variables } = validation.data

    // Extract variables from message if not provided
    if (!variables) {
      variables = extractVariables(message)
    }

    // Check if template exists
    const { data: existing } = await getSupabaseAdmin()
      .from('message_templates')
      .select('id')
      .eq('product_id', params.id)
      .single()

    if (existing) {
      // Update existing template
      const { data: updated, error } = await getSupabaseAdmin()
        .from('message_templates')
        .update({
          message,
          variables,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', params.id)
        .select('*')
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update template' },
          { status: 500 }
        )
      }

      return NextResponse.json({ template: updated }, { status: 200 })
    } else {
      // Create new template
      const { data: created, error } = await getSupabaseAdmin()
        .from('message_templates')
        .insert([
          {
            product_id: params.id,
            message,
            variables
          }
        ])
        .select('*')
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create template' },
          { status: 500 }
        )
      }

      return NextResponse.json({ template: created }, { status: 201 })
    }
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
