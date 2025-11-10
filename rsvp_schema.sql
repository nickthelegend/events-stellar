-- RSVP table schema for Supabase
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contract_id TEXT NOT NULL,
  attendee_address TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_id, attendee_address)
);

-- Enable RLS (Row Level Security)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "RSVPs are viewable by everyone" ON rsvps
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert
CREATE POLICY "Users can insert RSVPs" ON rsvps
  FOR INSERT WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_rsvps_contract_id ON rsvps(contract_id);
CREATE INDEX idx_rsvps_attendee ON rsvps(attendee_address);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);