'use client';

import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import { SpiDashboardProvider } from '@/context/SpiDashboardContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <SpiDashboardProvider>
        {children}
      </SpiDashboardProvider>
    </DashboardProvider>
  );
}
