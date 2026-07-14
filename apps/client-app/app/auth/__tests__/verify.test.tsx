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
const mockRequestProviderOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockVerifyProviderOtp = jest.fn();
const mockLoginProvider = jest.fn();
const mockHandleExchange = jest.fn();
const mockResolvePostCustomerLogin = jest.fn();
const mockApplyProviderSession = jest.fn();
const mockWriteActiveSessionRole = jest.fn();
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
    requestProviderOtp: (...args: unknown[]) => mockRequestProviderOtp(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    verifyProviderOtp: (...args: unknown[]) => mockVerifyProviderOtp(...args),
    loginProvider: (...args: unknown[]) => mockLoginProvider(...args),
    NetworkError: actual.NetworkError,
    HttpError: actual.HttpError,
    ApiBusinessError: actual.ApiBusinessError,
  };
});

jest.mock('../../../src/lib/provider-session', () => ({
  providerSession: {
    write: jest.fn(async () => {}),
    read: jest.fn(async () => null),
    clear: jest.fn(async () => {}),
  },
}));

// session-manager is require()'d inside the success handler; mock handleExchange.
jest.mock('../../../src/lib/session-manager', () => ({
  handleExchange: (...args: unknown[]) => mockHandleExchange(...args),
  applyProviderSession: (...args: unknown[]) => mockApplyProviderSession(...args),
}));

jest.mock('../../../src/lib/session-role', () => ({
  writeActiveSessionRole: (...args: unknown[]) => mockWriteActiveSessionRole(...args),
}));

jest.mock('../../../src/lib/post-customer-login', () => ({
  resolvePostCustomerLogin: (...args: unknown[]) => mockResolvePostCustomerLogin(...args),
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
  mockRequestProviderOtp.mockReset();
  mockVerifyOtp.mockReset();
  mockVerifyProviderOtp.mockReset();
  mockLoginProvider.mockReset();
  mockHandleExchange.mockReset();
  mockResolvePostCustomerLogin.mockReset();
  mockApplyProviderSession.mockReset();
  mockWriteActiveSessionRole.mockReset();
  mockResolvePostCustomerLogin.mockResolvedValue({ needsProfileSetup: false });
  mockRouteParams = {};
  // Seed a live pending challenge so the screen doesn't bounce back to login.
  useAppStore.setState({ pendingPhone: '+251****5678', pendingChallengeId: 'chal-1', pendingAuthRole: 'customer' });
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

  it('uses provider OTP purpose for resend during provider login flow', async () => {
    useAppStore.setState({ pendingPhone: '+251911111111', pendingChallengeId: 'provider-chal', pendingAuthRole: 'provider' });
    mockRequestOtp.mockResolvedValue({ challengeId: 'provider-resend', expiresAt: new Date().toISOString() });

    renderVerify();
    act(() => jest.advanceTimersByTime(60_000));
    await waitFor(() => expect(screen.getByText('Resend code')).toBeTruthy());
    fireEvent.press(screen.getByText('Resend code'));

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalledWith(
      '+251911111111',
      'directory_provider_login',
      expect.stringMatching(/^otp_/),
    ));
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
    expect(screen.getByText(/Please wait 5 minutes and try again/i)).toBeTruthy();
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

  it('completes provider verify/login, persists provider session, and routes safely', async () => {
    mockRouteParams = { next: '/(tabs)/profile' };
    useAppStore.setState({ pendingPhone: '+251911111111', pendingChallengeId: 'provider-chal', pendingAuthRole: 'provider' });
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'provider-vt-1' });
    mockLoginProvider.mockResolvedValue({
      session_token: 'provider-session-token',
      provider: {
        id: 'prov-1',
        full_name: 'Abebe Kebede',
        phone: '+251911111111',
        category_slug: 'plumbers',
      },
    });

    renderVerify();
    typeCode('123456');

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledWith({
      phone: '+251911111111',
      code: '123456',
      challengeId: 'provider-chal',
      purpose: 'directory_provider_login',
    }));
    await waitFor(() => expect(mockLoginProvider).toHaveBeenCalledWith('provider-vt-1', '+251911111111'));
    await waitFor(() => expect(mockWriteActiveSessionRole).toHaveBeenCalledWith('provider'));
    await waitFor(() => expect(mockApplyProviderSession).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/profile'));
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

  it('shows provider-not-found guidance instead of crashing when provider login cannot be completed', async () => {
    useAppStore.setState({ pendingPhone: '+251911111111', pendingChallengeId: 'provider-chal', pendingAuthRole: 'provider' });
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'provider-vt-2' });
    mockLoginProvider.mockRejectedValue(new HttpError(404, 'missing', 'PROVIDER_NOT_FOUND'));

    renderVerify();
    typeCode('123456');
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(screen.getByText(/provider account/i)).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
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

  it('routes back to re-request when exchange reports consumed verify token', async () => {
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'vt-1' });
    mockHandleExchange.mockRejectedValue(new HttpError(401, 'invalid', 'INVALID_VERIFY_TOKEN'));

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
  });

  it('keeps user on verify screen for non-expiry exchange failures', async () => {
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'vt-1' });
    mockHandleExchange.mockRejectedValue(new HttpError(500, 'backend down', 'INTERNAL_ERROR'));

    renderVerify();
    typeCode('123456');
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(screen.getByText(/problem on our side/i)).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalledWith({
      pathname: '/auth/login',
      params: { next: undefined },
    });
  });
});
