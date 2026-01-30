import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const migrations = [
  `CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`,
  `CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_templates_product ON message_templates(product_id)`,
  `CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    total_leads INT DEFAULT 0,
    delivered INT DEFAULT 0,
    failed INT DEFAULT 0,
    pending INT DEFAULT 0,
    metadata JSONB
  )`,
  `CREATE INDEX IF NOT EXISTS idx_campaigns_product ON campaigns(product_id)`,
  `CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    fullphone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    status_code INT,
    status_description VARCHAR(100),
    reference VARCHAR(255),
    reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_reference ON leads(reference)`,
  `CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_event_id VARCHAR(255) UNIQUE,
    type INT NOT NULL,
    type_description VARCHAR(100),
    attempts INT DEFAULT 1,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`
]

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Tables need to be created manually via Supabase Dashboard',
      instructions: [
        '1. Go to https://supabase.com/dashboard/project/puvotlvpjthhgxjclpxd',
        '2. Click "SQL Editor" in the left sidebar',
        '3. Create a new query',
        '4. Copy and paste the content from /supabase/migrations/001_initial_schema.sql',
        '5. Click "Run"',
        'After that, the API will work correctly'
      ],
      migrationFile: '/supabase/migrations/001_initial_schema.sql'
    },
    { status: 200 }
  )
}
