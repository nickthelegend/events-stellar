-- Events table schema for Supabase
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  symbol TEXT NOT NULL,
  uri TEXT,
  contract_id TEXT UNIQUE NOT NULL,
  creator_address TEXT NOT NULL,
  location TEXT,
  event_date TIMESTAMPTZ,
  category TEXT,
  image_url TEXT,
  metadata_ipfs_hash TEXT,
  max_tickets INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert
CREATE POLICY "Users can insert events" ON events
  FOR INSERT WITH CHECK (true);

-- Create policies for creators to update their events
CREATE POLICY "Creators can update their events" ON events
  FOR UPDATE USING (creator_address = auth.jwt() ->> 'wallet_address');

-- Create index for better performance
CREATE INDEX idx_events_contract_id ON events(contract_id);
CREATE INDEX idx_events_creator ON events(creator_address);
CREATE INDEX idx_events_date ON events(event_date);