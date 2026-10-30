export type OutreachStatus = 'new' | 'contacted' | 'interested' | 'closed' | 'skip';

export type BusinessCategory =
  | 'Food & Beverage'
  | 'Clothing & Fashion'
  | 'Beauty & Wellness'
  | 'Fitness'
  | 'Retail'
  | 'Health'
  | 'Services'
  | 'Tech'
  | 'Other';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory | string;
  sub_category?: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram_handle?: string | null;
  instagram_url?: string | null;
  instagram_followers?: number | null;
  google_place_id?: string | null;
  osm_id?: string | null;
  first_seen_at: string; // ISO date
  estimated_open_date?: string | null;
  source: 'google_maps' | 'instagram' | 'osm' | 'manual';
  description?: string | null;
  grok_summary?: string | null;
  lead_score: number; // 0 - 100
  outreach_status: OutreachStatus;
  outreach_notes?: string | null;
  contacted_at?: string | null;
}

export interface RadarFilterState {
  area: string;
  category: string;
  recency: 'all' | '24h' | '7d' | '30d' | '6m';
  search: string;
  status: 'all' | OutreachStatus;
  source: 'all' | 'google_maps' | 'instagram' | 'osm';
}

export interface AreaStat {
  name: string;
  count: number;
  lat: number;
  lng: number;
}
