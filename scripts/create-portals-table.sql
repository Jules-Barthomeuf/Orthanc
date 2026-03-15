-- Create the portals table in Supabase
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS portals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  agent_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  property_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role key (same pattern as properties table)
CREATE POLICY "Allow all via service role" ON portals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_portals_slug ON portals (slug);

-- Create index on agent_id for filtering
CREATE INDEX IF NOT EXISTS idx_portals_agent_id ON portals (agent_id);
