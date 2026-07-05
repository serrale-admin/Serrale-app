/**
 * Verify screen — resend countdown (incl. server-override), route restoration,
 * dead-challenge routing, and generic security-safe copy.
 *
 * The countdown is driven by real component state on a 1s interval, so these
 * tests use fake timers and advance them inside `act`.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { HttpError } from '../../../src/lib/http';
import { useAppStore } from '../../../src/store/appStore';
// jest.mock calls below are hoisted above this import by babel, so the screen
// still loads with expo-router / the API / session-manager already mocked.
import VerifyScreen from '../verify';

// ─── mocks ───────────────────────────────────────────────────────────────────
const mockReplace = jest.fn();
const mockRequestOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockHandleExchange = jest.fn();
let mockRouteParams: Record<string, string | undefined> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockRouteParams,
}));

jest.mock('../../../src/api', () => {
  const actual = jest.requireActual('../../../src/lib/http');
  return {
    requestOtp: (...args: unknown[]) => mockRequestOtp(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    NetworkError: actual.NetworkError,
    HttpError: actual.HttpError,
    ApiBusinessError: actual.ApiBusinessError,
  };
});

// session-manager is require()'d inside the success handler; mock handleExchange.
jest.mock('../../../src/lib/session-manager', () => ({
  handleExchange: (...args: unknown[]) => mockHandleExchange(...args),
}));

function renderVerify() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <VerifyScreen />
    </QueryClientProvider>,
  );
}

/** Type all six digits, which triggers the auto-submit. */
function typeCode(code = '123456') {
  const inputs = screen.getAllByDisplayValue('');
  code.split('').forEach((d, i) => fireEvent.changeText(inputs[i], d));
}

beforeEach(() => {
  jest.useFakeTimers();
  mockReplace.mockReset();
  mockRequestOtp.mockReset();
  mockVerifyOtp.mockReset();
  mockHandleExchange.mockReset();
  mockRouteParams = {};
  // Seed a live pending challenge so the screen doesn't bounce back to login.
  useAppStore.setState({ pendingPhone: '+251912345678', pendingChallengeId: 'chal-1' });
});

afterEach(() => {
  // Clear the store's lingering toast timer before restoring real timers so no
  // 2.2s setTimeout leaks past the test and trips jest's open-handle guard.
  act(() => {
    useAppStore.getState().hideToast();
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe('resend countdown', () => {
  it('starts at the 60s backend cooldown and disables resend until it reaches zero', async () => {
    renderVerify();
    // Initial label reflects the 60s seed.
    expect(screen.getByText(/Resend code in 60s/)).toBeTruthy();

    // Advance 59s → still counting, still disabled.
    act(() => jest.advanceTimersByTime(59_000));
    expect(screen.getByText(/Resend code in 1s/)).toBeTruthy();
    expect(mockRequestOtp).not.toHaveBeenCalled();

    // Cross zero → the resend affordance unlocks.
    act(() => jest.advanceTimersByTime(1_000));
    await waitFor(() => expect(screen.getByText('Resend code')).toBeTruthy());
  });

  it('a stricter 429 server response OVERRIDES the local timer (does not shorten it)', async () => {
    // First resend rejects with a 5-minute server cooldown — raw signals exactly
    // as http.ts captures them from the OTP_PHONE_RATE_LIMITED response shape.
    const rateLimited = new HttpError(429, 'slow down', 'OTP_PHONE_RATE_LIMITED');
    rateLimited.retryRaw = {
      body: { retry_after_seconds: 300, next_allowed_at: new Date(Date.now() + 300_000).toISOString() },
      retryAfter: '300',
      rateLimitReset: null,
    };
    mockRequestOtp.mockRejectedValueOnce(rateLimited);
    renderVerify();

    // Let the initial 60s elapse so resend is allowed.
    act(() => jest.advanceTimersByTime(60_000));
    await waitFor(() => expect(screen.getByText('Resend code')).toBeTruthy());

    fireEvent.press(screen.getByText('Resend code'));

    // The countdown is bumped to the server's stricter 300s, not left at 60.
    await waitFor(() => expect(screen.getByText(/Resend code in 300s/)).toBeTruthy());
    expect(screen.getByText(/wait 5 minutes/i)).toBeTruthy();
  });
});

describe('route restoration', () => {
  it('navigates to a valid internal next route after a successful verify + exchange', async () => {
    mockRouteParams = { next: '/(tabs)/request' };
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'vt-1' });
    mockHandleExchange.mockResolvedValue(undefined);

    renderVerify();
    typeCode('123456');

    // Auto-submit is on a 100ms setTimeout; flush timers + microtasks.
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/request'));
  });

  it('rejects an external next URL and lands on the internal default', async () => {
    mockRouteParams = { next: 'https://evil.com/phish' };
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'vt-1' });
    mockHandleExchange.mockResolvedValue(undefined);

    renderVerify();
    typeCode('123456');
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/profile'));
    expect(mockReplace).not.toHaveBeenCalledWith('https://evil.com/phish');
  });
});

describe('security-safe error handling', () => {
  it('shows generic copy on an incorrect code and keeps the user on the screen (challenge retained)', async () => {
    mockVerifyOtp.mockRejectedValue(new HttpError(401, 'nope', 'OTP_INCORRECT'));

    renderVerify();
    typeCode('123456');
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(screen.getByText(/code is incorrect/i)).toBeTruthy());
    // Did NOT route away — the challenge is retained for a retype.
    expect(mockReplace).not.toHaveBeenCalled();
    // No leak about registration status.
    expect(screen.queryByText(/registered/i)).toBeNull();
  });

  it('routes back to request a fresh code when the challenge is expired/consumed', async () => {
    mockVerifyOtp.mockRejectedValue(new HttpError(400, 'expired', 'OTP_EXPIRED'));

    renderVerify();
    typeCode('123456');
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/auth/login',
        params: { next: undefined },
      }),
    );
    // The dead challenge id was cleared.
    expect(useAppStore.getState().pendingChallengeId).toBe('');
  });
});
