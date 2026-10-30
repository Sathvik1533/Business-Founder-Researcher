-- Migration 001: Initialize Business Radar Schema
-- Run via: npx supabase db push

-- Enable PostGIS for spatial queries (Supabase includes it by default)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Core business entity
CREATE TABLE businesses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  category             TEXT,
  sub_category         TEXT,
  area                 TEXT,
  city                 TEXT DEFAULT 'Hyderabad',
  lat                  DECIMAL(10, 7),
  lng                  DECIMAL(10, 7),
  phone                TEXT,
  email                TEXT,
  whatsapp             TEXT,
  website              TEXT,
  instagram_handle     TEXT,
  instagram_url        TEXT,
  instagram_followers  INTEGER,
  google_place_id      TEXT UNIQUE,
  osm_id               TEXT,
  first_seen_at        TIMESTAMPTZ DEFAULT NOW(),
  estimated_open_date  DATE,
  source               TEXT CHECK (source IN ('google_maps', 'instagram', 'osm', 'manual')),
  description          TEXT,
  grok_summary         TEXT,
  lead_score           INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  outreach_status      TEXT DEFAULT 'new' CHECK (
                         outreach_status IN ('new', 'contacted', 'interested', 'closed', 'skip')
                       ),
  outreach_notes       TEXT,
  contacted_at         TIMESTAMPTZ,
  raw_data             JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape run log
CREATE TABLE scrape_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  finished_at  TIMESTAMPTZ,
  new_found    INTEGER DEFAULT 0,
  errors       INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

-- Source deduplication tracking
CREATE TABLE business_sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID REFERENCES businesses(id) ON DELETE CASCADE,
  source       TEXT,
  source_id    TEXT,
  source_url   TEXT,
  scraped_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_id)
);

-- Performance indexes
CREATE INDEX idx_businesses_area ON businesses(area);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_first_seen ON businesses(first_seen_at DESC);
CREATE INDEX idx_businesses_outreach ON businesses(outreach_status);
CREATE INDEX idx_businesses_source ON businesses(source);
CREATE INDEX idx_businesses_lead_score ON businesses(lead_score DESC);

-- Auto-update `updated_at` timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Supabase Realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
