'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { SpiDashboardProvider } from '@/context/SpiDashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import BpkpLogo from '@/components/common/BpkpLogo';
import OfficialChannelCard from '@/components/OfficialChannelCard';
import { BPKP_SUMSEL_PROFILE, OFFICIAL_BPKP_CHANNELS } from '@/data/bpkpProfile';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
  FileCheck2,
  Scale,
  Award,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';

function ProfilUmumContent() {
  const websiteChannel = OFFICIAL_BPKP_CHANNELS.find((c) => c.platform === 'website')!;
  const socialChannels = OFFICIAL_BPKP_CHANNELS.filter((c) => c.platform !== 'website');
  const { isMainSidebarOpen, isDesktopSidebarOpen, toggleMainSidebar, setIsMobileSidebarOpen } = useDashboard();
  const isSidebarOpen = isDesktopSidebarOpen ?? isMainSidebarOpen;

  return (
    <div className="flex min-h-screen w-full bg-slate-100 font-sans">
      {/* 1. Main Navigation Sidebar (Collapsible on Desktop, Drawer on Mobile) */}
      <Sidebar />

      {/* 2. Main Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-bpkp-surface transition-all duration-200">
        {/* Top Breadcrumb & Quick Action Bar */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-bpkp-border flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {/* Desktop Reopen Sidebar Button */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={toggleMainSidebar}
                className="hidden lg:inline-flex p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-bpkp-blue hover:bg-slate-100 transition min-w-[34px] min-h-[34px] items-center justify-center mr-1 shadow-2xs"
                title="Buka Menu Sidebar"
                aria-label="Buka Menu Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition min-w-[34px] min-h-[34px] flex items-center justify-center mr-1"
              title="Buka Navigasi"
              aria-label="Buka Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-bpkp-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard SPI</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-bpkp-blue bg-bpkp-blueSoft px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wide">
              Profil Umum BPKP
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BPKP_SUMSEL_PROFILE.officialSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bpkp-blueSoft hover:bg-blue-100 text-bpkp-blue text-xs font-bold transition-colors border border-bpkp-blueBorder"
              aria-label="Kunjungi Portal Pusat BPKP (buka tab baru)"
            >
              <span>Portal BPKP Pusat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            {/* ============================================================ */}
            {/* SECTION 1: HERO CARD IDENTITAS INSTANSI                      */}
            {/* ============================================================ */}
            <section
              aria-labelledby="hero-title"
              className="bg-gradient-to-r from-bpkp-blue via-[#0A0AF0] to-[#1A1AFE] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden border border-blue-900"
            >
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>{BPKP_SUMSEL_PROFILE.institutionType}</span>
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-bpkp-blueSoft block">
                      {BPKP_SUMSEL_PROFILE.subName}
                    </span>
                    <h1
                      id="hero-title"
                      className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mt-0.5"
                    >
                      {BPKP_SUMSEL_PROFILE.name}
                    </h1>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed pt-1 max-w-xl">
                    {BPKP_SUMSEL_PROFILE.missionStatement}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={BPKP_SUMSEL_PROFILE.officialSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-bpkp-blue hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
                      aria-label="Kunjungi Portal Resmi BPKP Sumsel (buka tab baru)"
                    >
                      <span>Kunjungi Portal Resmi BPKP Sumsel</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all duration-200"
                    >
                      <span>Lihat Peta Risiko SPI</span>
                    </Link>
                  </div>
                </div>

                {/* Brand Logo Display Card with high contrast */}
                <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center flex-shrink-0 border border-slate-100 text-center self-stretch sm:self-auto min-w-[200px]">
                  <BpkpLogo className="h-14 sm:h-16 w-auto" />
                  <div className="mt-3 pt-2.5 border-t border-slate-100 w-full text-center">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                      {BPKP_SUMSEL_PROFILE.parentBody}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                      Republik Indonesia
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Subtle Geometry (Brand Colors) */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-36 -top-16 w-48 h-48 bg-bpkp-red/20 rounded-full blur-2xl pointer-events-none" />
            </section>

            {/* ============================================================ */}
            {/* SECTION 2: RINGKASAN PERAN & CAKUPAN WILAYAH (2 COLUMNS)     */}
            {/* ============================================================ */}
            <section
              aria-labelledby="peran-cakupan-title"
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
            >
              {/* Left Card: Tujuan Publikasi Dashboard SPI */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-bpkp-blue flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Fungsi Pengawasan
                      </span>
                      <h2
                        id="peran-cakupan-title"
                        className="text-base sm:text-lg font-black text-slate-900"
                      >
                        Tujuan Publikasi Dashboard SPI
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {BPKP_SUMSEL_PROFILE.dashboardPurpose}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Deteksi Dini</span>
                        <span className="text-slate-500 text-[11px]">Mitigasi titik rawan korupsi PBJ & bansos</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-bpkp-blue flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Penguatan APIP</span>
                        <span className="text-slate-500 text-[11px]">Asistensi kapabilitas inspektorat daerah</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card: Cakupan Wilayah (17 Kab/Kota - 4 Kota & 13 Kabupaten) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Yurisdiksi Pengawasan
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        Cakupan 17 Kabupaten/Kota
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    Perwakilan BPKP Provinsi Sumatera Selatan memonitor akuntabilitas dan penilaian risiko integritas di seluruh 17 entitas pemerintah daerah:
                  </p>

                  {/* Stat Counts */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-lg sm:text-xl font-black text-bpkp-blue block">17</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Wilayah</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                      <span className="text-lg sm:text-xl font-black text-slate-900 block">4</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Pemerintah Kota</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                      <span className="text-lg sm:text-xl font-black text-slate-900 block">13</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Pemerintah Kab.</span>
                    </div>
                  </div>

                  {/* 4 Cities Chips */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      4 Kota Otonom:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BPKP_SUMSEL_PROFILE.jurisdiction.citiesList.map((city) => (
                        <span
                          key={city}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Meliputi 13 Kabupaten se-Sumatera Selatan</span>
                  <Link href="/" className="font-bold text-bpkp-blue hover:underline">
                    Buka Peta &rarr;
                  </Link>
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 3: DIREKTORI KANAL RESMI & MEDIA SOSIAL              */}
            {/* ============================================================ */}
            <section aria-labelledby="direktori-title" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <div>
                  <h2
                    id="direktori-title"
                    className="text-lg sm:text-xl font-black text-slate-900 tracking-tight"
                  >
                    Direktori Kanal Resmi & Media Sosial
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Hubungkan interaksi, pengaduan, dan ikuti publikasi resmi Perwakilan BPKP Provinsi Sumatera Selatan.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-center">
                  5 Kanal Resmi Terverifikasi
                </span>
              </div>

              {/* 1 Full-Width Website Resmi Card */}
              {websiteChannel && (
                <div className="w-full">
                  <OfficialChannelCard channel={websiteChannel} isFeatured={true} />
                </div>
              )}

              {/* 2x2 Grid for 4 Social Platforms (Instagram, Facebook, YouTube, X) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialChannels.map((channel) => (
                  <OfficialChannelCard key={channel.id} channel={channel} isFeatured={false} />
                ))}
              </div>
            </section>

            {/* ============================================================ */}
            {/* SECTION 4: INFORMASI KANTOR & KONTAK KEDINASAN               */}
            {/* ============================================================ */}
            <section
              aria-labelledby="kontak-title"
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-bpkp-blue flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Alamat Kedinasan
                    </span>
                    <h3 id="kontak-title" className="text-sm sm:text-base font-black text-slate-900">
                      Kantor Perwakilan BPKP Provinsi Sumatera Selatan
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 pl-10">
                  {BPKP_SUMSEL_PROFILE.address}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 pl-10">
                  <a
                    href="tel:0711412351"
                    className="inline-flex items-center gap-1.5 hover:text-bpkp-blue transition-colors font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Telepon: {BPKP_SUMSEL_PROFILE.phone}</span>
                  </a>
                  <a
                    href="mailto:sumsel@bpkp.go.id"
                    className="inline-flex items-center gap-1.5 hover:text-bpkp-blue transition-colors font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email: {BPKP_SUMSEL_PROFILE.email}</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto flex-shrink-0">
                <a
                  href="https://goo.gl/maps/Palembang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors text-center inline-flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Petunjuk Arah</span>
                </a>
                <a
                  href={BPKP_SUMSEL_PROFILE.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-bpkp-blue hover:bg-bpkp-blueHover text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Portal BPKP Sumsel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProfilUmumPage() {
  return (
    <DashboardProvider>
      <SpiDashboardProvider>
        <ProfilUmumContent />
      </SpiDashboardProvider>
    </DashboardProvider>
  );
}
