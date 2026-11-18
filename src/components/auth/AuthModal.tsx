'use client';

import React, { useState } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import {
  X,
  Lock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser } = useSpiDashboard();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

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
  };

  const handleDemoLogin = (role: 'pegawai' | 'admin') => {
    if (role === 'admin') {
      loginUser('admin', 'Ir. Bambang Irawan, M.Si (Admin)', 'admin.bpkp@sumselprov.go.id');
    } else {
      loginUser('pegawai', 'Ahmad Fauzi, S.E. (Verifikator)', 'pegawai.spi@sumselprov.go.id');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Autentikasi Pegawai & Admin</h3>
              <p className="text-xs text-blue-200">Survei Penilaian Integritas (SPI) BPKP Sumsel</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Akses Cepat (Demo Akun Role-Based)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('pegawai')}
                className="group flex flex-col items-start p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-400 text-left transition-all"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Pegawai
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-blue-700 line-clamp-1">Input Lapangan & Hitung</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="group flex flex-col items-start p-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 hover:border-indigo-400 text-left transition-all"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    Admin BPKP
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-indigo-700 line-clamp-1">Audit Log & Rollback</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              atau masuk dengan email
            </span>
          </div>

          {/* Form Login Standar */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Kedinasan</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sumselprov.go.id"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>Masuk ke Sistem</span>
            </button>
          </form>

          {/* Security note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Dilindungi enkripsi Row Level Security (RLS) PostgreSQL & Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
