'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/layout/Sidebar';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  ShieldAlert,
  PanelLeftOpen,
  Menu,
  ArrowLeft,
  ChevronRight,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole, currentUser, logoutUser, isLoading } = useSpiDashboard();
  const { isMainSidebarOpen, isDesktopSidebarOpen, toggleMainSidebar, setIsMobileSidebarOpen } = useDashboard();
  const isSidebarOpen = isDesktopSidebarOpen ?? isMainSidebarOpen;

  // Strict RBAC Guard: Immediately redirect non-admin users to /
  useEffect(() => {
    if (!isLoading && userRole !== 'admin') {
      router.replace('/');
    }
  }, [userRole, isLoading, router]);

  // While checking or if unauthorized, render a clean guard message
  if (userRole !== 'admin') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-sm w-full">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Memeriksa Hak Akses Admin...</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
            Halaman ini dikhususkan untuk Administrator BPKP. Anda akan dialihkan ke halaman utama jika tidak memiliki otorisasi.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bpkp-blue hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAturRisiko = pathname === '/admin/atur-risiko';
  const isAuditLog = pathname === '/admin/audit-log';
  const pageTitle = isAturRisiko ? 'Pengaturan Tingkat Risiko' : isAuditLog ? 'Audit Log Perubahan' : 'Portal Administrator';

  return (
    <div className="flex min-h-screen w-full bg-slate-100 font-sans">
      {/* 1. Main Navigation Sidebar (Desktop Collapsible, Mobile Drawer) */}
      <Sidebar />

      {/* 2. Main Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-bpkp-surface transition-all duration-200">
        {/* Top Header / Breadcrumb */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-bpkp-border flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {/* Desktop Reopen Sidebar Button */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={toggleMainSidebar}
                className="hidden lg:inline-flex p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-bpkp-blue hover:bg-slate-100 transition min-w-[34px] min-h-[34px] items-center justify-center mr-1 shadow-2xs"
                title="Buka Menu Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-bpkp-blue hover:bg-slate-100 lg:hidden min-w-[34px] min-h-[34px] flex items-center justify-center mr-1"
              title="Buka Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link href="/" className="hover:text-bpkp-blue flex items-center gap-1 font-semibold">
              <BpkpLogo className="h-5 w-auto inline-block sm:hidden" showText={false} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentUser?.full_name || 'Admin BPKP'}</span>
            </div>

            <button
              onClick={() => {
                logoutUser();
                router.replace('/');
              }}
              className="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="Keluar dari sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
