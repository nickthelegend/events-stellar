-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  symbol TEXT NOT NULL,
  uri TEXT NOT NULL,
  contract_id TEXT NOT NULL UNIQUE,
  creator_address TEXT NOT NULL,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  max_tickets INTEGER,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  category TEXT,
  image_url TEXT,
  metadata_ipfs_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_events_creator_address ON events(creator_address);
CREATE INDEX idx_events_contract_id ON events(contract_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Enable Row Level Security (optional)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read events
CREATE POLICY "Allow public read access" ON events FOR SELECT USING (true);

-- Create policy to allow users to insert their own events
CREATE POLICY "Allow users to insert events" ON events FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own events
CREATE POLICY "Allow users to update own events" ON events FOR UPDATE USING (creator_address = auth.jwt() ->> 'sub');