'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { RISK_TIERS } from '@/lib/scoringUtils';
import { RiskTierKey } from '@/types/dashboard';
import { Filter, Layers, X } from 'lucide-react';

export default function InteractiveLegend() {
  const {
    summary,
    selectedTierFilter,
    setSelectedTierFilter,
    isHeatmapActive
  } = useDashboard();

  const tiers: RiskTierKey[] = ['terjaga', 'terawasi', 'waspada', 'rawan', 'rentan'];

  const handleTierClick = (key: RiskTierKey) => {
    if (selectedTierFilter === key) {
      setSelectedTierFilter(null);
    } else {
      setSelectedTierFilter(key);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3.5 shadow-xl max-w-xs transition-all select-none">
      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tingkat Risiko SPI
          </span>
        </div>
        {selectedTierFilter && (
          <button
            onClick={() => setSelectedTierFilter(null)}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded transition"
            title="Reset Filter"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {tiers.map((key) => {
          const tier = RISK_TIERS[key];
          const count = summary.tierCounts[key] || 0;
          const isSelected = selectedTierFilter === key;
          const isDimmed = selectedTierFilter !== null && !isSelected;

          return (
            <div
              key={key}
              onClick={() => handleTierClick(key)}
              onMouseEnter={() => !selectedTierFilter && setSelectedTierFilter(key)}
              onMouseLeave={() => selectedTierFilter === key && setSelectedTierFilter(null)}
              className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 scale-[1.02]'
                  : isDimmed
                  ? 'opacity-40 hover:opacity-80'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-md flex-shrink-0 shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: tier.hex }}
                />
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {tier.label}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {tier.minScore.toFixed(0)} - {tier.maxScore.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  wil
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Klik / sorot kategori untuk filter</span>
        <span className="font-semibold text-slate-500">17 Kab/Kota</span>
      </div>
    </div>
  );
}
