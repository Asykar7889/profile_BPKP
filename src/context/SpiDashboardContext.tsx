'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  CitySurvey,
  InputHistoryLog,
  ProvincialSummary,
  RiskTierKey,
  UserProfile,
  UserRole,
} from '@/types/spi';
import { getTierByScore, roundTo2Decimals } from '@/lib/scoringEngine';
import {
  RiskThreshold,
  DEFAULT_RISK_THRESHOLDS,
  fetchRiskThresholds,
} from '@/lib/riskThresholds';
import { INITIAL_CITY_SURVEYS_2026, INITIAL_HISTORY_LOGS } from '@/data/sumselInitialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface SpiDashboardContextType {
  surveys: CitySurvey[];
  activeCity: CitySurvey | null;
  hoveredCity: CitySurvey | null;
  selectedYear: number;
  isHeatmapActive: boolean;
  selectedTierFilter: RiskTierKey | null;
  hoveredTierFilter: RiskTierKey | null;
  searchQuery: string;
  summary: ProvincialSummary;
  currentUser: UserProfile | null;
  userRole: UserRole;
  historyLogs: InputHistoryLog[];
  thresholds: RiskThreshold[];
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isPegawaiInputOpen: boolean;
  isAdminHistoryOpen: boolean;
  isAdminRiskSettingsOpen: boolean;
  editingCityForInput: CitySurvey | null;
  setActiveCity: (city: CitySurvey | null) => void;
  setHoveredCity: (city: CitySurvey | null) => void;
  setSelectedYear: (year: number) => void;
  setIsHeatmapActive: (active: boolean) => void;
  toggleHeatmap: () => void;
  setSelectedTierFilter: (tier: RiskTierKey | null) => void;
  setHoveredTierFilter: (tier: RiskTierKey | null) => void;
  setSearchQuery: (query: string) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsPegawaiInputOpen: (open: boolean) => void;
  setIsAdminHistoryOpen: (open: boolean) => void;
  setIsAdminRiskSettingsOpen: (open: boolean) => void;
  openPegawaiInputForCity: (city?: CitySurvey | null) => void;
  loginUser: (role: 'pegawai' | 'admin', name?: string, email?: string) => void;
  logoutUser: () => void;
  saveAndPublishSurvey: (updatedSurvey: CitySurvey, pegawaiName?: string) => Promise<boolean>;
  rollbackSurvey: (logId: string) => Promise<boolean>;
  updateThresholds: (newThresholds: RiskThreshold[]) => Promise<boolean>;
  resetToProvince: () => void;
}

export const SpiDashboardContext = createContext<SpiDashboardContextType | null>(null);

export function SpiDashboardProvider({ children }: { children: React.ReactNode }) {
  const [surveys, setSurveys] = useState<CitySurvey[]>(INITIAL_CITY_SURVEYS_2026);
  const [activeCity, setActiveCity] = useState<CitySurvey | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CitySurvey | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<RiskTierKey | null>(null);
  const [hoveredTierFilter, setHoveredTierFilter] = useState<RiskTierKey | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPegawaiInputOpen, setIsPegawaiInputOpen] = useState<boolean>(false);
  const [isAdminHistoryOpen, setIsAdminHistoryOpen] = useState<boolean>(false);
  const [isAdminRiskSettingsOpen, setIsAdminRiskSettingsOpen] = useState<boolean>(false);
  const [editingCityForInput, setEditingCityForInput] = useState<CitySurvey | null>(null);

  // Dynamic Risk Thresholds State
  const [thresholds, setThresholds] = useState<RiskThreshold[]>(DEFAULT_RISK_THRESHOLDS);

  // Audit Logs State
  const [historyLogs, setHistoryLogs] = useState<InputHistoryLog[]>(INITIAL_HISTORY_LOGS);

  const userRole: UserRole = currentUser ? currentUser.role : 'public';

  // Load dynamic thresholds on mount
  useEffect(() => {
    async function loadDynamicThresholds() {
      try {
        if (isSupabaseConfigured && supabase) {
          const remote = await fetchRiskThresholds(supabase);
          setThresholds(remote);
        }
      } catch (err) {
        console.warn('Gagal memuat batas risiko dari Supabase, menggunakan default:', err);
      }
    }
    loadDynamicThresholds();
  }, []);

  // Update & Persist Thresholds
  const updateThresholds = useCallback(
    async (newThresholds: RiskThreshold[]): Promise<boolean> => {
      try {
        setIsLoading(true);
        // Instant local update for zero latency
        setThresholds(newThresholds);

        // Persist to Supabase if configured
        if (isSupabaseConfigured && supabase) {
          for (const t of newThresholds) {
            await supabase.from('risk_thresholds').upsert(
              {
                tier_key: t.tier_key,
                label: t.label,
                min_score: t.min_score,
                max_score: t.max_score,
                color_hex: t.color_hex,
                sort_order: t.sort_order,
                updated_at: new Date().toISOString(),
                updated_by: currentUser?.id,
              },
              { onConflict: 'tier_key' }
            );
          }
        }

        // Call API to trigger server cache revalidation
        try {
          await fetch('/api/admin/risk-thresholds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thresholds: newThresholds }),
          });
        } catch {
          // Ignore offline errors
        }

        return true;
      } catch (err) {
        console.error('Failed to update thresholds:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Toggle Heatmap
  const toggleHeatmap = useCallback(() => {
    setIsHeatmapActive((prev) => !prev);
  }, []);

  // Reset to Province
  const resetToProvince = useCallback(() => {
    setActiveCity(null);
    setHoveredCity(null);
    setSelectedTierFilter(null);
    setHoveredTierFilter(null);
  }, []);

  // Login handler
  const loginUser = useCallback((role: 'pegawai' | 'admin', name?: string, email?: string) => {
    const demoUser: UserProfile = {
      id: role === 'admin' ? 'usr-admin-1' : 'usr-pegawai-1',
      full_name: name || (role === 'admin' ? 'Admin BPKP Sumsel' : 'Pegawai Verifikator SPI'),
      email: email || (role === 'admin' ? 'admin.bpkp@sumselprov.go.id' : 'pegawai.spi@sumselprov.go.id'),
      role,
    };
    setCurrentUser(demoUser);
    setIsAuthModalOpen(false);
  }, []);

  // Logout handler
  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    setIsPegawaiInputOpen(false);
    setIsAdminHistoryOpen(false);
    setIsAdminRiskSettingsOpen(false);
  }, []);

  // Open Pegawai input modal
  const openPegawaiInputForCity = useCallback((city?: CitySurvey | null) => {
    setEditingCityForInput(city || activeCity || surveys[0]);
    setIsPegawaiInputOpen(true);
  }, [activeCity, surveys]);

  // Real-Time Auto-Publish Survey
  const saveAndPublishSurvey = useCallback(async (updatedSurvey: CitySurvey, pegawaiName?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const oldSurvey = surveys.find((s) => s.kode_wilayah === updatedSurvey.kode_wilayah) || updatedSurvey;

      const newLog: InputHistoryLog = {
        id: `log-${Date.now()}`,
        survey_id: updatedSurvey.id,
        kode_wilayah: updatedSurvey.kode_wilayah,
        nama_wilayah: updatedSurvey.nama_wilayah,
        tahun: updatedSurvey.tahun,
        pegawai_id: currentUser?.id || 'usr-pegawai-1',
        nama_pegawai: pegawaiName || currentUser?.full_name || 'Pegawai Input Lapangan',
        action_type: currentUser?.role === 'admin' ? 'EDIT_ADMIN' : 'UPDATE',
        skor_lama: oldSurvey.skor_total,
        kategori_lama: oldSurvey.kategori_risiko,
        skor_baru: updatedSurvey.skor_total,
        kategori_baru: updatedSurvey.kategori_risiko,
        old_payload: oldSurvey,
        new_payload: updatedSurvey,
        created_at: new Date().toISOString(),
      };

      // 1. Update live state immediately (Zero latency for public map)
      setSurveys((prev) =>
        prev.map((s) => (s.kode_wilayah === updatedSurvey.kode_wilayah ? updatedSurvey : s))
      );
      setHistoryLogs((prev) => [newLog, ...prev]);

      if (activeCity?.kode_wilayah === updatedSurvey.kode_wilayah) {
        setActiveCity(updatedSurvey);
      }

      // 2. Persist to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const dimInternal = updatedSurvey.dimensions?.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi ?? 0;
        const dimEksternal = updatedSurvey.dimensions?.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi ?? 0;
        const dimEksper = updatedSurvey.dimensions?.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi ?? 0;
        const dimKoreksi = updatedSurvey.dimensions?.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi ?? 0;

        await supabase.from('city_surveys').upsert({
          id: updatedSurvey.id,
          city_code: updatedSurvey.kode_wilayah,
          kode_wilayah: updatedSurvey.kode_wilayah,
          city_name: updatedSurvey.nama_wilayah,
          nama_wilayah: updatedSurvey.nama_wilayah,
          tipe_wilayah: updatedSurvey.tipe_wilayah,
          year: updatedSurvey.tahun,
          tahun: updatedSurvey.tahun,
          total_score: updatedSurvey.skor_total,
          skor_total: updatedSurvey.skor_total,
          internal_score: dimInternal,
          external_score: dimEksternal,
          expert_score: dimEksper,
          correction_factor: dimKoreksi,
          risk_category: updatedSurvey.kategori_risiko,
          kategori_risiko: updatedSurvey.kategori_risiko,
          respondent_count: updatedSurvey.jumlah_responden,
          jumlah_responden: updatedSurvey.jumlah_responden,
          updated_at: new Date().toISOString(),
        });

        await supabase.from('input_history_logs').insert({
          id: newLog.id,
          survey_id: updatedSurvey.id,
          city_code: updatedSurvey.kode_wilayah,
          kode_wilayah: updatedSurvey.kode_wilayah,
          city_name: updatedSurvey.nama_wilayah,
          nama_wilayah: updatedSurvey.nama_wilayah,
          year: updatedSurvey.tahun,
          tahun: updatedSurvey.tahun,
          pegawai_id: newLog.pegawai_id,
          nama_pegawai: newLog.nama_pegawai,
          action_type: newLog.action_type,
          skor_lama: oldSurvey.skor_total,
          kategori_lama: oldSurvey.kategori_risiko,
          skor_baru: updatedSurvey.skor_total,
          kategori_baru: updatedSurvey.kategori_risiko,
          old_payload: oldSurvey,
          new_payload: updatedSurvey,
          created_at: newLog.created_at,
        });
      }

      setIsPegawaiInputOpen(false);
      return true;
    } catch (err) {
      console.error('Failed to save survey:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [surveys, activeCity, currentUser]);

  // Admin Rollback / Revert Survey
  const rollbackSurvey = useCallback(async (logId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const targetLog = historyLogs.find((l) => l.id === logId);
      if (!targetLog || !targetLog.old_payload) return false;

      const restoredSurvey = targetLog.old_payload;
      const currentSurvey = surveys.find((s) => s.kode_wilayah === targetLog.kode_wilayah) || restoredSurvey;

      const revertLog: InputHistoryLog = {
        id: `log-revert-${Date.now()}`,
        survey_id: restoredSurvey.id,
        kode_wilayah: restoredSurvey.kode_wilayah,
        nama_wilayah: restoredSurvey.nama_wilayah,
        tahun: restoredSurvey.tahun,
        pegawai_id: currentUser?.id || 'usr-admin-1',
        nama_pegawai: `${currentUser?.full_name || 'Admin BPKP'} (Rollback)`,
        action_type: 'REVERT',
        skor_lama: currentSurvey.skor_total,
        kategori_lama: currentSurvey.kategori_risiko,
        skor_baru: restoredSurvey.skor_total,
        kategori_baru: restoredSurvey.kategori_risiko,
        old_payload: currentSurvey,
        new_payload: restoredSurvey,
        created_at: new Date().toISOString(),
      };

      // 1. Immediately revert live surveys & append revert log
      setSurveys((prev) =>
        prev.map((s) => (s.kode_wilayah === restoredSurvey.kode_wilayah ? restoredSurvey : s))
      );
      setHistoryLogs((prev) => [revertLog, ...prev]);

      if (activeCity?.kode_wilayah === restoredSurvey.kode_wilayah) {
        setActiveCity(restoredSurvey);
      }

      // 2. Persist to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const dimInternal = restoredSurvey.dimensions?.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi ?? 0;
        const dimEksternal = restoredSurvey.dimensions?.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi ?? 0;
        const dimEksper = restoredSurvey.dimensions?.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi ?? 0;
        const dimKoreksi = restoredSurvey.dimensions?.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi ?? 0;

        await supabase.from('city_surveys').upsert({
          id: restoredSurvey.id,
          city_code: restoredSurvey.kode_wilayah,
          kode_wilayah: restoredSurvey.kode_wilayah,
          city_name: restoredSurvey.nama_wilayah,
          nama_wilayah: restoredSurvey.nama_wilayah,
          tipe_wilayah: restoredSurvey.tipe_wilayah,
          year: restoredSurvey.tahun,
          tahun: restoredSurvey.tahun,
          total_score: restoredSurvey.skor_total,
          skor_total: restoredSurvey.skor_total,
          internal_score: dimInternal,
          external_score: dimEksternal,
          expert_score: dimEksper,
          correction_factor: dimKoreksi,
          risk_category: restoredSurvey.kategori_risiko,
          kategori_risiko: restoredSurvey.kategori_risiko,
          respondent_count: restoredSurvey.jumlah_responden,
          jumlah_responden: restoredSurvey.jumlah_responden,
          updated_at: new Date().toISOString(),
        });

        await supabase.from('input_history_logs').insert({
          id: revertLog.id,
          survey_id: restoredSurvey.id,
          city_code: restoredSurvey.kode_wilayah,
          kode_wilayah: restoredSurvey.kode_wilayah,
          city_name: restoredSurvey.nama_wilayah,
          nama_wilayah: restoredSurvey.nama_wilayah,
          year: restoredSurvey.tahun,
          tahun: restoredSurvey.tahun,
          pegawai_id: revertLog.pegawai_id,
          nama_pegawai: revertLog.nama_pegawai,
          action_type: 'REVERT',
          skor_lama: currentSurvey.skor_total,
          kategori_lama: currentSurvey.kategori_risiko,
          skor_baru: restoredSurvey.skor_total,
          kategori_baru: restoredSurvey.kategori_risiko,
          old_payload: currentSurvey,
          new_payload: restoredSurvey,
          created_at: revertLog.created_at,
        });
      }

      return true;
    } catch (err) {
      console.error('Failed to rollback survey:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [historyLogs, surveys, activeCity, currentUser]);

  // Compute Real-Time Provincial Summary
  const summary = useMemo<ProvincialSummary>(() => {
    if (!surveys.length) {
      const defaultTier = getTierByScore(0, thresholds);
      return {
        totalWilayah: 0,
        rataRataSkor: 0,
        tierRataRata: defaultTier,
        skorTertinggi: null,
        skorTerendah: null,
      };
    }

    const total = surveys.reduce((acc, curr) => acc + Number(curr.skor_total), 0);
    const avg = roundTo2Decimals(total / surveys.length);
    const tierAvg = getTierByScore(avg, thresholds);

    const sorted = [...surveys].sort((a, b) => Number(b.skor_total) - Number(a.skor_total));

    return {
      totalWilayah: surveys.length,
      rataRataSkor: avg,
      tierRataRata: tierAvg,
      skorTertinggi: sorted[0] || null,
      skorTerendah: sorted[sorted.length - 1] || null,
    };
  }, [surveys, thresholds]);

  return (
    <SpiDashboardContext.Provider
      value={{
        surveys,
        activeCity,
        hoveredCity,
        selectedYear,
        isHeatmapActive,
        selectedTierFilter,
        hoveredTierFilter,
        searchQuery,
        summary,
        currentUser,
        userRole,
        historyLogs,
        thresholds,
        isLoading,
        isAuthModalOpen,
        isPegawaiInputOpen,
        isAdminHistoryOpen,
        isAdminRiskSettingsOpen,
        editingCityForInput,
        setActiveCity,
        setHoveredCity,
        setSelectedYear,
        setIsHeatmapActive,
        toggleHeatmap,
        setSelectedTierFilter,
        setHoveredTierFilter,
        setSearchQuery,
        setIsAuthModalOpen,
        setIsPegawaiInputOpen,
        setIsAdminHistoryOpen,
        setIsAdminRiskSettingsOpen,
        openPegawaiInputForCity,
        loginUser,
        logoutUser,
        saveAndPublishSurvey,
        rollbackSurvey,
        updateThresholds,
        resetToProvince,
      }}
    >
      {children}
    </SpiDashboardContext.Provider>
  );
}

export function useSpiDashboard() {
  const ctx = useContext(SpiDashboardContext);
  if (!ctx) {
    throw new Error('useSpiDashboard must be used within a SpiDashboardProvider');
  }
  return ctx;
}

export function useOptionalSpiDashboard() {
  return useContext(SpiDashboardContext);
}
