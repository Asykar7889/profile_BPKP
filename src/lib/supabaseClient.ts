import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Pemanggilan variabel environment menggunakan prefix publik resmi Next.js (NEXT_PUBLIC_*)
// 2. Dilengkapi fallback placeholder URL yang valid secara sintaksis HTTP/HTTPS agar tidak crash saat prerendering Vercel
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Sanitasi string (menghapus spasi dan tanda kutip yang tidak sengaja terbawa dari env input)
const sanitizedUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
const sanitizedAnonKey = rawAnonKey.trim().replace(/^["']|["']$/g, '');

// Auto-prefix https:// jika pengguna lupa mengetik https:// di Vercel Dashboard
const formattedUrl = sanitizedUrl.startsWith('http://') || sanitizedUrl.startsWith('https://')
  ? sanitizedUrl
  : `https://${sanitizedUrl}`;

// Validasi apakah URL benar-benar valid secara sintaksis dan bukan placeholder
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const isNotPlaceholder =
      !url.includes('placeholder.supabase.co') &&
      !url.includes('your-project.supabase.co');
    return isHttp && parsed.hostname.includes('.') && isNotPlaceholder;
  } catch {
    return false;
  }
}

// Menandakan apakah koneksi ke Supabase aktif atau menggunakan data fallback lokal
export const isSupabaseConfigured: boolean = Boolean(
  sanitizedAnonKey &&
  sanitizedAnonKey !== 'placeholder-anon-key' &&
  isValidSupabaseUrl(formattedUrl)
);

// Inisialisasi client yang 100% aman (fail-safe) untuk SSR / SSG di Vercel
// Selalu dijamin menggunakan valid HTTP/HTTPS URL dengan pelindung try-catch sehingga createClient tidak pernah melempar error
function createSafeSupabaseClient(): SupabaseClient {
  try {
    const targetUrl = isSupabaseConfigured ? formattedUrl : 'https://placeholder.supabase.co';
    const targetKey = isSupabaseConfigured ? sanitizedAnonKey : 'placeholder-anon-key';
    return createClient(targetUrl, targetKey);
  } catch (err) {
    console.warn('[SupabaseClient] Warning: Failed to initialize configured Supabase client, using fallback placeholder:', err);
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
}

export const supabase: SupabaseClient = createSafeSupabaseClient();
