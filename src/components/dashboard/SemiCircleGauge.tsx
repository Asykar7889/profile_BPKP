'use client';

import React from 'react';
import { getTierByScore, formatScore } from '@/lib/scoringEngine';
import { RiskThreshold, getContrastTextColor } from '@/lib/riskThresholds';

interface SemiCircleGaugeProps {
  score: number;
  label?: string;
  size?: number;
  thresholds?: RiskThreshold[];
}

export default function SemiCircleGauge({
  score,
  label,
  size = 240,
  thresholds,
}: SemiCircleGaugeProps) {
  const tier = getTierByScore(score, thresholds);
  const clamped = Math.max(0, Math.min(100, score));

  // Geometry calculations for a 180-degree gauge (center at x=120, y=120, radius=90)
  const radius = 86;
  const strokeWidth = 14;
  const centerX = 120;
  const centerY = 110;

  // Total circumference of half circle = PI * radius
  const arcLength = Math.PI * radius;
  // Progress offset
  const progressOffset = arcLength * (1 - clamped / 100);

  // Angle for the needle / indicator point (-180 to 0 degrees)
  const angleRad = Math.PI * (1 - clamped / 100);
  const needleX = centerX - radius * Math.cos(angleRad);
  const needleY = centerY - radius * Math.sin(angleRad);

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      <div className="relative" style={{ width: size, height: size * 0.62 }}>
        <svg
          viewBox="0 0 240 135"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
              <stop offset="25%" stopColor="#FB923C" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#FACC15" stopOpacity="0.15" />
              <stop offset="75%" stopColor="#4ADE80" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#15803D" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subtle colored track underneath */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="url(#gaugeBgGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled Progress Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke={tier.hex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={progressOffset}
            className="transition-all duration-700 ease-out"
          />

          {/* Center Text Indicator */}
          <text
            x={centerX}
            y={centerY - 22}
            textAnchor="middle"
            className="text-[34px] font-black font-mono tracking-tighter"
            fill="#0F172A"
          >
            {formatScore(score)}
          </text>

          <text
            x={centerX}
            y={centerY - 4}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400 tracking-wider uppercase"
          >
            Skor Indeks (0 - 100)
          </text>

          {/* 0 and 100 Labels */}
          <text x={centerX - radius} y={centerY + 16} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
            0
          </text>
          <text x={centerX + radius} y={centerY + 16} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
            100
          </text>
        </svg>

        {/* Floating Category Badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
          <span
            className="px-3 py-1 rounded-full text-xs font-black shadow-xs tracking-wide"
            style={{ backgroundColor: tier.hex, color: getContrastTextColor(tier.hex) }}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-xs font-bold text-slate-700 mt-3 text-center">
          {label}
        </span>
      )}
    </div>
  );
}
