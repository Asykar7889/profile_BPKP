'use client';

import React, { useState } from 'react';
import { OfficialChannel } from '@/data/bpkpProfile';
import { Globe, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface OfficialChannelCardProps {
  channel: OfficialChannel;
  isFeatured?: boolean;
}

// Brand SVGs
function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function XTwitterIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function OfficialChannelCard({
  channel,
  isFeatured = false,
}: OfficialChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Render Platform Icon
  const renderIcon = () => {
    const size = isFeatured ? 'w-6 h-6' : 'w-5 h-5';
    switch (channel.platform) {
      case 'instagram':
        return <InstagramIcon className={size} />;
      case 'facebook':
        return <FacebookIcon className={size} />;
      case 'youtube':
        return <YouTubeIcon className={size} />;
      case 'x':
        return <XTwitterIcon className={size} />;
      case 'website':
      default:
        return <Globe className={size} />;
    }
  };

  const effectiveFeatured = isFeatured || channel.isFeatured;

  if (effectiveFeatured) {
    return (
      <a
        href={channel.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${channel.platformName} - ${channel.label}: Kunjungi portal resmi (buka tab baru)`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative block w-full rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bpkp-blue focus-visible:ring-offset-2 overflow-hidden"
        style={{
          borderColor: isHovered ? channel.hoverAccentColor : undefined,
        }}
      >
        {/* Subtle accent highlight bar on left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-200"
          style={{
            backgroundColor: isHovered ? channel.hoverAccentColor : '#0000FE',
          }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-1">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: `${channel.hoverAccentColor}14`,
                color: channel.hoverAccentColor,
              }}
            >
              {renderIcon()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {channel.platformName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-bpkp-blue border border-blue-200">
                  <ShieldCheck className="w-3 h-3" />
                  Utama
                </span>
              </div>
              <h3
                className="text-base sm:text-lg font-black text-slate-900 transition-colors duration-200 group-hover:text-bpkp-blue"
              >
                {channel.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {channel.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-bpkp-blue group-hover:text-white group-hover:border-bpkp-blue transition-all duration-200 flex-shrink-0 self-end sm:self-center">
            <span>Kunjungi Portal</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </a>
    );
  }

  // Standard Social Media Card (2x2 Grid)
  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${channel.platformName} - ${channel.label}: Kunjungi akun resmi (buka tab baru)`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-hidden"
      style={{
        borderColor: isHovered ? channel.hoverAccentColor : undefined,
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: `${channel.hoverAccentColor}14`,
                color: channel.hoverAccentColor,
              }}
            >
              {renderIcon()}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {channel.platformName}
              </span>
              <h4
                className="text-sm font-black text-slate-900 transition-colors duration-200"
                style={{
                  color: isHovered ? channel.hoverAccentColor : undefined,
                }}
              >
                {channel.username || channel.label}
              </h4>
            </div>
          </div>

          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {channel.description}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-400">Akun Resmi BPKP Sumsel</span>
        <span
          className="font-bold flex items-center gap-0.5 transition-colors"
          style={{ color: channel.hoverAccentColor }}
        >
          <span>Buka Profil</span>
          <span>&rarr;</span>
        </span>
      </div>
    </a>
  );
}
