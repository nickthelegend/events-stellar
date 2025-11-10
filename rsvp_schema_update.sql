-- Add status column to existing rsvps table
ALTER TABLE rsvps ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));