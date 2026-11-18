'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SumselLeafletMap = dynamic(() => import('./SumselLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3 rounded-2xl border border-slate-200">
      <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-xs sm:text-sm font-semibold text-slate-700">
        Memuat Peta Spasial 17 Kabupaten/Kota Sumatera Selatan...
      </span>
    </div>
  ),
});

export default function MapWrapper() {
  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px]">
      <SumselLeafletMap />
    </div>
  );
}
