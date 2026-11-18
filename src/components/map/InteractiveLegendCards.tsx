'use client';

import React from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { SPI_TIERS } from '@/lib/scoringEngine';
import { RiskTierKey } from '@/types/spi';

export default function InteractiveLegendCards() {
  const {
    surveys,
    selectedTierFilter,
    setSelectedTierFilter,
    hoveredTierFilter,
    setHoveredTierFilter,
  } = useSpiDashboard();

  // Count cities in each tier
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
      if (score >= 80.00) counts.terjaga++;
      else if (score >= 60.00) counts.terawasi++;
      else if (score >= 40.00) counts.waspada++;
      else if (score >= 20.00) counts.rawan++;
      else counts.rentan++;
    });
    return counts;
  }, [surveys]);

  const tiersList = Object.values(SPI_TIERS);

  const handleCardClick = (key: RiskTierKey) => {
    if (selectedTierFilter === key) {
      setSelectedTierFilter(null); // toggle off
    } else {
      setSelectedTierFilter(key);
    }
  };

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 z-[400] hidden sm:flex flex-nowrap items-center gap-1.5 sm:gap-2 pointer-events-auto select-none">
      {tiersList.map((tier) => {
        const isSelected = selectedTierFilter === tier.key;
        const isHovered = hoveredTierFilter === tier.key;
        const count = tierCounts[tier.key];

        return (
          <button
            key={tier.key}
            onClick={() => handleCardClick(tier.key)}
            onMouseEnter={() => setHoveredTierFilter(tier.key)}
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
              style={{ backgroundColor: tier.hex }}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-800 leading-none">
                  {tier.label}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[9px] font-black"
                  style={{
                    backgroundColor: `${tier.hex}25`,
                    color: tier.hex,
                  }}
                >
                  {count}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                {tier.minScore.toFixed(0)} - {tier.maxScore === 100 ? '100' : tier.maxScore.toFixed(2)}
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
