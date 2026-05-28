CREATE TABLE IF NOT EXISTS chaos_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_service TEXT NOT NULL,
  target_span_name TEXT,
  fault_type TEXT NOT NULL,
  config JSONB NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  creator TEXT
);
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  definition JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
