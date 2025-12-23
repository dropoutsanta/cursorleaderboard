-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  screenshot_url TEXT NOT NULL,
  tokens BIGINT NOT NULL,
  agents INTEGER,
  tabs INTEGER,
  streak INTEGER,
  usage_percentile TEXT,
  top_models JSONB,
  joined_days_ago INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on tokens for faster leaderboard queries
CREATE INDEX idx_submissions_tokens ON submissions(tokens DESC);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert submissions
CREATE POLICY "Allow public inserts" ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow anyone to read submissions
CREATE POLICY "Allow public reads" ON submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public uploads to screenshots bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'screenshots');

-- Policy: Allow public reads from screenshots bucket
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'screenshots');

