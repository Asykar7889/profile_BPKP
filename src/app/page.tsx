'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import TopFilterExportBar from '@/components/dashboard/TopFilterExportBar';
import HighlightSummaryBar from '@/components/dashboard/HighlightSummaryBar';
import MapWrapper from '@/components/map/MapWrapper';
import RightScorePanel from '@/components/dashboard/RightScorePanel';
import RegionalRankingTable from '@/components/panels/RegionalRankingTable';
import ProfilUmumBpkp from '@/components/panels/ProfilUmumBpkp';
import AuthModal from '@/components/auth/AuthModal';
import PegawaiInputModal from '@/components/pegawai/PegawaiInputModal';
import AdminHistoryLogView from '@/components/admin/AdminHistoryLogView';
import AdminRiskSettingsModal from '@/components/admin/AdminRiskSettingsModal';
import { BarChart3, AlertOctagon } from 'lucide-react';

function DashboardBody() {
  const { activeTab } = useDashboard();

  return (
    <div className="flex min-h-screen w-full bg-slate-100 font-sans">
      {/* 1. Main Navigation Sidebar (Collapsible on Desktop, Drawer on Mobile) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200">
        {/* Top Header Filter & RBAC Export Bar */}
        <TopFilterExportBar />

        {/* Dynamic Tab Body */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* TAB 1: Peta Utama SPI */}
          {activeTab === 'peta' && (
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-w-0 p-2.5 sm:p-4 lg:p-6 gap-4 sm:gap-6">
              {/* Order 1 on Mobile (< lg) | Col 1-8 Row 2 on Desktop (lg): Geospatial Map Area */}
              <div className="order-1 lg:order-2 lg:col-span-8 lg:row-start-2 lg:col-start-1 h-[480px] sm:h-[540px] lg:h-[620px] min-h-[420px] relative w-full">
                <MapWrapper />
              </div>

              {/* Order 2 on Mobile (< lg) | Col 9-12 Rows 1-2 on Desktop (lg, sticky): City/Provincial Statistics Panel */}
              <div className="order-2 lg:order-3 lg:col-span-4 lg:row-start-1 lg:row-span-2 lg:col-start-9 w-full lg:sticky lg:top-4 h-auto lg:h-[calc(100vh-2rem)] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
                <RightScorePanel />
              </div>

              {/* Order 3 on Mobile (< lg) | Col 1-8 Row 1 on Desktop (lg): 3 KPI Highlight / Summary Cards */}
              <div className="order-3 lg:order-1 lg:col-span-8 lg:row-start-1 lg:col-start-1 w-full">
                <HighlightSummaryBar />
              </div>

              {/* Order 4 on Mobile (< lg) | Col 1-8 Row 3 on Desktop (lg): Regional Ranking Table */}
              <div className="order-4 lg:order-4 lg:col-span-8 lg:row-start-3 lg:col-start-1 w-full">
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {/* TAB 2: Hasil Wilayah */}
          {activeTab === 'wilayah' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">
                    Hasil Lengkap 17 Kabupaten/Kota Sumatera Selatan
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Eksplorasi seluruh indikator internal (35%), eksternal (35%), dan penilai ahli (30%).
                  </p>
                </div>
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {/* TAB 3: Profil Umum BPKP */}
          {activeTab === 'profil_umum' && <ProfilUmumBpkp />}

          {/* TAB 5: Data Historis */}
          {activeTab === 'historis' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
              <div className="max-w-md w-full text-center p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Analisis Tren Historis (2024 - 2026)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data perbandingan antar-tahun disinkronisasi langsung dengan repositori data pencegahan korupsi BPKP Perwakilan Provinsi Sumatera Selatan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Tindak Lanjut */}
          {activeTab === 'tindak_lanjut' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">
                    Rencana Aksi & Rekomendasi Tindak Lanjut
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Prioritas penanganan area rentan dan rawan korupsi di Sumatera Selatan.
                  </p>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-xs sm:text-sm mb-1">
                      <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Wilayah Prioritas Merah (Rentan - Musi Rawas Utara)</span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Wajib melaksanakan rencana aksi darurat: asistensi pengadaan PBJ langsung oleh KPK/BPKP, penerapan katalog elektronik lokal, dan perbaikan tata kelola dana desa.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-orange-800 font-bold text-xs sm:text-sm mb-1">
                      <AlertOctagon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span>Wilayah Prioritas Oranye (Rawan - Empat Lawang, Musi Banyuasin)</span>
                    </div>
                    <p className="text-xs text-orange-700 leading-relaxed">
                      Fokus pada perbaikan transparansi mutasi pegawai negeri, pengetatan penerimaan honorer, dan audit investigatif belanja modal infrastruktur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Global Modals (Module 5 & 6 & Dynamic Risk Settings) */}
      <AuthModal />
      <PegawaiInputModal />
      <AdminHistoryLogView />
      <AdminRiskSettingsModal />
    </div>
  );
}

export default function Page() {
  return <DashboardBody />;
}
