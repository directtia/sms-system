export interface Product {
  id: string
  name: string
  created_at: string
}

export interface MessageTemplate {
  id: string
  product_id: string
  message: string
  variables?: string[]
  created_at: string
  updated_at: string
}

export interface ProductWithTemplate extends Product {
  template?: MessageTemplate
}
