import { NextRequest, NextResponse } from 'next/server';
import { fetchFilteredBusinesses } from '@/lib/supabase';
import { RadarFilterState } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: RadarFilterState = {
    area: searchParams.get('area') || 'all',
    category: searchParams.get('category') || 'all',
    recency: (searchParams.get('recency') as RadarFilterState['recency']) || 'all',
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as RadarFilterState['status']) || 'all',
    source: (searchParams.get('source') as RadarFilterState['source']) || 'all',
  };

  try {
    const businesses = await fetchFilteredBusinesses(filters);
    return NextResponse.json({
      success: true,
      count: businesses.length,
      businesses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}
