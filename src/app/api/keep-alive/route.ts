import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await supabase
      .from('risk_thresholds')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 'alive', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
