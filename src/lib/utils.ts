import { Lead } from '@/types/lead'

export function calculateDeliveryRate(campaign: {
  delivered: number
  total_leads: number
}): number {
  if (campaign.total_leads === 0) return 0
  return Math.round((campaign.delivered / campaign.total_leads) * 100)
}

export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    sent: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    replied: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getLeadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '⏳ Pendente',
    sent: '🟡 Enviado',
    delivered: '🟢 Entregue',
    failed: '🔴 Falha',
    replied: '💬 Respondeu',
  }
  return labels[status] || status
}

export function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '')

  // Format Brazilian number: +55 11 9 9999-9999
  if (digits.length === 11 && digits.startsWith('55')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 5)} ${digits.slice(5, 9)}-${digits.slice(9)}`
  }

  return phone
}

export function normalizeBrazilianPhone(phone: string): string {
  // Remove formatting
  let cleaned = phone.replace(/\D/g, '')

  // Add country code if not present
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }

  return cleaned
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateWebhookEventId(prefix: string = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
