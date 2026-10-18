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

  return {
    url: storedUrl.trim() || envUrl.trim(),
    anonKey: storedKey.trim() || envKey.trim(),
    autoSync: storedAutoSync !== null ? storedAutoSync === 'true' : true,
    lastSyncedAt: storedLastSync ? parseInt(storedLastSync, 10) : undefined
  };
};

/**
 * Saves customized Supabase connection credentials and resets the client instance.
 */
export const saveSupabaseConfig = (url: string, anonKey: string, autoSync = true): void => {
  localStorage.setItem(STORAGE_KEYS.URL, url.trim());
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

  // Validate URL format
  if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
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

  if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('http://')) {
    return { ok: false, message: 'Project URL must begin with https:// or http://' };
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
