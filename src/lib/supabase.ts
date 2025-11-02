import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hfnmwduyojimbyejaghn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmbm13ZHV5b2ppbWJ5ZWphZ2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTg2MDIsImV4cCI6MjA3NzYzNDYwMn0.CpivClbybk8wL0dys4jOIMeTGSaKeWNhVmAqUuo_mwA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Event {
  id: string
  name: string
  description?: string
  symbol: string
  uri: string
  contract_id: string
  creator_address: string
  location?: string
  event_date?: string
  max_tickets?: number
  ticket_price?: number
  category?: string
  image_url?: string
  metadata_ipfs_hash?: string
  created_at: string
}