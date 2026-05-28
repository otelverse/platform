CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  query TEXT NOT NULL,
  condition JSONB NOT NULL,
  interval_seconds INT NOT NULL,
  notification_channel_ids TEXT[],
  state TEXT DEFAULT 'OK',
  last_evaluated_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  state TEXT NOT NULL,
  query_result_count INT,
  notification_sent BOOLEAN DEFAULT false
);
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS silence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matchers JSONB NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  comment TEXT
);
