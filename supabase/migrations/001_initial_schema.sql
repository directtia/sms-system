-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products(name);

-- Create message_templates table
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_product ON message_templates(product_id);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_leads INT DEFAULT 0,
  delivered INT DEFAULT 0,
  failed INT DEFAULT 0,
  pending INT DEFAULT 0,
  metadata JSONB
);

CREATE INDEX idx_campaigns_product ON campaigns(product_id);

-- Create leads table
CREATE TABLE leads (
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
);

CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_reference ON leads(reference);

-- Create webhook_logs table
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id VARCHAR(255) UNIQUE,
  type INT NOT NULL,
  type_description VARCHAR(100),
  attempts INT DEFAULT 1,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since it's internal system)
CREATE POLICY "Allow all access to products" ON products
  FOR ALL USING (true);

CREATE POLICY "Allow all access to templates" ON message_templates
  FOR ALL USING (true);

CREATE POLICY "Allow all access to campaigns" ON campaigns
  FOR ALL USING (true);

CREATE POLICY "Allow all access to leads" ON leads
  FOR ALL USING (true);

CREATE POLICY "Allow all access to webhook_logs" ON webhook_logs
  FOR ALL USING (true);
