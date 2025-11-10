import { supabase } from "../lib/supabase";

export interface CreateEventRequest {
  name: string;
  description?: string;
  symbol: string;
  uri: string;
  contract_id: string;
  creator_address: string;
  location?: string;
  event_date?: string;
  category?: string;
  image_url?: string;
  metadata_ipfs_hash?: string;
  max_tickets?: number;
}

export const createEvent = async (eventData: CreateEventRequest) => {
  const { data, error } = await supabase
    .from("events")
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getEventsByCreator = async (creatorAddress: string) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("creator_address", creatorAddress)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getEventByContractId = async (contractId: string) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("contract_id", contractId)
    .single();

  if (error) throw error;
  return data;
};
