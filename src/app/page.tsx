'use client';

import React from 'react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MapWrapper from '@/components/map/MapWrapper';
import InspectRegionPanel from '@/components/panels/InspectRegionPanel';
import RegionalRankingTable from '@/components/panels/RegionalRankingTable';
import ProfilUmumBpkp from '@/components/panels/ProfilUmumBpkp';
import { BarChart3, AlertOctagon } from 'lucide-react';

function DashboardContent() {
  const { activeTab } = useDashboard();

  return (
    <div className="flex h-screen w-full bg-bpkp-surface overflow-hidden font-sans">
      {/* 1. Main Navigation Sidebar (Collapsible on Desktop, Drawer on Mobile) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Tab Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* TAB 1: Peta Utama SPI */}
          {activeTab === 'peta' && (
            <div className="flex-1 flex flex-col lg:flex-row min-w-0 h-full p-2.5 sm:p-4 gap-3 sm:gap-4 overflow-y-auto lg:overflow-hidden">
              {/* Kolom Kiri: Peta Spasial + Tabel Peringkat */}
              <div className="flex-1 flex flex-col min-w-0 h-full gap-3 sm:gap-4">
                {/* Geospatial Map Area with In-Map Risk Sidebar */}
                <div className="h-[520px] sm:h-[580px] lg:h-auto lg:flex-1 min-h-[460px] relative">
                  <MapWrapper />
                </div>

                {/* Regional Ranking Table below map */}
                <div className="flex-shrink-0 max-h-60 sm:max-h-72 overflow-y-auto">
                  <RegionalRankingTable />
                </div>
              </div>

              {/* Kolom Kanan: Detail Kota / Sorotan Kursor */}
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 h-[480px] lg:h-full rounded-2xl overflow-hidden border border-bpkp-border shadow-sm bg-white">
                <InspectRegionPanel />
              </div>
            </div>
          )}

          {/* TAB 2: Hasil Wilayah */}
          {activeTab === 'wilayah' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">Hasil Lengkap 17 Kabupaten/Kota</h2>
                  <p className="text-xs text-slate-500 mt-1">Eksplorasi seluruh indikator internal, eksternal, dan penilai ahli.</p>
                </div>
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {/* TAB 3: Tabulasi Instansi */}
          {activeTab === 'tabulasi' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">Tabulasi Instansi & Responden</h2>
                  <p className="text-xs text-slate-500 mt-1">Distribusi responden dan faktor koreksi per instansi daerah.</p>
                </div>
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {/* TAB 4: Profil Umum BPKP */}
          {activeTab === 'profil_umum' && (
            <ProfilUmumBpkp />
          )}

          {/* TAB 5: Data Historis */}
          {activeTab === 'historis' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
              <div className="max-w-md w-full text-center p-6 sm:p-8 bg-white border border-bpkp-border rounded-2xl shadow-sm space-y-3">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-bpkp-blue mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Analisis Tren Historis (2024 - 2026)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data perbandingan antar-tahun sedang disinkronisasi dengan repositori data pencegahan korupsi BPKP Perwakilan Provinsi Sumatera Selatan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Tindak Lanjut */}
          {activeTab === 'tindak_lanjut' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">Rencana Aksi & Rekomendasi Tindak Lanjut</h2>
                  <p className="text-xs text-slate-500 mt-1">Prioritas penanganan area rentan dan rawan korupsi di Sumatera Selatan.</p>
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
    </div>
  );
}

export default function Page() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
