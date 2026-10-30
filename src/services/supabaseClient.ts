import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEYS = {
  URL: 'mymentor_supabase_url',
  ANON_KEY: 'mymentor_supabase_anon_key',
  AUTO_SYNC: 'mymentor_supabase_auto_sync',
  LAST_SYNC: 'mymentor_supabase_last_sync'
};

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

/**
 * Validates that a Supabase URL is secure:
 * - Must be a valid URL
 * - Must use HTTPS (HTTP is strictly forbidden, except for local testing on localhost / 127.0.0.1)
 * - Prohibits javascript:, data:, and all other unsafe protocols
 */
export const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'https:') return true;
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Returns the currently active Supabase configuration,
 * checking localStorage overrides first, then falling back to Vite environment variables.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY) || '';
  const storedAutoSync = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
  const storedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  const rawUrl = storedUrl.trim() || envUrl.trim();
  const safeUrl = isValidSupabaseUrl(rawUrl) ? rawUrl : '';

  return {
    url: safeUrl,
    anonKey: storedKey.trim() || envKey.trim(),
    autoSync: storedAutoSync !== null ? storedAutoSync === 'true' : true,
    lastSyncedAt: storedLastSync ? parseInt(storedLastSync, 10) : undefined
  };
};

/**
 * Saves customized Supabase connection credentials and resets the client instance.
 * Throws an error if the URL fails security validation.
 */
export const saveSupabaseConfig = (url: string, anonKey: string, autoSync = true): void => {
  const trimmedUrl = url.trim();
  if (!isValidSupabaseUrl(trimmedUrl)) {
    throw new Error('Security Error: Supabase URL must use HTTPS (e.g., https://your-project.supabase.co).');
  }

  localStorage.setItem(STORAGE_KEYS.URL, trimmedUrl);
  localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
  localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, autoSync ? 'true' : 'false');
  cachedClient = null;
  currentClientKey = '';
};

/**
 * Clears custom saved credentials and reverts to environment variables (if present).
 */
export const clearSupabaseConfig = (): void => {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  localStorage.removeItem(STORAGE_KEYS.AUTO_SYNC);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  cachedClient = null;
  currentClientKey = '';
};

/**
 * Records the timestamp of the last successful sync.
 */
export const recordLastSyncTime = (timestamp = Date.now()): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
};

/**
 * Returns a configured Supabase client, or null if URL / Anon Key are not provided.
 */
export const getSupabase = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  // Validate URL format and protocol security
  if (!isValidSupabaseUrl(config.url)) {
    return null;
  }

  const keySignature = `${config.url}::${config.anonKey}`;
  if (cachedClient && currentClientKey === keySignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
      }
    });
    currentClientKey = keySignature;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

/**
 * Tests connection with a provided URL and Anon Key without modifying global state.
 */
export const testSupabaseConnection = async (
  url: string,
  anonKey: string
): Promise<{ ok: boolean; message: string }> => {
  if (!url || !anonKey) {
    return { ok: false, message: 'Please provide both Project URL and Anon Key.' };
  }

  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  if (!isValidSupabaseUrl(trimmedUrl)) {
    return { ok: false, message: 'Security Error: Project URL must begin with https:// (e.g., https://your-project.supabase.co)' };
  }

  try {
    const testClient = createClient(trimmedUrl, trimmedKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Test health check or auth check
    const { data, error } = await testClient.auth.getSession();
    if (error && error.message && !error.message.includes('Auth session missing')) {
      return { ok: false, message: `Connection error: ${error.message}` };
    }

    return { ok: true, message: 'Supabase connected successfully! Ready for cloud sync.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to connect to Supabase endpoint.' };
  }
};
