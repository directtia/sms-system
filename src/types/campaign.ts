export interface Campaign {
  id: string
  product_id: string
  name: string
  created_at: string
  total_leads: number
  delivered: number
  failed: number
  pending: number
  metadata?: Record<string, unknown>
}

export interface CampaignWithStats extends Campaign {
  delivery_rate: number
}
