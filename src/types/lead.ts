export type LeadStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'replied'

export interface Lead {
  id: string
  campaign_id: string
  fullphone: string
  message: string
  status: LeadStatus
  status_code?: number
  status_description?: string
  reference?: string
  reply?: string
  created_at: string
  updated_at: string
}
