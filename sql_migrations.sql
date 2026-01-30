-- Criar tabela leads se não existir
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  message TEXT,
  fullphone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  reply TEXT,
  dizparos_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_dizparos_id ON leads(dizparos_id);

-- Adicionar coluna dizparos_id se não existir
ALTER TABLE leads ADD COLUMN IF NOT EXISTS dizparos_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP;
