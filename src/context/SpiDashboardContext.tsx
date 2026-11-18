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
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isPegawaiInputOpen: boolean;
  isAdminHistoryOpen: boolean;
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
  openPegawaiInputForCity: (city?: CitySurvey | null) => void;
  loginUser: (role: 'pegawai' | 'admin', name?: string, email?: string) => void;
  logoutUser: () => void;
  saveAndPublishSurvey: (updatedSurvey: CitySurvey, pegawaiName?: string) => Promise<boolean>;
  rollbackSurvey: (logId: string) => Promise<boolean>;
  resetToProvince: () => void;
}

const SpiDashboardContext = createContext<SpiDashboardContextType | null>(null);

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
  const [editingCityForInput, setEditingCityForInput] = useState<CitySurvey | null>(null);

  // Audit Logs State
  const [historyLogs, setHistoryLogs] = useState<InputHistoryLog[]>(INITIAL_HISTORY_LOGS);

  const userRole: UserRole = currentUser ? currentUser.role : 'public';

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
        await supabase.from('city_surveys').upsert({
          id: updatedSurvey.id,
          kode_wilayah: updatedSurvey.kode_wilayah,
          nama_wilayah: updatedSurvey.nama_wilayah,
          tipe_wilayah: updatedSurvey.tipe_wilayah,
          tahun: updatedSurvey.tahun,
          skor_total: updatedSurvey.skor_total,
          kategori_risiko: updatedSurvey.kategori_risiko,
          jumlah_responden: updatedSurvey.jumlah_responden,
          updated_at: new Date().toISOString(),
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
        await supabase.from('city_surveys').upsert({
          id: restoredSurvey.id,
          kode_wilayah: restoredSurvey.kode_wilayah,
          nama_wilayah: restoredSurvey.nama_wilayah,
          tipe_wilayah: restoredSurvey.tipe_wilayah,
          tahun: restoredSurvey.tahun,
          skor_total: restoredSurvey.skor_total,
          kategori_risiko: restoredSurvey.kategori_risiko,
          jumlah_responden: restoredSurvey.jumlah_responden,
          updated_at: new Date().toISOString(),
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
      const defaultTier = getTierByScore(0);
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
    const tierAvg = getTierByScore(avg);

    const sorted = [...surveys].sort((a, b) => Number(b.skor_total) - Number(a.skor_total));

    return {
      totalWilayah: surveys.length,
      rataRataSkor: avg,
      tierRataRata: tierAvg,
      skorTertinggi: sorted[0] || null,
      skorTerendah: sorted[sorted.length - 1] || null,
    };
  }, [surveys]);

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
        isLoading,
        isAuthModalOpen,
        isPegawaiInputOpen,
        isAdminHistoryOpen,
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
        openPegawaiInputForCity,
        loginUser,
        logoutUser,
        saveAndPublishSurvey,
        rollbackSurvey,
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
