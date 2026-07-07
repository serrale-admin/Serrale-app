/**
 * Global error boundary behaviour:
 *   - a child that throws in render → the branded recovery UI (never the raw
 *     error message / stack);
 *   - the restart action resets state so a healthy child re-mounts, and fires the
 *     `onReset` callback (the app wires this to a safe root route);
 *   - the caught error is routed through the production logger, REDACTED (no
 *     phone / token in what the crash reporter would receive).
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { labelsFor } from '../../lib/labels';
import { setCrashReporter, resetCrashReporter, type CrashReporter } from '../../lib/crash-reporter';

// ErrorBoundary reads the label set (→ app store → AsyncStorage). Mock the native
// module (babel hoists this jest.mock above the imports above).
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

const en = labelsFor('en');

/** A child that throws while `shouldCrash` is true (read at each render). */
let shouldCrash = true;
function Boom(): React.ReactElement {
  if (shouldCrash) throw new Error('render crash for +251912345678 Bearer eyJa.bc.def');
  return <></>;
}

// Silence React's console.error noise from the intentional throw.
let consoleErr: jest.SpyInstance;
beforeEach(() => {
  shouldCrash = true;
  consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  consoleErr.mockRestore();
  resetCrashReporter();
  jest.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders the branded recovery UI when a child throws, not the raw error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText(en.recovery.title)).toBeTruthy();
    expect(screen.getByText(en.recovery.message)).toBeTruthy();
    expect(screen.getByText(en.recovery.action)).toBeTruthy();
    // The raw error text must never reach the screen.
    expect(screen.queryByText(/render crash/)).toBeNull();
    expect(screen.queryByText(/\+251912345678/)).toBeNull();
    expect(screen.queryByText(/Bearer/)).toBeNull();
  });

  it('routes the caught error through the logger, redacted (no PII to the reporter)', () => {
    const captured: unknown[] = [];
    const reporter: CrashReporter = {
      captureException: (e, ctx) => captured.push({ e, ctx }),
      addBreadcrumb: () => {},
      setRelease: () => {},
    };
    setCrashReporter(reporter);
    // Force the production forwarding path.
    const g = global as { __DEV__?: boolean };
    const prevDev = g.__DEV__;
    g.__DEV__ = false;

    try {
      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
      expect(captured.length).toBeGreaterThan(0);
      const serialized = JSON.stringify(captured);
      expect(serialized).not.toContain('+251912345678');
      expect(serialized).not.toContain('eyJa.bc.def');
    } finally {
      g.__DEV__ = prevDev;
    }
  });

  it('restart resets state (child re-mounts) and fires onReset', () => {
    const onReset = jest.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(en.recovery.title)).toBeTruthy();

    // The user fixes the condition (e.g. connectivity restored); the next render
    // of the child no longer throws. Tapping restart clears the boundary state.
    shouldCrash = false;
    fireEvent.press(screen.getByText(en.recovery.action));

    expect(onReset).toHaveBeenCalledTimes(1);
    // Recovery UI cleared — the healthy child is shown again.
    expect(screen.queryByText(en.recovery.title)).toBeNull();
  });
});
