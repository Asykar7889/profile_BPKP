import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  DEFAULT_RISK_THRESHOLDS,
  fetchRiskThresholds,
  validateThresholds,
  RiskThreshold,
} from '@/lib/riskThresholds';

export const dynamic = 'force-dynamic';

// GET: Ambil konfigurasi batas risiko saat ini
export async function GET() {
  try {
    const thresholds = await fetchRiskThresholds(isSupabaseConfigured ? supabase : null);
    return NextResponse.json({ success: true, thresholds });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat konfigurasi tingkat risiko.' },
      { status: 500 }
    );
  }
}

// POST: Simpan pembaruan konfigurasi batas risiko (Admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thresholds } = body as { thresholds: RiskThreshold[] };

    if (!thresholds || !Array.isArray(thresholds)) {
      return NextResponse.json(
        { success: false, error: 'Data thresholds tidak valid atau kosong.' },
        { status: 400 }
      );
    }

    // 1. Validasi batas angka, urutan menurun, dan hex color
    const validation = validateThresholds(thresholds);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 422 }
      );
    }

    // 2. Persist to Supabase jika terkonfigurasi
    if (isSupabaseConfigured && supabase) {
      for (const t of thresholds) {
        const { error } = await supabase
          .from('risk_thresholds')
          .upsert(
            {
              tier_key: t.tier_key,
              label: t.label.trim(),
              min_score: t.min_score,
              max_score: t.max_score,
              color_hex: t.color_hex.toUpperCase(),
              sort_order: t.sort_order,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tier_key' }
          );

        if (error) {
          console.error('[risk-thresholds POST] Supabase Error:', error);
          return NextResponse.json(
            { success: false, error: `Gagal menyimpan ke database: ${error.message}` },
            { status: 500 }
          );
        }
      }
    }

    // 3. Trigger cache invalidation pada Next.js agar halaman publik langsung segar
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/profil-umum');
    } catch {
      // Ignored in non-production static contexts
    }

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi tingkat risiko berhasil disimpan dan dipublikasikan.',
      thresholds,
    });
  } catch (error: any) {
    console.error('[/api/admin/risk-thresholds] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
