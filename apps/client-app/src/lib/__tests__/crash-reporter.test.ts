/**
 * Crash-reporter adapter — no-op-safe default.
 *
 * The no-op must (a) never throw, so a reporting failure cannot amplify the crash
 * it is recording, and (b) redact every payload before it would forward, so the
 * redaction path is proven today rather than at T12. We spy on `redact` to assert
 * it actually runs on each method's input.
 */
import * as redactMod from '../redact';
import {
  createNoopCrashReporter,
  getCrashReporter,
  setCrashReporter,
  resetCrashReporter,
  type CrashReporter,
} from '../crash-reporter';

afterEach(() => {
  jest.restoreAllMocks();
  resetCrashReporter();
});

describe('no-op crash reporter', () => {
  it('redacts the exception and context before discarding', () => {
    const spy = jest.spyOn(redactMod, 'redact');
    const reporter = createNoopCrashReporter();

    reporter.captureException(new Error('boom for +251912345678'), {
      Authorization: 'Bearer eyJabc.def.ghi',
    });

    // Both the error and the context are scrubbed.
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('redacts breadcrumbs before discarding', () => {
    const spy = jest.spyOn(redactMod, 'redact');
    const reporter = createNoopCrashReporter();

    reporter.addBreadcrumb({ category: 'http', message: 'request failed', data: { status: 500 } });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('never throws even if redaction itself throws', () => {
    jest.spyOn(redactMod, 'redact').mockImplementation(() => {
      throw new Error('redact exploded');
    });
    const reporter = createNoopCrashReporter();

    expect(() => reporter.captureException(new Error('x'))).not.toThrow();
    expect(() => reporter.addBreadcrumb({ category: 'c', message: 'm' })).not.toThrow();
    expect(() => reporter.setRelease('1.0.0')).not.toThrow();
  });
});

describe('crash reporter registry', () => {
  it('defaults to a no-op and can be swapped and reset', () => {
    // Default is a working no-op.
    expect(() => getCrashReporter().captureException(new Error('x'))).not.toThrow();

    const calls: string[] = [];
    const fake: CrashReporter = {
      captureException: () => calls.push('capture'),
      addBreadcrumb: () => calls.push('breadcrumb'),
      setRelease: () => calls.push('release'),
    };
    setCrashReporter(fake);
    getCrashReporter().captureException(new Error('y'));
    getCrashReporter().setRelease('1.2.3');
    expect(calls).toEqual(['capture', 'release']);

    resetCrashReporter();
    // Back to the no-op (does not push to `calls`).
    getCrashReporter().captureException(new Error('z'));
    expect(calls).toEqual(['capture', 'release']);
  });
});
