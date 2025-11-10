import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://uvbmizgnpnccqbknavpv.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Ym1pemducG5jY3Fia25hdnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDQ1NDUsImV4cCI6MjA3ODMyMDU0NX0._CUMUY5QuGQ4mXSYln39hvEcGEl8n6wIIgz08g8Ee0k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Event {
  id: string;
  name: string;
  description?: string;
  symbol: string;
  uri: string;
  contract_id: string;
  creator_address: string;
  location?: string;
  event_date?: string;
  max_tickets?: number;
  ticket_price?: number;
  category?: string;
  image_url?: string;
  metadata_ipfs_hash?: string;
  created_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  contract_id: string;
  attendee_address: string;
  email: string;
  status?: "pending" | "approved" | "rejected";
  created_at: string;
}
