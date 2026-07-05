/**
 * Login screen — send-dedup, route pass-through, and 429 copy.
 *
 * `expo-router` and the API layer are mocked at the module boundary so we drive
 * the REAL screen logic (the in-flight guard, the mutation wiring, the error
 * mapping) and assert on the observable effects.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { HttpError } from '../../../src/lib/http';
import { useAppStore } from '../../../src/store/appStore';
// jest.mock calls below are hoisted above this import by babel, so the screen
// still loads with expo-router / the API module already mocked.
import LoginScreen from '../login';

// ─── mocks ───────────────────────────────────────────────────────────────────
// `mock`-prefixed names are the one identifier class jest lets a hoisted
// jest.mock factory reference.
const mockReplace = jest.fn();
const mockRequestOtp = jest.fn();
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
    NetworkError: actual.NetworkError,
    HttpError: actual.HttpError,
    ApiBusinessError: actual.ApiBusinessError,
  };
});

function renderLogin() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginScreen />
    </QueryClientProvider>,
  );
}

function typeValidPhone() {
  const input = screen.getByPlaceholderText('9 12 345 678');
  fireEvent.changeText(input, '0912345678');
  return input;
}

beforeEach(() => {
  mockReplace.mockReset();
  mockRequestOtp.mockReset();
  mockRouteParams = {};
});

afterEach(() => {
  // Drop the store's 2.2s toast timer so it doesn't leak past the test.
  useAppStore.getState().hideToast();
});

describe('LoginScreen send dedup', () => {
  it('fires exactly ONE requestOtp mutation for many rapid taps (in-flight guard)', async () => {
    // A never-resolving promise keeps the mutation pending across the burst.
    let resolveSend: (v: unknown) => void = () => {};
    mockRequestOtp.mockImplementation(
      () => new Promise((resolve) => { resolveSend = resolve; }),
    );

    renderLogin();
    typeValidPhone();
    const sendBtn = screen.getByText('Send code');

    // Hammer the button.
    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalledTimes(1));

    // The one call carries a normalized phone, the customer purpose, and an
    // idempotency key (one logical send).
    expect(mockRequestOtp).toHaveBeenCalledWith(
      '0912345678',
      'directory_customer_request',
      expect.stringMatching(/^otp_/),
    );

    resolveSend({ challengeId: 'c1', expiresAt: new Date().toISOString() });
  });

  it('does NOT call the API when the phone is invalid (inline validation gates the network)', async () => {
    renderLogin();
    const input = screen.getByPlaceholderText('9 12 345 678');
    fireEvent.changeText(input, '0812345678'); // starts with 8 → invalid
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() =>
      expect(screen.getByText(/valid Ethiopian phone number/i)).toBeTruthy(),
    );
    expect(mockRequestOtp).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('LoginScreen route + success', () => {
  it('navigates to verify preserving the next param on success', async () => {
    mockRouteParams = { next: '/(tabs)/request' };
    mockRequestOtp.mockResolvedValue({ challengeId: 'c-42', expiresAt: new Date().toISOString() });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/auth/verify',
        params: { next: '/(tabs)/request' },
      }),
    );
  });
});

describe('LoginScreen 429 copy', () => {
  it('shows the specific server wait time parsed from raw 429 signals', async () => {
    // Exactly what http.ts captures for the backend's OTP_COOLDOWN response:
    // the error body's retry_after_seconds plus the Retry-After header.
    const err = new HttpError(429, 'rate limited', 'OTP_COOLDOWN');
    err.retryRaw = { body: { retry_after_seconds: 42 }, retryAfter: '42', rateLimitReset: null };
    mockRequestOtp.mockRejectedValue(err);

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(/wait 42 seconds/i)).toBeTruthy());
  });
});
