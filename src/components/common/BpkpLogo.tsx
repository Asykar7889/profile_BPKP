'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BpkpLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function BpkpLogo({
  className = 'h-8 sm:h-9 w-auto',
  width = 165,
  height = 65,
  showText = false,
}: BpkpLogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-2.5 select-none">
      {!imgError ? (
        <Image
          src="/images/logo-bpkp.png"
          alt="Logo BPKP"
          width={width}
          height={height}
          className={`object-contain ${className}`}
          priority
          onError={() => setImgError(true)}
        />
      ) : (
        /* High-Precision SVG Fallback identical to BPKP Oval Logo */
        <svg
          viewBox="0 0 330 131"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Blue Arc */}
          <path
            d="M165 5 C240 5 315 25 325 55 C310 30 235 15 165 15 C85 15 15 35 5 65 C15 30 90 5 165 5 Z"
            fill="#0000FE"
          />
          {/* Lower Blue Arc */}
          <path
            d="M5 65 C0 85 20 110 90 120 C140 125 210 120 280 95 C250 110 180 125 120 120 C50 115 15 95 10 75 Z"
            fill="#0000FE"
          />
          {/* Inner Crimson Red Swoosh Crescent */}
          <path
            d="M150 50 C210 50 250 65 240 85 C220 110 160 125 125 128 C155 122 205 105 220 85 C230 70 195 58 145 55 Z"
            fill="#FF0000"
          />
          {/* Black Italic 'bpkp' typography */}
          <text
            x="65"
            y="95"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="72"
            fontStyle="italic"
            fontWeight="900"
            fill="#000000"
          >
            bpkp
          </text>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-xs tracking-tight text-bpkp-black uppercase leading-none">
            BPKP SUMATERA SELATAN
          </span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
            Pengawasan Keuangan & Pembangunan
          </span>
        </div>
      )}
    </div>
  );
}
