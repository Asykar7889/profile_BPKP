'use client';

import React from 'react';
import Link from 'next/link';
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
  Scale,
  FileCheck2,
  Award,
} from 'lucide-react';

export default function ProfilUmumBpkp() {
  const websiteChannel = OFFICIAL_BPKP_CHANNELS.find((c) => c.platform === 'website')!;
  const socialChannels = OFFICIAL_BPKP_CHANNELS.filter((c) => c.platform !== 'website');

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-bpkp-surface">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* ============================================================ */}
        {/* SECTION 1: HERO CARD IDENTITAS INSTANSI                      */}
        {/* ============================================================ */}
        <section
          aria-labelledby="hero-title-panel"
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
                  id="hero-title-panel"
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
                  href="/profil-umum"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all duration-200"
                >
                  <span>Buka Halaman Lengkap</span>
                </Link>
              </div>
            </div>

            {/* Brand Logo Display Card */}
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

          {/* Decorative Subtle Geometry */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-16 w-48 h-48 bg-bpkp-red/20 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: RINGKASAN PERAN & CAKUPAN WILAYAH (2 COLUMNS)     */}
        {/* ============================================================ */}
        <section
          aria-labelledby="peran-cakupan-panel"
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
                    id="peran-cakupan-panel"
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

            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Meliputi 13 Kabupaten se-Sumatera Selatan
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: DIREKTORI KANAL RESMI & MEDIA SOSIAL              */}
        {/* ============================================================ */}
        <section aria-labelledby="direktori-panel-title" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
            <div>
              <h2
                id="direktori-panel-title"
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
          aria-labelledby="kontak-panel-title"
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
                <h3 id="kontak-panel-title" className="text-sm sm:text-base font-black text-slate-900">
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
    </div>
  );
}
