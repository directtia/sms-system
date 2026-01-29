import { z } from 'zod'

// N8N Webhook Validation
export const N8NLeadSchema = z.object({
  phone: z.string().min(10).max(20),
}).catchall(z.unknown())

export const N8NWebhookSchema = z.object({
  campaignName: z.string().min(1).max(255),
  productName: z.string().min(1).max(255),
  leads: z.array(N8NLeadSchema).min(1),
})

export type N8NWebhookInput = z.infer<typeof N8NWebhookSchema>

// Dizparos Webhook Validation
export const DizparosWebhookSchema = z.object({
  webhook_event_id: z.string(),
  type: z.number(),
  type_description: z.string(),
  attempts: z.number().optional(),
  data: z.record(z.unknown()),
})

export type DizparosWebhookInput = z.infer<typeof DizparosWebhookSchema>

// Product Creation
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

// Message Template
export const UpdateTemplateSchema = z.object({
  message: z.string().min(1),
  variables: z.array(z.string()).optional(),
})

export type UpdateTemplateInput = z.infer<typeof UpdateTemplateSchema>

// Campaign Creation
export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  productName: z.string().min(1).max(255),
  leads: z.array(
    z.object({
      phone: z.string().min(10).max(20),
    }).catchall(z.unknown())
  ).min(1),
})

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>

// Bulk Delete
export const BulkDeleteSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1),
})

export type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>
