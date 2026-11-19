'use client';

import React from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { getRiskTier } from '@/lib/riskThresholds';
import { RiskTierKey } from '@/types/spi';

export default function InteractiveLegendCards() {
  const {
    surveys,
    thresholds,
    selectedTierFilter,
    setSelectedTierFilter,
    hoveredTierFilter,
    setHoveredTierFilter,
  } = useSpiDashboard();

  // Count cities in each tier dynamically using thresholds
  const tierCounts = React.useMemo(() => {
    const counts: Record<RiskTierKey, number> = {
      terjaga: 0,
      terawasi: 0,
      waspada: 0,
      rawan: 0,
      rentan: 0,
    };
    surveys.forEach((s) => {
      const score = Number(s.skor_total);
      const tier = getRiskTier(score, thresholds);
      if (counts[tier.tier_key] !== undefined) {
        counts[tier.tier_key]++;
      }
    });
    return counts;
  }, [surveys, thresholds]);

  const handleCardClick = (key: RiskTierKey) => {
    if (selectedTierFilter === key) {
      setSelectedTierFilter(null); // toggle off
    } else {
      setSelectedTierFilter(key);
    }
  };

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 z-[400] hidden sm:flex flex-nowrap items-center gap-1.5 sm:gap-2 pointer-events-auto select-none">
      {thresholds.map((tier) => {
        const isSelected = selectedTierFilter === tier.tier_key;
        const isHovered = hoveredTierFilter === tier.tier_key;
        const count = tierCounts[tier.tier_key] || 0;

        return (
          <button
            key={tier.tier_key}
            onClick={() => handleCardClick(tier.tier_key)}
            onMouseEnter={() => setHoveredTierFilter(tier.tier_key)}
            onMouseLeave={() => setHoveredTierFilter(null)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all backdrop-blur-md shadow-xs ${
              isSelected || isHovered
                ? 'bg-white border-slate-800 ring-2 ring-slate-800 shadow-md scale-105'
                : 'bg-white/95 border-slate-200/90 hover:border-slate-400 hover:bg-white'
            }`}
            title={`Klik untuk memfilter atau hover untuk menyorot kota kategori ${tier.label}`}
          >
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10"
              style={{ backgroundColor: tier.color_hex }}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-800 leading-none">
                  {tier.label}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[9px] font-black"
                  style={{
                    backgroundColor: `${tier.color_hex}25`,
                    color: tier.color_hex,
                  }}
                >
                  {count}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                {tier.min_score.toFixed(0)} - {tier.max_score === 100 ? '100' : tier.max_score.toFixed(2)}
              </span>
            </div>
          </button>
        );
      })}

      {selectedTierFilter && (
        <button
          onClick={() => setSelectedTierFilter(null)}
          className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-slate-800 transition"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}
