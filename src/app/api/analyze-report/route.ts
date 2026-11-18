import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { INITIAL_CITY_SURVEYS_2026 } from '@/data/sumselInitialData';
import { getTierByScore, roundTo2Decimals } from '@/lib/scoringEngine';

interface AiAnalysisSchema {
  delta_score: number;
  category_impact: 'internal' | 'eksternal' | 'eksper';
  ai_reasoning: string;
  recommendation: string;
}

// Fallback deterministic rule-based evaluator if external AI key is absent or unreachable
function analyzeReportDeterministically(text: string, cityName: string): AiAnalysisSchema {
  const lower = text.toLowerCase();

  let delta = 0;
  let impact: 'internal' | 'eksternal' | 'eksper' = 'internal';
  const reasonPoints: string[] = [];
  const recPoints: string[] = [];

  // Severe Vulnerabilities (-3.0 to -15.0)
  if (lower.includes('ott') || lower.includes('tangkap tangan') || lower.includes('tersangka korupsi')) {
    delta -= 8.5;
    impact = 'internal';
    reasonPoints.push('Terdapat indikasi penindakan hukum / OTT pada pejabat daerah');
    recPoints.push('Lakukan audit investigatif darurat bersama BPKP dan reformasi unit terkait.');
  }
  if (lower.includes('temuan bpk') || lower.includes('kekurangan volume') || lower.includes('proyek mangkrak') || lower.includes('fiktif')) {
    delta -= 5.0;
    impact = 'internal';
    reasonPoints.push('Temuan signifikan atas kekurangan fisik pekerjaan atau ketidakwajaran SPJ');
    recPoints.push('Perketat verifikasi pembayaran termyn dan blacklist kontraktor bermasalah.');
  }
  if (lower.includes('pungli') || lower.includes('calo') || lower.includes('uang pelicin') || lower.includes('biaya siluman')) {
    delta -= 4.0;
    impact = 'eksternal';
    reasonPoints.push('Pengaduan masyarakat atas praktik pungutan liar dalam pelayanan publik');
    recPoints.push('Terapkan loket pelayanan mandiri dan sistem pembayaran nontunai (QRIS/CMS).');
  }
  if (lower.includes('nepotisme') || lower.includes('jual beli jabatan') || lower.includes('honorer')) {
    delta -= 3.5;
    impact = 'internal';
    reasonPoints.push('Kelemahan sistem merit dalam mutasi dan pengisian jabatan birokrasi');
    recPoints.push('Implementasikan sistem talent pool berbasis meritokrasi terbuka.');
  }

  // Positive Reforms (+1.0 to +10.0)
  if (lower.includes('iso 37001') || lower.includes('sistem manajemen anti penyuapan') || lower.includes('smap')) {
    delta += 4.5;
    impact = 'internal';
    reasonPoints.push('Penerapan sertifikasi SMAP ISO 37001 memperkuat mitigasi risiko suap');
    recPoints.push('Pertahankan kepatuhan berkala audit surveilans independen.');
  }
  if (lower.includes('digitalisasi') || lower.includes('antrean online') || lower.includes('e-katalog') || lower.includes('nontunai')) {
    delta += 3.0;
    impact = 'eksternal';
    reasonPoints.push('Modernisasi layanan publik berbasis digital berhasil memangkas interaksi calo');
    recPoints.push('Perluas integrasi digital hingga ke kantor kecamatan dan pelosok desa.');
  }
  if (lower.includes('wbk') || lower.includes('wbbm') || lower.includes('zona integritas')) {
    delta += 3.5;
    impact = 'eksper';
    reasonPoints.push('Penghargaan predikat Zona Integritas (WBK/WBBM) dari KemenPAN-RB');
    recPoints.push('Jadikan unit percontohan sebagai benchmark bagi OPD lainnya.');
  }
  if (lower.includes('wbs') || lower.includes('whistleblowing') || lower.includes('lhkpn 100%')) {
    delta += 2.0;
    impact = 'internal';
    reasonPoints.push('Tingkat kepatuhan pelaporan LHKPN mencapai target dan kanal aduan aktif');
    recPoints.push('Tingkatkan sosialisasi perlindungan pelapor (whistleblower) internal.');
  }

  // Default neutral sentiment if no strong keywords matched
  if (delta === 0) {
    if (lower.includes('perbaikan') || lower.includes('meningkat') || lower.includes('tertib')) {
      delta = 1.5;
      impact = 'eksternal';
      reasonPoints.push('Terdapat tren perbaikan tata kelola dan efisiensi prosedur dinas');
      recPoints.push('Lanjutkan monitoring berkala implementasi sistem pengendalian internal.');
    } else {
      delta = -1.5;
      impact = 'internal';
      reasonPoints.push('Perlu percepatan tindak lanjut rekomendasi SPI di wilayah ini');
      recPoints.push('Tingkatkan kepatuhan SOP pelayanan dan pengawasan berjenjang oleh atasan langsung.');
    }
  }

  // Clamp delta between -15.0 and +10.0
  const clampedDelta = Math.max(-15.0, Math.min(10.0, roundTo2Decimals(delta)));

  return {
    delta_score: clampedDelta,
    category_impact: impact,
    ai_reasoning: reasonPoints.join('. ') || `Evaluasi laporan integritas wilayah ${cityName}.`,
    recommendation: recPoints.join('. ') || 'Lakukan penguatan sistem pengendalian internal pemerintah (SPIP) terintegrasi.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      city_code,
      year = 2026,
      report_text,
      submitted_by = null,
      submitted_by_name = 'Pegawai Verifikator SPI',
    } = body;

    if (!city_code || !report_text || typeof report_text !== 'string' || report_text.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Parameter city_code dan report_text (minimal 5 karakter) wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Fetch current city survey baseline
    let currentSurvey = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('city_surveys')
          .select('*')
          .eq('city_code', city_code)
          .eq('year', Number(year))
          .single();
        if (data) currentSurvey = data;
      } catch {
        // Fallback below
      }
    }

    if (!currentSurvey) {
      const fallback = INITIAL_CITY_SURVEYS_2026.find((s) => s.kode_wilayah === String(city_code));
      if (!fallback) {
        return NextResponse.json(
          { success: false, error: `Wilayah dengan kode ${city_code} tidak ditemukan.` },
          { status: 404 }
        );
      }
      currentSurvey = {
        city_code: fallback.kode_wilayah,
        city_name: fallback.nama_wilayah,
        total_score: fallback.skor_total,
        year: fallback.tahun,
        risk_category: fallback.kategori_risiko,
        recommendation: 'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
      };
    }

    const cityName = currentSurvey.city_name || currentSurvey.nama_wilayah;
    const oldScore = roundTo2Decimals(Number(currentSurvey.total_score || currentSurvey.skor_total));

    // 2. Perform AI Text Analysis (Gemini / OpenAI with Deterministic Fallback)
    let analysisResult: AiAnalysisSchema | null = null;
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const prompt = `Anda adalah Auditor Investigasi dan Analis Integritas Senior BPKP.
Tugas: Evaluasi narasi hasil pengawasan lapangan pada Kabupaten/Kota di Sumatera Selatan berikut:
Wilayah: ${cityName} (Kode: ${city_code})
Skor SPI Baseline Saat Ini: ${oldScore} / 100
Teks Laporan Lapangan:
"""
${report_text}
"""

Berikan penilaian dampak terhadap skor integritas secara objektif dan deterministik dalam format JSON persis sesuai schema:
{
  "delta_score": <angka float desimal antara -15.0 s.d. +10.0, bernilai positif jika ada reformasi/prestasi integritas, bernilai negatif jika ada pelanggaran/pungli/temuan>,
  "category_impact": <pilih salah satu dari: "internal", "eksternal", "eksper">,
  "ai_reasoning": <penjelasan ringkas alasan penilaian dalam bahasa Indonesia, maks 2 kalimat>,
  "recommendation": <rekomendasi aksi pencegahan korupsi konkret untuk Pemda/BPKP, maks 2 kalimat>
}
HANYA kembalikan string JSON valid tanpa format markdown tambahan.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const geminiData = await response.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText.trim().replace(/^```json\s*|\s*```$/g, ''));
            if (typeof parsed.delta_score === 'number' && parsed.ai_reasoning) {
              analysisResult = {
                delta_score: Math.max(-15.0, Math.min(10.0, roundTo2Decimals(parsed.delta_score))),
                category_impact: ['internal', 'eksternal', 'eksper'].includes(parsed.category_impact)
                  ? parsed.category_impact
                  : 'internal',
                ai_reasoning: parsed.ai_reasoning,
                recommendation: parsed.recommendation || 'Tingkatkan implementasi pengawasan intern.',
              };
            }
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Pipeline] Gemini API fallback triggered:', geminiErr);
      }
    }

    // If Gemini was not configured or call failed, use our deterministic semantic analyzer
    if (!analysisResult) {
      analysisResult = analyzeReportDeterministically(report_text, cityName);
    }

    // 3. Score Clamping (Strict 0.00 to 100.00 bounds)
    const deltaScore = analysisResult.delta_score;
    const rawNewScore = oldScore + deltaScore;
    const newScore = roundTo2Decimals(Math.max(0.0, Math.min(100.0, rawNewScore)));
    const newTier = getTierByScore(newScore);

    // 4. Persistence to Supabase (if configured)
    let logId = `log-${Date.now()}`;

    if (isSupabaseConfigured && supabase) {
      try {
        // A. Insert audit log
        const { data: logData, error: logError } = await supabase
          .from('input_history_logs')
          .insert({
            city_code: String(city_code),
            city_name: cityName,
            year: Number(year),
            submitted_by_name: submitted_by_name,
            report_text: report_text,
            old_score: oldScore,
            delta_score: deltaScore,
            new_score: newScore,
            category_impact: analysisResult.category_impact,
            ai_reasoning: analysisResult.ai_reasoning,
            status: 'applied',
            action_type: 'UPDATE',
          })
          .select('id')
          .single();

        if (logData?.id) {
          logId = logData.id;
        }

        // B. Update city_surveys
        await supabase
          .from('city_surveys')
          .update({
            total_score: newScore,
            risk_category: newTier.label,
            recommendation: analysisResult.recommendation,
            updated_at: new Date().toISOString(),
          })
          .eq('city_code', city_code)
          .eq('year', Number(year));
      } catch (dbErr) {
        console.error('[AI Pipeline] Database persistence error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      city_code: String(city_code),
      city_name: cityName,
      year: Number(year),
      old_score: oldScore,
      delta_score: deltaScore,
      new_score: newScore,
      risk_category: newTier.label,
      category_impact: analysisResult.category_impact,
      ai_reasoning: analysisResult.ai_reasoning,
      recommendation: analysisResult.recommendation,
      log_id: logId,
    });
  } catch (error: any) {
    console.error('[/api/analyze-report] Internal Server Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan sistem saat menganalisis laporan.' },
      { status: 500 }
    );
  }
}
