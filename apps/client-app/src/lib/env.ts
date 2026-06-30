/**
 * Runtime configuration. The ONLY app config is the public API base URL and a
 * mock toggle — never any backend secret. `EXPO_PUBLIC_*` vars are inlined by Expo
 * at build time (see app.config.ts / .env).
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.serrale.com/api';

/**
 * Default to LIVE data. Mock mode must be explicitly opted into so production-ish
 * local builds do not silently ship fake providers/content.
 */
export const USE_MOCK: boolean =
  (process.env.EXPO_PUBLIC_USE_MOCK ?? 'false').toLowerCase() !== 'false';

/** Basic directory namespace for all SERRALE Basic endpoints. */
export const DIRECTORY = '/public-directory';
