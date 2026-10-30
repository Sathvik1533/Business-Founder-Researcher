import { createClient } from '@supabase/supabase-js';
import { INITIAL_BUSINESSES } from './mock-data';
import { Business, RadarFilterState } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase_project_url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// In-memory store for local / demo mode
let localBusinesses: Business[] = [...INITIAL_BUSINESSES];

export async function fetchFilteredBusinesses(filters: RadarFilterState): Promise<Business[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('businesses').select('*');

      if (filters.area && filters.area !== 'all') {
        query = query.ilike('area', `%${filters.area}%`);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('outreach_status', filters.status);
      }
      if (filters.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('first_seen_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return filterByRecency(data as Business[], filters.recency);
      }
    } catch (e) {
      console.warn('Falling back to local cache due to Supabase error:', e);
    }
  }

  // Fallback to local memory store
  let res = [...localBusinesses];

  if (filters.area && filters.area !== 'all') {
    res = res.filter((b) => b.area.toLowerCase().includes(filters.area.toLowerCase()));
  }
  if (filters.category && filters.category !== 'all') {
    res = res.filter((b) => b.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.status && filters.status !== 'all') {
    res = res.filter((b) => b.outreach_status === filters.status);
  }
  if (filters.source && filters.source !== 'all') {
    res = res.filter((b) => b.source === filters.source);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    res = res.filter((b) =>
      b.name.toLowerCase().includes(s) ||
      (b.description && b.description.toLowerCase().includes(s)) ||
      (b.area && b.area.toLowerCase().includes(s))
    );
  }

  return filterByRecency(res, filters.recency);
}

function filterByRecency(items: Business[], recency: string): Business[] {
  if (recency === 'all') return items;
  const now = Date.now();
  const intervals: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
  };
  const maxDiff = intervals[recency];
  if (!maxDiff) return items;

  return items.filter((b) => {
    const seen = new Date(b.first_seen_at).getTime();
    return now - seen <= maxDiff;
  });
}

export async function updateBusinessOutreach(
  id: string,
  status: Business['outreach_status'],
  notes?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const updatePayload: Record<string, any> = { outreach_status: status };
      if (notes !== undefined) updatePayload.outreach_notes = notes;
      if (status === 'contacted') updatePayload.contacted_at = new Date().toISOString();

      const { error } = await supabase.from('businesses').update(updatePayload).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Failed to update Supabase, updating local state:', e);
    }
  }

  // Update in local state
  localBusinesses = localBusinesses.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        outreach_status: status,
        outreach_notes: notes !== undefined ? notes : b.outreach_notes,
        contacted_at: status === 'contacted' ? new Date().toISOString() : b.contacted_at,
      };
    }
    return b;
  });

  return true;
}
