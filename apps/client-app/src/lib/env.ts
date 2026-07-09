/**
 * Runtime configuration. The ONLY app config is the public API base URL and a
 * mock toggle — never any backend secret. `EXPO_PUBLIC_*` vars are inlined by Expo
 * at build time (see app.config.ts / .env).
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.serrale.com/api';

/**
 * Parse the mock toggle. Mock mode must be EXPLICITLY opted into: it is on only
 * when the flag is the exact (trimmed, case-insensitive) string 'true'. Any
 * other value (unset, 'false', or a typo like 'no'/'off'/'0') keeps the app on
 * live data, so a mistyped flag can never silently ship fake providers/content.
 * Exported as a pure function so the parsing rule is unit testable (Expo inlines
 * `process.env.EXPO_PUBLIC_*` at build time, so the constant itself cannot be
 * re-evaluated at runtime).
 */
export function parseUseMock(value: string | undefined): boolean {
  return (value ?? 'false').trim().toLowerCase() === 'true';
}

/** Default to LIVE data; opt into mock only with an explicit 'true'. */
export const USE_MOCK: boolean = parseUseMock(process.env.EXPO_PUBLIC_USE_MOCK);

/** Basic directory namespace for all SERRALE Basic endpoints. */
export const DIRECTORY = '/public-directory';

/**
 * Production build guard. Fails a release build/startup if the resolved API
 * configuration is unsafe: mock mode enabled, a non-absolute (relative /
 * static-host) URL, a non-HTTPS origin, or a local host. Kept as a pure,
 * exported function (parameters default to the resolved config) so it is unit
 * testable, and invoked once at module load for non-dev builds only.
 *
 * Uses a string/regex parse rather than the `URL` global so behaviour is
 * identical under Node (tests) and Hermes (device).
 */
export function assertProductionEnv(
  apiBaseUrl: string = API_BASE_URL,
  useMock: boolean = USE_MOCK,
): void {
  const problems: string[] = [];

  if (useMock) {
    problems.push(
      'EXPO_PUBLIC_USE_MOCK is enabled — mock data must never ship in a production build',
    );
  }

  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^/]+)/.exec((apiBaseUrl ?? '').trim());
  if (!match) {
    problems.push(
      `EXPO_PUBLIC_API_BASE_URL "${apiBaseUrl}" is not an absolute URL — ` +
        'relative or static-host origins are not allowed in a production build',
    );
  } else {
    const protocol = match[1].toLowerCase();
    // Isolate the hostname: drop any userinfo ("user:pass@"), then strip the
    // port. Bracketed IPv6 literals ("[::1]:443") keep their brackets.
    const authority = match[2].toLowerCase().split('@').pop()!;
    const host = authority.startsWith('[')
      ? authority.slice(0, authority.indexOf(']') + 1)
      : authority.split(':')[0];
    if (protocol !== 'https') {
      problems.push(
        `EXPO_PUBLIC_API_BASE_URL must use HTTPS in production (got "${protocol}://…")`,
      );
    }
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host.endsWith('.local')
    ) {
      problems.push(
        `EXPO_PUBLIC_API_BASE_URL points at a local host ("${host}") — not reachable in production`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid production API configuration:\n  - ${problems.join('\n  - ')}\n` +
        'Set EXPO_PUBLIC_API_BASE_URL to an https:// origin and leave EXPO_PUBLIC_USE_MOCK unset/false.',
    );
  }
}

// Fail fast on a misconfigured release build. `__DEV__` is a RN/Expo global
// (false in release, true in dev; undefined-safe for non-RN runtimes).
if (typeof __DEV__ !== 'undefined' && __DEV__ === false) {
  assertProductionEnv();
}
