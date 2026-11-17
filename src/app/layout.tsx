import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard Pemetaan Tingkat Korupsi Sumatera Selatan (SPI Sumsel)',
  description: 'Sistem Informasi Geospasial Pemetaan Risiko Korupsi & Survei Penilaian Integritas (SPI) pada 17 Kabupaten/Kota Provinsi Sumatera Selatan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
