'use client';

import React, { useState, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useOptionalSpiDashboard } from '@/context/SpiDashboardContext';
import { RegionData } from '@/types/dashboard';
import {
  ArrowUpDown,
  Download,
  Building2,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { formatScore, formatNumber } from '@/lib/scoringUtils';
import { getRiskTier, getContrastTextColor, DEFAULT_RISK_THRESHOLDS } from '@/lib/riskThresholds';

export default function RegionalRankingTable() {
  const { regions, setActiveCity, activeCity, downloadCsv } = useDashboard();
  const spiCtx = useOptionalSpiDashboard();

  const [sortField, setSortField] = useState<string>('skor_total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'All' | 'Kabupaten' | 'Kota'>('All');

  // Convert SPI surveys to table items if available, keeping real-time sync with Pegawai & Admin input
  const displayItems = useMemo(() => {
    if (spiCtx && spiCtx.surveys.length > 0) {
      return spiCtx.surveys.map((s) => {
        const internal = s.dimensions.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi || 0;
        const eksternal = s.dimensions.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi || 0;
        const eksper = s.dimensions.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi || 0;
        const koreksi = s.dimensions.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi || 0;

        return {
          kode_wilayah: s.kode_wilayah,
          nama_wilayah: s.nama_wilayah,
          tipe_wilayah: s.tipe_wilayah,
          skor_total: s.skor_total,
          kategori_risiko: s.kategori_risiko,
          indikator_internal: internal,
          indikator_eksternal: eksternal,
          indikator_eksper: eksper,
          faktor_koreksi: koreksi,
          jumlah_responden: s.jumlah_responden,
          tahun: s.tahun,
          rawCity: s,
        };
      });
    }

    return regions.map((r) => ({
      ...r,
      rawCity: null,
    }));
  }, [spiCtx?.surveys, regions]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredRegions = displayItems.filter((r) => {
    if (filterType === 'All') return true;
    return r.tipe_wilayah === filterType;
  });

  const sortedRegions = [...filteredRegions].sort((a, b) => {
    const valA = Number((a as any)[sortField]) || 0;
    const valB = Number((b as any)[sortField]) || 0;
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const handleSelectRow = (regionItem: typeof displayItems[0]) => {
    const matchedRegion = regions.find((r) => r.kode_wilayah === regionItem.kode_wilayah);
    if (matchedRegion) setActiveCity(matchedRegion);
    if (spiCtx && regionItem.rawCity) {
      spiCtx.setActiveCity(regionItem.rawCity);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm select-none">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Peringkat Integritas 17 Wilayah
          </h3>
          <p className="text-xs text-slate-500">
            Daftar 17 Kabupaten/Kota di Sumatera Selatan diurutkan berdasarkan skor SPI
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {(['All', 'Kabupaten', 'Kota'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'Semua (17)' : t}
              </button>
            ))}
          </div>

          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10.5px]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Kabupaten / Kota</th>
              <th
                onClick={() => handleSort('skor_total')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Skor Total</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Kategori</th>
              <th
                onClick={() => handleSort('indikator_internal')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Internal</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('indikator_eksternal')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Eksternal</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('indikator_eksper')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 hidden lg:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Eksper</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sortedRegions.map((region, idx) => {
              const tier = getRiskTier(Number(region.skor_total), spiCtx?.thresholds || DEFAULT_RISK_THRESHOLDS);
              const textColor = getContrastTextColor(tier.color_hex);
              const isSelected = activeCity?.kode_wilayah === region.kode_wilayah;

              return (
                <tr
                  key={region.kode_wilayah}
                  onClick={() => handleSelectRow(region)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80'
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: tier.color_hex }}
                      />
                      <span>{region.nama_wilayah}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-black text-sm text-slate-800">
                    {formatScore(Number(region.skor_total))}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight shadow-xs select-none"
                      style={{
                        backgroundColor: tier.color_hex,
                        color: textColor,
                      }}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 hidden md:table-cell">
                    {formatScore(Number(region.indikator_internal))}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 hidden md:table-cell">
                    {formatScore(Number(region.indikator_eksternal))}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 hidden lg:table-cell">
                    {formatScore(Number(region.indikator_eksper))}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(region);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-blue-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
