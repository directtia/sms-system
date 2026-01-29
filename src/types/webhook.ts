// N8N Webhook Payload
export interface N8NWebhookPayload {
  campaignName: string
  productName: string
  leads: N8NLead[]
}

export interface N8NLead {
  phone: string
  [key: string]: unknown
}

// Dizparos Webhook Payloads
export interface DizparosWebhook {
  webhook_event_id: string
  type: number
  type_description: string
  attempts: number
  data: Record<string, unknown>
}

export interface DizparosStatusData {
  fullphone: string
  reference: string
}

export interface DizparosInvalidData {
  fullphone: string
  reference: string
}

export interface DizparosReplyData {
  fullphone: string
  sms_msg_id: string
  message: string
  reply: string
}

// Status codes from Dizparos
export const DIZPAROS_STATUS_CODES = {
  ATTEMPTING: 2000,
  SENT: 2001,
  DELIVERED: 2002,
  NOT_DELIVERED: 2003,
  REJECTED_BROKER: 2004,
  INVALID_CODE: 1000,
  INVALID_ANATEL: 1001,
  DUPLICATE_PHONE: 1002,
  DO_NOT_DISTURB: 1003,
  BLACKLIST: 1004,
  INVALID_MESSAGE: 1005,
  REJECTED_PROVIDER: 1006,
  REPLY: 3000,
  REJECTED_HOMOLOGATION: 5000,
} as const
