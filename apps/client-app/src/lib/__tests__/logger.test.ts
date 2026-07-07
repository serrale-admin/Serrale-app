/**
 * Production logger — level gating, redaction-before-emission, and the bounded
 * breadcrumb ring buffer.
 *
 * Two security-critical behaviours are asserted here:
 *   - warn/error forwarded to the crash reporter in production are ALWAYS
 *     redacted (no raw phone/token reaches the adapter);
 *   - debug/info are SILENCED in production (no console, no crash-report call).
 * `__DEV__` is toggled per-test to exercise both the dev and release paths.
 */
import {
  logger,
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  BREADCRUMB_LIMIT,
} from '../logger';
import { setCrashReporter, resetCrashReporter, type CrashReporter } from '../crash-reporter';
import { REDACTED } from '../redact';

declare const global: typeof globalThis & { __DEV__?: boolean };

function makeSpyReporter() {
  const captured: { error: unknown; context?: Record<string, unknown> }[] = [];
  const breadcrumbs: unknown[] = [];
  const reporter: CrashReporter = {
    captureException: (error, context) => captured.push({ error, context }),
    addBreadcrumb: (b) => breadcrumbs.push(b),
    setRelease: () => {},
  };
  return { reporter, captured, breadcrumbs };
}

const originalDev = (global as { __DEV__?: boolean }).__DEV__;

afterEach(() => {
  (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  resetCrashReporter();
  clearBreadcrumbs();
  jest.restoreAllMocks();
});

describe('logger level gating (production)', () => {
  beforeEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
  });

  it('silences debug and info (no console, no crash-report call)', () => {
    const { reporter, captured } = makeSpyReporter();
    setCrashReporter(reporter);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger.debug('secret +251912345678');
    logger.info('token eyJa.bc.def');

    expect(captured).toHaveLength(0);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('forwards warn/error to the crash reporter with the message REDACTED', () => {
    const { reporter, captured } = makeSpyReporter();
    setCrashReporter(reporter);

    logger.error(new Error('refresh failed for +251912345678 Bearer eyJa.bc.def'));

    expect(captured).toHaveLength(1);
    const serialized = JSON.stringify(captured[0].error);
    expect(serialized).not.toContain('+251912345678');
    expect(serialized).not.toContain('eyJa.bc.def');
    expect(serialized).toContain(REDACTED);
  });

  it('redacts extra context args forwarded alongside an error', () => {
    const { reporter, captured } = makeSpyReporter();
    setCrashReporter(reporter);

    logger.warn(new Error('bad'), { Authorization: 'Bearer eyJa.bc.def', phone: '0912345678' });

    const serialized = JSON.stringify(captured[0].context);
    expect(serialized).not.toContain('eyJa.bc.def');
    expect(serialized).not.toContain('0912345678');
  });
});

describe('logger level gating (development)', () => {
  beforeEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  it('prints redacted output to the dev console and does NOT hit the crash reporter', () => {
    const { reporter, captured } = makeSpyReporter();
    setCrashReporter(reporter);
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('leak +251912345678');

    expect(captured).toHaveLength(0);
    expect(errSpy).toHaveBeenCalled();
    const printed = JSON.stringify(errSpy.mock.calls[0]);
    expect(printed).not.toContain('+251912345678');
  });
});

describe('breadcrumb ring buffer', () => {
  it('records breadcrumbs and never lets PII into the payload', () => {
    addBreadcrumb({
      category: 'http',
      message: 'request failed',
      data: { route: '/provider/[id]', status: 503, requestId: 'req-9', phone: '0912345678' },
    });
    const [b] = getBreadcrumbs();
    const serialized = JSON.stringify(b);
    expect(serialized).not.toContain('0912345678');
    expect(serialized).toContain('/provider/[id]');
    expect(serialized).toContain('req-9');
  });

  it('bounds the buffer to BREADCRUMB_LIMIT, dropping the oldest', () => {
    for (let i = 0; i < BREADCRUMB_LIMIT + 15; i++) {
      addBreadcrumb({ category: 'navigation', message: `route-${i}` });
    }
    const all = getBreadcrumbs();
    expect(all).toHaveLength(BREADCRUMB_LIMIT);
    // Oldest dropped: first retained is route-15, last is the newest.
    expect(all[0].message).toBe('route-15');
    expect(all[all.length - 1].message).toBe(`route-${BREADCRUMB_LIMIT + 14}`);
  });

  it('forwards each breadcrumb (redacted) to the crash reporter', () => {
    const { reporter, breadcrumbs } = makeSpyReporter();
    setCrashReporter(reporter);
    addBreadcrumb({ category: 'http', message: 'fail', data: { token: 'rt_abcdef123456' } });
    expect(breadcrumbs).toHaveLength(1);
    expect(JSON.stringify(breadcrumbs[0])).not.toContain('rt_abcdef123456');
  });
});
