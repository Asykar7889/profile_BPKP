// ====================================================================
// PROFIL RESMI PERWAKILAN BPKP PROVINSI SUMATERA SELATAN
// Centralized Data File: Metadata Instansi & Direktori 5 Kanal Resmi
// ====================================================================

export type OfficialPlatformType = 'website' | 'instagram' | 'facebook' | 'youtube' | 'x';

export interface OfficialChannel {
  id: string;
  platform: OfficialPlatformType;
  platformName: string;
  label: string;
  username?: string;
  url: string;
  description: string;
  hoverAccentColor: string;
  isFeatured?: boolean;
}

export interface BpkpAgencyProfile {
  name: string;
  subName: string;
  institutionType: string;
  parentBody: string;
  address: string;
  phone: string;
  email: string;
  officialSiteUrl: string;
  jurisdiction: {
    totalRegenciesCities: number;
    citiesCount: number;
    regenciesCount: number;
    citiesList: string[];
    regenciesList: string[];
  };
  missionStatement: string;
  dashboardPurpose: string;
}

export const BPKP_SUMSEL_PROFILE: BpkpAgencyProfile = {
  name: 'Perwakilan BPKP Provinsi Sumatera Selatan',
  subName: 'Badan Pengawasan Keuangan dan Pembangunan',
  institutionType: 'Lembaga Pemerintah Nonkementerian (LPNK)',
  parentBody: 'Auditor Presiden Republik Indonesia',
  address: 'Jl. Jenderal Basuki Rahmat No. 88, Ario Kemuning, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30128',
  phone: '(0711) 412351',
  email: 'sumsel@bpkp.go.id',
  officialSiteUrl: 'https://bpkp.go.id/en/unitKerja/18',
  jurisdiction: {
    totalRegenciesCities: 17,
    citiesCount: 4,
    regenciesCount: 13,
    citiesList: [
      'Kota Palembang',
      'Kota Pagar Alam',
      'Kota Lubuklinggau',
      'Kota Prabumulih',
    ],
    regenciesList: [
      'Kabupaten Ogan Komering Ulu',
      'Kabupaten Ogan Komering Ilir',
      'Kabupaten Muara Enim',
      'Kabupaten Lahat',
      'Kabupaten Musi Rawas',
      'Kabupaten Musi Banyuasin',
      'Kabupaten Banyuasin',
      'Kabupaten Ogan Komering Ulu Timur',
      'Kabupaten Ogan Komering Ulu Selatan',
      'Kabupaten Ogan Ilir',
      'Kabupaten Empat Lawang',
      'Kabupaten Penukal Abab Lematang Ilir',
      'Kabupaten Musi Rawas Utara',
    ],
  },
  missionStatement:
    'Mengawal akuntabilitas keuangan dan tata kelola pembangunan daerah serta menyelenggarakan pemetaan risiko korupsi berbasis Survei Penilaian Integritas (SPI) pada 17 Kabupaten/Kota se-Sumatera Selatan.',
  dashboardPurpose:
    'Menyediakan instrumen geospasial transparansi publik dan peringatan dini (early warning) risiko korupsi. Dashboard ini memvisualisasikan capaian Survei Penilaian Integritas (SPI) di 17 Kabupaten/Kota Sumatera Selatan sebagai rujukan strategis pengambilan kebijakan pengawasan, asistensi pengadaan barang dan jasa, serta pembinaan kapabilitas APIP daerah.',
};

export const OFFICIAL_BPKP_CHANNELS: OfficialChannel[] = [
  {
    id: 'channel-website',
    platform: 'website',
    platformName: 'Website Resmi',
    label: 'Portal Resmi BPKP Sumsel',
    url: 'https://bpkp.go.id/en/unitKerja/18',
    description:
      'Pusat informasi resmi kedinasan Perwakilan BPKP Sumsel yang menyajikan warta pengawasan, regulasi akuntabilitas, struktur organisasi, dan pengumuman layanan publik.',
    hoverAccentColor: '#0000FE', // Theme primary BPKP blue
    isFeatured: true,
  },
  {
    id: 'channel-instagram',
    platform: 'instagram',
    platformName: 'Instagram',
    label: '@bpkp_sumsel',
    username: '@bpkp_sumsel',
    url: 'https://www.instagram.com/bpkp_sumsel/',
    description:
      'Dokumentasi visual kegiatan audit lapangan, asistensi tata kelola daerah, infografis capaian SPI, dan publikasi agenda kedinasan terkini.',
    hoverAccentColor: '#E1306C',
    isFeatured: false,
  },
  {
    id: 'channel-facebook',
    platform: 'facebook',
    platformName: 'Facebook',
    label: 'BPKP SumSel',
    username: 'BPKP SumSel',
    url: 'https://www.facebook.com/profile.php?id=100086387477681',
    description:
      'Kanal siaran pers resmi, liputan kerja sama pengawasan keuangan dengan pemerintah daerah, dan ruang komunikasi publik Perwakilan BPKP Sumsel.',
    hoverAccentColor: '#1877F2',
    isFeatured: false,
  },
  {
    id: 'channel-youtube',
    platform: 'youtube',
    platformName: 'YouTube',
    label: 'BPKP SUMSEL',
    username: 'BPKP SUMSEL',
    url: 'https://www.youtube.com/channel/UCseZWITo_j1366UvXI-JldA',
    description:
      'Tayangan video edukasi pencegahan korupsi, liputan pengawalan akuntabilitas proyek strategis, webinar tata kelola, dan siaran pengawasan pembangunan daerah.',
    hoverAccentColor: '#FF0000',
    isFeatured: false,
  },
  {
    id: 'channel-x',
    platform: 'x',
    platformName: 'X (Twitter)',
    label: '@bpkpsumsel1',
    username: '@bpkpsumsel1',
    url: 'https://x.com/bpkpsumsel1',
    description:
      'Pembaruan cepat informasi pengawasan, tanggapan isu akuntabilitas keuangan publik, serta siaran kilat kegiatan kedinasan secara berkala.',
    hoverAccentColor: '#0F172A',
    isFeatured: false,
  },
];
