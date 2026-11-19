import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getTierByScore, roundTo2Decimals } from '@/lib/scoringEngine';

export const dynamic = 'force-dynamic';

// GET: Fetch all audit logs chronologically
export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('input_history_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, logs: data });
      }
    }

    return NextResponse.json({ success: true, logs: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil riwayat audit log.' },
      { status: 500 }
    );
  }
}

// POST: Handle EDIT and REVERT actions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, log_id, override_score, override_notes } = body;

    if (!log_id || !action || !['EDIT', 'REVERT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Parameter log_id dan action ("EDIT" | "REVERT") wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. REVERT ACTION (Rollback to old_score)
    if (action === 'REVERT') {
      let targetLog = null;
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('input_history_logs')
          .select('*')
          .eq('id', log_id)
          .single();
        targetLog = data;
      }

      const rawOldScore = targetLog?.skor_lama ?? targetLog?.old_score ?? 60.0;
      const restoredScore = roundTo2Decimals(Number(rawOldScore));
      const restoredTier = getTierByScore(restoredScore);

      if (isSupabaseConfigured && supabase && targetLog) {
        const targetCityCode = targetLog.kode_wilayah || targetLog.city_code;
        const targetYear = targetLog.tahun || targetLog.year;

        // A. Restore city_surveys
        await supabase
          .from('city_surveys')
          .update({
            total_score: restoredScore,
            skor_total: restoredScore,
            risk_category: restoredTier.label,
            kategori_risiko: restoredTier.label,
            updated_at: new Date().toISOString(),
          })
          .eq('city_code', targetCityCode)
          .eq('year', targetYear);

        // B. Mark log as reverted
        await supabase
          .from('input_history_logs')
          .update({
            status: 'reverted',
            action_type: 'REVERT',
          })
          .eq('id', log_id);
      }

      return NextResponse.json({
        success: true,
        action: 'REVERT',
        log_id,
        restored_score: restoredScore,
        risk_category: restoredTier.label,
        message: `Skor berhasil di-rollback ke skor awal ${restoredScore.toFixed(2)} (${restoredTier.label}).`,
      });
    }

    // 2. EDIT ACTION (Admin Manual Override)
    if (action === 'EDIT') {
      const parsedScore = Number(override_score);
      if (isNaN(parsedScore)) {
        return NextResponse.json(
          { success: false, error: 'Nilai override_score wajib berupa angka valid.' },
          { status: 400 }
        );
      }

      const clampedScore = roundTo2Decimals(Math.max(0.0, Math.min(100.0, parsedScore)));
      const newTier = getTierByScore(clampedScore);

      let targetLog = null;
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('input_history_logs')
          .select('*')
          .eq('id', log_id)
          .single();
        targetLog = data;
      }

      if (isSupabaseConfigured && supabase && targetLog) {
        const targetCityCode = targetLog.kode_wilayah || targetLog.city_code;
        const targetYear = targetLog.tahun || targetLog.year;

        // A. Update city_surveys
        await supabase
          .from('city_surveys')
          .update({
            total_score: clampedScore,
            skor_total: clampedScore,
            risk_category: newTier.label,
            kategori_risiko: newTier.label,
            updated_at: new Date().toISOString(),
          })
          .eq('city_code', targetCityCode)
          .eq('year', targetYear);

        // B. Mark log as edited with updated score
        await supabase
          .from('input_history_logs')
          .update({
            new_score: clampedScore,
            skor_baru: clampedScore,
            kategori_baru: newTier.label,
            status: 'edited',
            action_type: 'EDIT_ADMIN',
          })
          .eq('id', log_id);
      }

      return NextResponse.json({
        success: true,
        action: 'EDIT',
        log_id,
        updated_score: clampedScore,
        risk_category: newTier.label,
        message: `Koreksi skor admin sebesar ${clampedScore.toFixed(2)} (${newTier.label}) berhasil disimpan.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (error: any) {
    console.error('[/api/admin/history] Internal Server Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan sistem saat memproses audit log.' },
      { status: 500 }
    );
  }
}
