# 📱 Sistema de Disparos de SMS via Dizparos

Sistema moderno para gerenciar disparos de SMS através da API Dizparos, integrando com N8N para automação.

## 🚀 Features

- ✅ Envio de SMS via API Dizparos
- ✅ Webhook para integração com N8N
- ✅ Dashboard para visualizar campanhas e status de entrega
- ✅ Templates de mensagens com variáveis dinâmicas
- ✅ Rastreamento em tempo real de status de SMS
- ✅ Deleção em lote de leads
- ✅ Histórico completo de webhooks
- ✅ Suporte a respostas de SMS (replies)

## 🛠️ Stack Tecnológica

- **Frontend/Backend**: Next.js 14 + TypeScript
- **Banco de dados**: Supabase (PostgreSQL)
- **Validação**: Zod
- **Estilos**: Tailwind CSS
- **API externa**: Dizparos SMS

## 📋 Pré-requisitos

- Node.js 18+
- Conta Supabase
- Token API Dizparos
- Git (opcional)

## 🔧 Instalação

### 1. Clonar e instalar dependências

```bash
cd sms
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Dizparos API Configuration
DIZPAROS_API_URL=https://api.dizparos.com/v1
DIZPAROS_API_TOKEN=your_dizparos_token_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar banco de dados

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Execute o SQL da migration:

```bash
# Ou use o arquivo supabase/migrations/001_initial_schema.sql
```

### 4. Iniciar o servidor

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

## 📡 Integração com N8N

### Webhook para enviar campanhas

**URL**: `POST http://localhost:3000/api/webhooks/n8n`

**Payload**:
```json
{
  "campaignName": "Black Friday 2026",
  "productName": "iPhone 15",
  "leads": [
    {
      "phone": "5512934567890",
      "customer_name": "João Silva",
      "discount_code": "BLACKFRIDAY20"
    },
    {
      "phone": "5511987654321",
      "customer_name": "Maria Santos",
      "discount_code": "BLACKFRIDAY20"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "campaignId": "uuid-here",
  "leadsCount": 2,
  "message": "Campaign created with 2 leads. SMS will be sent shortly."
}
```

### Variáveis suportadas

As variáveis devem ser definidas no template do produto. Exemplos:

- `{{customer_name}}` - Nome do cliente
- `{{discount_code}}` - Código de desconto
- `{{promo_link}}` - Link da promoção
- `{{code}}` - Código de validação
- Qualquer campo customizado que você enviar

## 🔌 Webhooks de Callback (Dizparos)

O sistema recebe automaticamente callbacks do Dizparos com o status de entrega:

### Tipos de webhook

1. **Status de Entrega** (type: 2000-2004)
   - Tentando enviar
   - Enviado
   - Entregue
   - Não entregue
   - Rejeitado

2. **Inválido** (type: 1000-1006)
   - Código inválido
   - ANATEL inválida
   - Telefone duplicado
   - Não perturbe
   - Lista negra
   - Mensagem inválida
   - Rejeitado pelo provedor

3. **Resposta** (type: 3000)
   - Lead respondeu ao SMS

4. **Rejeitado por Homologação** (type: 5000)
   - Campanha rejeitada

### Configure no Dizparos

Adicione a URL de webhook no painel Dizparos:

```
POST http://seu-dominio.com/api/webhooks/dizparos
```

## 📊 Dashboard

### Página Principal (`/`)
- Lista todas as campanhas
- Mostra estatísticas de entrega
- Permite deletar campanhas

### Detalhes da Campanha (`/campaigns/[id]`)
- Visualiza todos os leads da campanha
- Status individual de cada lead
- Resposta dos leads (se houver)
- Deleção em lote de leads

### Gerenciar Produtos (`/products`)
- Lista todos os produtos cadastrados
- Cria novos produtos
- Edita templates de mensagens

### Editar Template (`/products/[id]`)
- Define a mensagem a ser enviada
- Adiciona variáveis dinâmicas
- Preview da mensagem
- Instruções de integração com N8N

## 🔐 Segurança

- Sistema interno sem autenticação (pode ser adicionada futuramente)
- Idempotência de webhooks (evita processamento duplicado)
- Validação de payloads com Zod
- SQL seguro via Supabase RLS policies
- Variáveis de ambiente protegidas

## 📈 Próximas Melhorias

- [ ] Autenticação (NextAuth.js)
- [ ] WebSockets para atualizações em tempo real
- [ ] Exportar relatórios (CSV/PDF)
- [ ] Agendamento de campanhas
- [ ] Blacklist de números
- [ ] Dashboard com gráficos de taxa de entrega
- [ ] Retry automático para falhas
- [ ] Notificações por email/Slack

## 🐛 Troubleshooting

### Erro: "No template configured for product"
- Acesse `/products`
- Encontre o produto
- Clique em "Editar"
- Configure o template de mensagem

### Erro: "SUPABASE_KEY not configured"
- Verifique `.env.local`
- Garanta que `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão definidas

### SMS não está sendo enviado
- Verifique `DIZPAROS_API_TOKEN`
- Confirme que a API está acessível
- Verifique os logs da aplicação

## 📞 Suporte

Para dúvidas sobre a API Dizparos, visite: https://api.dizparos.com/docs

## 📝 Licença

Proprietário - Pedro Desenvolvimento

---

**Desenvolvido com ❤️ usando Next.js + Supabase**
# Build fixed on qui, 29 de jan de 2026 19:22:59
