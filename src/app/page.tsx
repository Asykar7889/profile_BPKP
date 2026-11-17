'use client';

import React from 'react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MapWrapper from '@/components/map/MapWrapper';
import InspectRegionPanel from '@/components/panels/InspectRegionPanel';
import RegionalRankingTable from '@/components/panels/RegionalRankingTable';
import { ShieldCheck, MapPin, BarChart3, AlertOctagon, HelpCircle } from 'lucide-react';

function DashboardContent() {
  const { activeTab } = useDashboard();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Center Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Tab Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeTab === 'peta' && (
            <div className="flex-1 flex flex-col lg:flex-row min-w-0 h-full p-4 gap-4 overflow-y-auto lg:overflow-hidden">
              {/* Map & Table Column */}
              <div className="flex-1 flex flex-col min-w-0 h-full gap-4">
                {/* Geospatial Map Area */}
                <div className="flex-1 min-h-[420px] lg:min-h-0 relative">
                  <MapWrapper />
                </div>

                {/* Regional Ranking Table below map */}
                <div className="flex-shrink-0 max-h-72 overflow-y-auto">
                  <RegionalRankingTable />
                </div>
              </div>

              {/* Right-hand "Click-to-Inspect" Detail Panel */}
              <div className="w-full lg:w-96 flex-shrink-0 h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
                <InspectRegionPanel />
              </div>
            </div>
          )}

          {activeTab === 'wilayah' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Hasil Lengkap 17 Kabupaten/Kota</h2>
                  <p className="text-xs text-slate-500 mt-1">Eksplorasi seluruh indikator internal, eksternal, dan penilai ahli.</p>
                </div>
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {activeTab === 'tabulasi' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Tabulasi Instansi & Responden</h2>
                  <p className="text-xs text-slate-500 mt-1">Distribusi responden dan faktor koreksi per instansi daerah.</p>
                </div>
                <RegionalRankingTable />
              </div>
            </div>
          )}

          {activeTab === 'historis' && (
            <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
              <div className="max-w-md text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800">Analisis Tren Historis (2024 - 2026)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data perbandingan antar-tahun sedang disinkronisasi dengan repositori data pencegahan korupsi BPKP Perwakilan Provinsi Sumatera Selatan.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tindak_lanjut' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Rencana Aksi & Rekomendasi Tindak Lanjut</h2>
                  <p className="text-xs text-slate-500 mt-1">Prioritas penanganan area rentan dan rawan korupsi di Sumatera Selatan.</p>
                </div>
                <div className="grid gap-4">
                  <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-1">
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      <span>Wilayah Prioritas Merah (Rentan - Musi Rawas Utara)</span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Wajib melaksanakan rencana aksi darurat: asistensi pengadaan PBJ langsung oleh KPK/BPKP, penerapan katalog elektronik lokal, dan perbaikan tata kelola dana desa.
                    </p>
                  </div>

                  <div className="p-5 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-orange-800 font-bold text-sm mb-1">
                      <AlertOctagon className="w-4 h-4 text-orange-600" />
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
