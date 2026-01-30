# PRD - Sistema de Disparo SMS (Disparador SMS)

## 1. Visão Geral

Sistema de gerenciamento e envio de campanhas SMS que integra:
- **Painel de Controle**: Criar campanhas, produtos, ofertas e templates
- **N8N**: Orquestrador que recebe dados e dispara envios
- **Dizparos**: Provedor de SMS (API de envio)

## 2. Fluxo Principal de Envio

```
N8N (recebe dados)
  ↓
POST /api/webhooks/leads (webhook nosso)
  ↓
Sistema valida + vincula à campanha correta
  ↓
Prepara payload para Dizparos
  ↓
POST https://api.dizparos.com/send (API Dizparos)
  ↓
Dizparos envia SMS + retorna callback
  ↓
POST /api/webhooks/dizparos/callback (webhook Dizparos)
  ↓
Sistema atualiza status dos leads
  ↓
Painel mostra resultado (sucesso/erro)
```

## 3. Entidades Principais

### 3.1 Campanha
- `id` (UUID)
- `name` (string): Nome da campanha
- `product_id` (FK): Produto vinculado
- `offer_id` (FK): Oferta da campanha
- `template_id` (FK): Template de mensagem
- `status` (enum): pending, active, paused, completed
- `total_leads` (int)
- `delivered` (int)
- `failed` (int)
- `created_at` (timestamp)

### 3.2 Lead
- `id` (UUID)
- `campaign_id` (FK): Campanha vinculada
- `phone` (string): Número do telefone
- `customer_name` (string): Nome do cliente
- `message` (text): Mensagem personalizada
- `status` (enum): pending, sent, delivered, failed, replied
- `reply` (text): Resposta recebida
- `dizparos_id` (string): ID retornado pelo Dizparos
- `created_at` (timestamp)
- `sent_at` (timestamp)

### 3.3 Template
- `id` (UUID)
- `name` (string)
- `message` (text): Mensagem com variáveis {name}, {offer}, etc
- `created_at` (timestamp)

### 3.4 Oferta
- `id` (UUID)
- `name` (string): Nome da oferta
- `created_at` (timestamp)

### 3.5 Produto
- `id` (UUID)
- `name` (string)
- `created_at` (timestamp)

## 4. APIs Necessárias

### 4.1 Webhook do N8N (Entrada)
**POST /api/webhooks/leads**

Request:
```json
{
  "campaign_id": "uuid-da-campanha",
  "leads": [
    {
      "phone": "+5511999999999",
      "customer_name": "João Silva",
      "email": "joao@example.com"
    }
  ]
}
```

Response (201):
```json
{
  "success": true,
  "created": 3,
  "failed": 0,
  "leads": [
    {
      "id": "uuid",
      "phone": "+5511999999999",
      "status": "pending"
    }
  ]
}
```

### 4.2 Webhook do Dizparos (Callback)
**POST /api/webhooks/dizparos/callback**

Request (do Dizparos para nosso sistema):
```json
{
  "dizparos_id": "msg-xxxxx",
  "phone": "+5511999999999",
  "status": "delivered|failed|replied",
  "message_id": "xxxxx",
  "timestamp": "2026-01-30T20:00:00Z",
  "error_code": null,
  "error_message": null
}
```

Response (200):
```json
{
  "success": true,
  "lead_id": "uuid",
  "updated": true
}
```

## 5. Fluxo Detalhado

### 5.1 Entrada de Leads (N8N → Sistema)

1. N8N coleta dados de fonte (banco, API, arquivo)
2. N8N envia POST `/api/webhooks/leads`:
   - Valida se campanha existe
   - Valida se template existe
   - Cria leads no banco com status `pending`
   - Retorna IDs dos leads criados

### 5.2 Preparação e Envio (Sistema → Dizparos)

1. Busca lead com status `pending`
2. Busca template da campanha
3. Personaliza mensagem (substitui variáveis)
4. Prepara payload Dizparos
5. POST para API Dizparos
6. Armazena `dizparos_id` no banco
7. Atualiza status para `sent`

### 5.3 Callback do Dizparos (Dizparos → Sistema)

1. Dizparos dispara callback quando SMS é entregue/falha
2. POST `/api/webhooks/dizparos/callback` recebe status final
3. Sistema atualiza lead (status, timestamp, erros)
4. Sistema atualiza campanhas stats

### 5.4 Visualização (Painel)

Painel mostra leads com status:
- ⏳ Pending: aguardando envio
- 🟡 Sent: enviado, aguardando entrega
- 🟢 Delivered: entregue com sucesso
- 🔴 Failed: falha no envio
- 💬 Replied: cliente respondeu

## 6. Endpoints Necessários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/webhooks/leads` | Recebe leads do N8N |
| POST | `/api/webhooks/dizparos/callback` | Recebe callback do Dizparos |
| GET | `/api/campaigns/{id}` | Detalhes da campanha |
| GET | `/api/leads?campaignId={id}` | Lista leads da campanha |
| PUT | `/api/leads/{id}` | Atualiza status do lead |
| DELETE | `/api/leads/{id}` | Deleta lead |
| POST | `/api/leads/bulk-delete` | Deleta múltiplos leads |

## 7. Segurança

- Validar token do N8N (Authorization header)
- Validar token do Dizparos (Authorization header)
- Rate limit: 100 leads/minuto por campanha
- Logs de todos os envios
- Encrypt dados sensíveis em repouso

