import { createClient } from '@supabase/supabase-js'

// Hardcoded values for VPS deployment - Supabase credentials
const SUPABASE_URL = 'https://puvotlvpjthhgxjclpxd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dm90bHZwanRoaGd4amNscHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODAwNjIsImV4cCI6MjA1ODE1NjA2Mn0.lAYqDmcOTNSOXzQK7z86r9LDjbGHGMgTdRw6RFQWe_g'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dm90bHZwanRoaGd4amNscHhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjU4MDA2MiwiZXhwIjoyMDU4MTU2MDYyfQ.IfkKeOR5NOKDQD-3dIz2bcEQzKhZUCYMF1JDoEIjEkc'

// Lazy-load clients only when needed (avoids validation during build)
let supabaseClient: ReturnType<typeof createClient> | null = null
let supabaseAdminClient: ReturnType<typeof createClient> | null = null

function initSupabase() {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(`Missing Supabase config: URL=${url ? 'set' : 'missing'}, Key=${key ? 'set' : 'missing'}`)
  }

  supabaseClient = createClient(url, key)
  return supabaseClient
}

function initSupabaseAdmin() {
  if (supabaseAdminClient) return supabaseAdminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  const key = serviceKey || anonKey
  if (!key) {
    throw new Error('Missing Supabase API key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  }

  supabaseAdminClient = createClient(url, key)
  return supabaseAdminClient
}

// Export getter functions
export function getSupabase() {
  return initSupabase()
}

export function getSupabaseAdmin() {
  return initSupabaseAdmin()
}
