'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import InteractiveLegend from './InteractiveLegend';

const SumselLeafletMap = dynamic(() => import('./SumselLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-sm font-medium">Memuat Peta Spasial Sumatera Selatan...</span>
    </div>
  ),
});

export default function MapWrapper() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-white">
      <SumselLeafletMap />
      <InteractiveLegend />
    </div>
  );
}
