-- ====================================================================
-- Thai Disaster Map - PostgreSQL & Supabase Database Schema
-- Designed for Real-time & Near Real-time Disaster Monitoring
-- ====================================================================

-- 1. Enable PostGIS extension for Geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enumerated types
CREATE TYPE disaster_type AS ENUM (
  'flood',
  'heavy_rain',
  'thunderstorm',
  'storm',
  'earthquake',
  'landslide',
  'wildfire',
  'strong_wind',
  'alert'
);

CREATE TYPE severity_level AS ENUM (
  'normal',
  'watch',
  'warning',
  'danger'
);

CREATE TYPE disaster_status AS ENUM (
  'active',
  'monitoring',
  'resolving',
  'resolved'
);

CREATE TYPE confidence_level AS ENUM (
  'high',
  'medium',
  'low'
);

-- 3. Data Sources Table
CREATE TABLE IF NOT EXISTS disaster_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'GISTDA', 'TMD', 'USGS', 'DDPM', 'NASA_FIRMS'
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  official_url TEXT,
  api_endpoint TEXT,
  update_frequency VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Thailand Locations (Provinces & Districts)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_code VARCHAR(10) NOT NULL,
  province_th VARCHAR(100) NOT NULL,
  province_en VARCHAR(100) NOT NULL,
  district_th VARCHAR(100),
  district_en VARCHAR(100),
  region VARCHAR(50) NOT NULL, -- 'north', 'northeast', 'central', 'east', 'west', 'south'
  geom GEOMETRY(Point, 4326),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_locations_province_th ON locations(province_th);

-- 5. Main Disaster Events Table
CREATE TABLE IF NOT EXISTS disaster_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code VARCHAR(100) UNIQUE,
  type disaster_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  subdistrict VARCHAR(100),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity severity_level NOT NULL DEFAULT 'watch',
  status disaster_status NOT NULL DEFAULT 'active',
  source_id UUID REFERENCES disaster_sources(id),
  source_code VARCHAR(50) NOT NULL,
  source_url TEXT,
  confidence confidence_level DEFAULT 'high',
  is_demo BOOLEAN DEFAULT FALSE,
  reported_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  
  -- Disaster specific metrics
  affected_people INTEGER DEFAULT 0,
  affected_households INTEGER DEFAULT 0,
  depth_cm NUMERIC(6, 2),        -- For floods
  rainfall_mm_24h NUMERIC(6, 2),  -- For rainfall
  magnitude NUMERIC(3, 1),       -- For earthquake
  depth_km NUMERIC(5, 2),        -- For earthquake
  hotspot_count INTEGER,         -- For wildfire
  wind_speed_kmh NUMERIC(5, 1),   -- For storm
  guidelines JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disaster_events_geom ON disaster_events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_disaster_events_type ON disaster_events(type);
CREATE INDEX IF NOT EXISTS idx_disaster_events_severity ON disaster_events(severity);
CREATE INDEX IF NOT EXISTS idx_disaster_events_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_disaster_events_province ON disaster_events(province);
CREATE INDEX IF NOT EXISTS idx_disaster_events_updated_at ON disaster_events(updated_at DESC);

-- 6. Alerts & Broadcast Notifications Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_event_id UUID REFERENCES disaster_events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_provinces TEXT[] NOT NULL,
  severity severity_level NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Saved Locations & Notification Settings
CREATE TABLE IF NOT EXISTS user_saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- For future Supabase Auth
  client_uuid UUID NOT NULL, -- Anonymous client ID from localStorage
  province_name VARCHAR(100) NOT NULL,
  district_name VARCHAR(100),
  notify_on_watch BOOLEAN DEFAULT FALSE,
  notify_on_warning BOOLEAN DEFAULT TRUE,
  notify_on_danger BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Spatial query function: Find active events within radius of a point
CREATE OR REPLACE FUNCTION get_disasters_within_radius(
  target_lat DOUBLE PRECISION,
  target_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (
  id UUID,
  type disaster_type,
  title VARCHAR,
  province VARCHAR,
  district VARCHAR,
  distance_km DOUBLE PRECISION,
  severity severity_level,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.type,
    d.title,
    d.province,
    d.district,
    ST_Distance(d.geom::geography, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography) / 1000.0 AS distance_km,
    d.severity,
    d.updated_at
  FROM disaster_events d
  WHERE d.status IN ('active', 'monitoring')
    AND ST_DWithin(d.geom::geography, ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography, radius_km * 1000)
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;
