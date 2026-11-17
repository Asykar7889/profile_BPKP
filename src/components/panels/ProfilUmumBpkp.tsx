'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  ShieldCheck,
  Building2,
  Award,
  Users,
  CheckCircle2,
  FileCheck,
  BarChart3,
  ExternalLink
} from 'lucide-react';

export default function ProfilUmumBpkp() {
  const { summary } = useDashboard();

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-bpkp-surface">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero Institutional Banner */}
        <div className="bg-gradient-to-r from-bpkp-blue to-[#1A1AFE] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Lembaga Pemerintah Nonkementerian (LPNK)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Badan Pengawasan Keuangan dan Pembangunan
              </h1>
              <h2 className="text-sm sm:text-base font-semibold text-bpkp-blueSoft">
                Perwakilan BPKP Provinsi Sumatera Selatan
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                Mengawal akuntabilitas keuangan dan tata kelola pembangunan daerah serta menyelenggarakan pemetaan risiko korupsi berbasis Survei Penilaian Integritas (SPI) pada 17 Kabupaten/Kota se-Sumatera Selatan.
              </p>
            </div>

            {/* White Logo Card */}
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center flex-shrink-0">
              <BpkpLogo className="h-12 w-auto" />
              <span className="text-[10px] font-bold text-bpkp-black mt-2">
                Auditor Presiden Republik Indonesia
              </span>
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 bg-bpkp-red/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 4 Core Mandate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-bpkp-border shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-bpkp-blueSoft text-bpkp-blue flex items-center justify-center mb-2.5">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Pengawasan Akuntabilitas</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Audit dan evaluasi tata kelola anggaran APBD dan dana transfer desa.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-bpkp-border shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Pencegahan Korupsi</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Monitoring SPI, asistensi sistem pencegahan korupsi, dan audit investigatif.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-bpkp-border shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Kawal Proyek Strategis</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Pengawasan proyek strategis nasional dan daerah di wilayah Sumatera Selatan.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-bpkp-border shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Kapabilitas APIP</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Pembinaan inspektorat daerah menuju pengawasan internal level 3+.
            </p>
          </div>
        </div>

        {/* Institutional Contacts & Address Card */}
        <div className="bg-white p-6 rounded-2xl border border-bpkp-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-bpkp-blue uppercase tracking-wider block">
              Kantor Perwakilan
            </span>
            <h4 className="text-sm font-black text-slate-900">
              Perwakilan BPKP Provinsi Sumatera Selatan
            </h4>
            <p className="text-xs text-slate-500">
              Jl. Jenderal Basuki Rahmat No. 88, Ario Kemuning, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30128
            </p>
            <p className="text-xs text-slate-500">
              Telepon: (0711) 412351 • Email: sumsel@bpkp.go.id • Website: bpkp.go.id/sumsel
            </p>
          </div>

          <a
            href="https://www.bpkp.go.id/sumsel"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-bpkp-blue hover:bg-bpkp-blueHover text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm flex-shrink-0"
          >
            <span>Kunjungi Laman Resmi</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
