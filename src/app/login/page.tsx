'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  Lock,
  UserCheck,
  Shield,
  ArrowLeft,
  LogIn,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { userRole, currentUser, loginUser, isLoading } = useSpiDashboard();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && userRole !== 'public') {
      router.replace('/');
    }
  }, [userRole, isLoading, router]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon lengkapi email dan kata sandi.');
      return;
    }

    if (email.toLowerCase().includes('admin')) {
      loginUser('admin', 'Admin Pengawas BPKP', email);
    } else {
      loginUser('pegawai', 'Pegawai Verifikator SPI', email);
    }
    router.replace('/');
  };

  const handleDemoLogin = (role: 'pegawai' | 'admin') => {
    if (role === 'admin') {
      loginUser('admin', 'Ir. Bambang Irawan, M.Si (Admin)', 'admin.bpkp@sumselprov.go.id');
    } else {
      loginUser('pegawai', 'Ahmad Fauzi, S.E. (Verifikator)', 'pegawai.spi@sumselprov.go.id');
    }
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white mb-3 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <BpkpLogo className="h-9 w-auto" showText={false} />
            <div>
              <h1 className="font-black text-lg text-white">Login Portal BPKP</h1>
              <p className="text-xs text-blue-200">Pemetaan Indeks Integritas (SPI) Sumatera Selatan</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Kedinasan BPKP</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@bpkp.go.id"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Akses Cepat Demo (RBAC)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('pegawai')}
                className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-left hover:bg-blue-100/60 transition group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Akun Pegawai</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Input Survei SPI</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-left hover:bg-indigo-100/60 transition group"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Akun Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Tata Kelola & Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
