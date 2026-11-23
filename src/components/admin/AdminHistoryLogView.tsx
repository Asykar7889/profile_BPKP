'use client';

import React, { useState, useMemo } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { InputHistoryLog } from '@/types/spi';
import { formatScore, getTierByScore, roundTo2Decimals } from '@/lib/scoringEngine';
import {
  X,
  History,
  RotateCcw,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AdminHistoryLogViewProps {
  isPage?: boolean;
}

export default function AdminHistoryLogView({ isPage = false }: AdminHistoryLogViewProps) {
  const {
    historyLogs,
    isAdminHistoryOpen,
    setIsAdminHistoryOpen,
    openPegawaiInputForCity,
    rollbackSurvey,
    surveys,
    thresholds,
  } = useSpiDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [confirmRollbackId, setConfirmRollbackId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      const matchSearch =
        log.nama_wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.nama_pegawai.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.kode_wilayah.includes(searchQuery);

      const matchAction = actionFilter === 'ALL' || log.action_type === actionFilter;

      return matchSearch && matchAction;
    });
  }, [historyLogs, searchQuery, actionFilter]);

  if (!isPage && !isAdminHistoryOpen) return null;

  const handleTriggerRollback = async (log: InputHistoryLog) => {
    setIsProcessing(true);
    const ok = await rollbackSurvey(log.id);
    setIsProcessing(false);
    setConfirmRollbackId(null);

    if (ok) {
      setFeedbackMsg({
        text: `Data ${log.nama_wilayah} berhasil di-rollback ke skor ${formatScore(log.skor_lama)}!`,
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({
        text: 'Gagal melakukan rollback data.',
        type: 'error',
      });
    }
  };

  const handleDirectEdit = (kodeWilayah: string) => {
    const targetCity = surveys.find((s) => s.kode_wilayah === kodeWilayah);
    if (targetCity) {
      setIsAdminHistoryOpen(false);
      openPegawaiInputForCity(targetCity);
    }
  };

  const bodyContent = (
    <div
      className={`w-full max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden relative ${
        isPage ? 'shadow-sm max-h-none' : 'max-h-[92vh] shadow-2xl'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between relative flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-white">
                Audit Log & History Input Survei SPI
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                Role: Admin BPKP
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Pencatatan Audit Trail Immutable, Komparasi Skor Lama vs Baru & Kontrol Rollback
            </p>
          </div>
        </div>

        {!isPage && (
          <button
            onClick={() => setIsAdminHistoryOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari wilayah atau pegawai..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 font-bold">Aksi:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:outline-none text-slate-800"
            >
              <option value="ALL">Semua Tipe Aksi</option>
              <option value="CREATE">CREATE (Inisialisasi)</option>
              <option value="UPDATE">UPDATE (Input Pegawai)</option>
              <option value="EDIT_ADMIN">EDIT_ADMIN (Koreksi)</option>
              <option value="REVERT">REVERT (Rollback)</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-2 stroke-1" />
              <p className="text-xs font-medium">Tidak ada riwayat log yang sesuai kriteria pencarian.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Petugas / Pegawai</th>
                    <th className="py-3 px-4">Wilayah & Tahun</th>
                    <th className="py-3 px-4">Tipe Aksi</th>
                    <th className="py-3 px-4">Komparasi Skor (Lama $\rightarrow$ Baru)</th>
                    <th className="py-3 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLogs.map((log) => {
                    const delta = roundTo2Decimals(log.skor_baru - log.skor_lama);
                    const oldTier = getTierByScore(log.skor_lama, thresholds);
                    const newTier = getTierByScore(log.skor_baru, thresholds);

                    const actionBadge = {
                      CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
                      EDIT_ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
                      REVERT: 'bg-purple-50 text-purple-700 border-purple-200',
                    }[log.action_type] || 'bg-slate-50 text-slate-700 border-slate-200';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Waktu */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Petugas */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800">{log.nama_pegawai}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{log.pegawai_id}</span>
                        </td>

                        {/* Wilayah */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">{log.nama_wilayah}</span>
                          <span className="text-[10px] text-slate-500">
                            Kode: {log.kode_wilayah} • Thn {log.tahun}
                          </span>
                        </td>

                        {/* Tipe Aksi */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${actionBadge}`}
                          >
                            {log.action_type}
                          </span>
                        </td>

                        {/* Komparasi Skor & Delta */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-xs">
                              {formatScore(log.skor_lama)}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className="font-mono text-xs font-black"
                              style={{ color: newTier.hex }}
                            >
                              {formatScore(log.skor_baru)}
                            </span>

                            {/* Delta pill */}
                            {delta !== 0 && (
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                  delta > 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {delta > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi Admin: Edit & Rollback */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Direct Edit Button */}
                            <button
                              onClick={() => handleDirectEdit(log.kode_wilayah)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Edit indikator wilayah ini"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            {/* Rollback Button */}
                            {confirmRollbackId === log.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                                <span className="text-[10px] text-rose-700 font-bold px-1">
                                  Yakin Revert?
                                </span>
                                <button
                                  onClick={() => handleTriggerRollback(log)}
                                  disabled={isProcessing}
                                  className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black hover:bg-rose-700"
                                >
                                  Ya
                                </button>
                                <button
                                  onClick={() => setConfirmRollbackId(null)}
                                  className="px-1.5 py-0.5 text-slate-500 text-[10px] hover:text-slate-800"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRollbackId(log.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Kembalikan skor ke versi sebelumnya"
                              >
                                <RotateCcw className="w-3 h-3 text-indigo-600" />
                                <span>Revert</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Seluruh riwayat perubahan tersimpan permanen di tabel audit log PostgreSQL (`input_history_logs`).
            </span>
          </div>

          {!isPage && (
            <button
              onClick={() => setIsAdminHistoryOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
  );

  if (isPage) {
    return <div className="w-full flex justify-center">{bodyContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      {bodyContent}
    </div>
  );
}
