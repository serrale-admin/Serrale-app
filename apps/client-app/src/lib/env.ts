/**
 * Runtime configuration. The ONLY app config is the public API base URL and a
 * mock toggle — never any backend secret. `EXPO_PUBLIC_*` vars are inlined by Expo
 * at build time (see app.config.ts / .env).
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.serrale.com/api';

/**
 * When true (default), the app runs against the in-memory mock layer so it works
 * with no backend. Set EXPO_PUBLIC_USE_MOCK=false to hit the real API.
 */
export const USE_MOCK: boolean =
  (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true').toLowerCase() !== 'false';

/** Basic directory namespace for all SERRALE Basic endpoints. */
export const DIRECTORY = '/public-directory';
