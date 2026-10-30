import { NextRequest, NextResponse } from 'next/server';
import { updateBusinessOutreach } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing business id or status' },
        { status: 400 }
      );
    }

    const ok = await updateBusinessOutreach(id, status, notes);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update outreach' },
      { status: 500 }
    );
  }
}
