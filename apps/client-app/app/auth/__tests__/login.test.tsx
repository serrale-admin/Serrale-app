/**
 * Login screen — unified client OTP send, route pass-through, and 429 copy.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ApiBusinessError, HttpError } from '../../../src/lib/http';
import { labelsFor } from '../../../src/lib/labels';
import { useAppStore } from '../../../src/store/appStore';
import LoginScreen from '../login';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockRequestOtp = jest.fn();
const mockFetchPhoneAccountHint = jest.fn();
let mockRouteParams: Record<string, string | undefined> = {};
const en = labelsFor('en');

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  useLocalSearchParams: () => mockRouteParams,
}));

jest.mock('../../../src/api', () => {
  const actual = jest.requireActual('../../../src/lib/http');
  return {
    requestOtp: (...args: unknown[]) => mockRequestOtp(...args),
    fetchPhoneAccountHint: (...args: unknown[]) => mockFetchPhoneAccountHint(...args),
    NetworkError: actual.NetworkError,
    HttpError: actual.HttpError,
    ApiBusinessError: actual.ApiBusinessError,
  };
});

const clients: QueryClient[] = [];
const renders: ReturnType<typeof render>[] = [];

function renderLogin() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } });
  clients.push(client);
  const view = render(
    <QueryClientProvider client={client}>
      <LoginScreen />
    </QueryClientProvider>,
  );
  renders.push(view);
  return { ...view, client };
}

function typeValidPhone() {
  const input = screen.getByPlaceholderText('9 12 345 678');
  fireEvent.changeText(input, '0912345678');
  return input;
}

beforeEach(() => {
  mockReplace.mockReset();
  mockBack.mockReset();
  mockCanGoBack.mockReset();
  mockCanGoBack.mockReturnValue(false);
  mockRequestOtp.mockReset();
  mockFetchPhoneAccountHint.mockReset();
  mockFetchPhoneAccountHint.mockResolvedValue(null);
  mockRouteParams = {};
});

afterEach(() => {
  useAppStore.getState().hideToast();
  renders.splice(0).forEach((view) => view.unmount());
  clients.splice(0).forEach((client) => client.clear());
});

describe('LoginScreen send dedup', () => {
  it('fires exactly ONE requestOtp mutation for many rapid taps (in-flight guard)', async () => {
    let resolveSend: (v: unknown) => void = () => {};
    mockRequestOtp.mockImplementation(
      () => new Promise((resolve) => { resolveSend = resolve; }),
    );

    renderLogin();
    typeValidPhone();
    const sendBtn = screen.getByText('Send code');

    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);
    fireEvent.press(sendBtn);

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByLabelText('Sending…')).toBeTruthy());

    expect(mockRequestOtp).toHaveBeenCalledWith(
      '0912345678',
      'directory_customer_login',
      expect.stringMatching(/^otp_/),
    );

    resolveSend({ challengeId: 'c1', expiresAt: new Date().toISOString() });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Send code')).toBeTruthy());
  });

  it('does NOT call the API when the phone is invalid (inline validation gates the network)', async () => {
    renderLogin();
    const input = screen.getByPlaceholderText('9 12 345 678');
    fireEvent.changeText(input, '0812345678');
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
        params: { next: '/(tabs)/request', intent: 'request' },
      }),
    );
    expect(mockRequestOtp).toHaveBeenCalledWith(
      '0912345678',
      'directory_customer_request',
      expect.stringMatching(/^otp_/),
    );
  });

  it('never surfaces a returning user name before OTP verification', async () => {
    mockRequestOtp.mockResolvedValue({
      challengeId: 'c-named',
      expiresAt: new Date().toISOString(),
      account: {
        has_customer: false,
        has_provider: true,
        customer_profile_complete: false,
        provider_display_name: 'Natnael Asnake',
      },
    });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(screen.queryByText(/Natnael/i)).toBeNull();
    expect(useAppStore.getState().toast?.text?.includes('Natnael')).not.toBe(true);
  });

  it('sets pendingAuthRole to customer for unified client login', async () => {
    mockRequestOtp.mockResolvedValue({ challengeId: 'c1', expiresAt: new Date().toISOString() });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(useAppStore.getState().pendingAuthRole).toBe('customer');
  });

  it('persists review-code delivery from the initial login send so verify can explain why no SMS arrived', async () => {
    mockRequestOtp.mockResolvedValue({
      challengeId: 'c-review',
      expiresAt: new Date().toISOString(),
      delivery: 'review_code',
    });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth/verify',
      params: { next: undefined },
    }));
    expect(useAppStore.getState().pendingOtpDelivery).toBe('review_code');
  });

  it('routes provider phones into provider OTP flow', async () => {
    mockFetchPhoneAccountHint.mockResolvedValue({
      account: {
        has_customer: true,
        has_provider: true,
        customer_profile_complete: true,
      },
      resolved_role: 'provider',
    });
    mockRequestOtp.mockResolvedValue({
      challengeId: 'provider-c1',
      expiresAt: new Date().toISOString(),
      account: {
        has_customer: true,
        has_provider: true,
        customer_profile_complete: true,
      },
    });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalled());
    expect(mockRequestOtp).toHaveBeenCalledWith(
      '0912345678',
      'directory_provider_login',
      expect.stringMatching(/^otp_/),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(useAppStore.getState().pendingAuthRole).toBe('provider');
  });

  it('falls back to the explicitly selected provider login path when hint lookup fails', async () => {
    mockRouteParams = { role: 'provider' };
    mockFetchPhoneAccountHint.mockRejectedValue(new Error('network down'));
    mockRequestOtp.mockResolvedValue({ challengeId: 'provider-c2', expiresAt: new Date().toISOString() });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalled());
    expect(mockRequestOtp).toHaveBeenCalledWith(
      '0912345678',
      'directory_provider_login',
      expect.stringMatching(/^otp_/),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/auth/verify',
      params: { next: undefined, role: 'provider' },
    }));
    expect(useAppStore.getState().pendingAuthRole).toBe('provider');
  });
});

describe('LoginScreen account missing', () => {
  it('blocks bare customer login before OTP when the DB hint says no customer account exists', async () => {
    mockFetchPhoneAccountHint.mockResolvedValue({
      account: {
        has_customer: false,
        has_provider: false,
        customer_profile_complete: false,
      },
      resolved_role: 'customer',
    });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(/No customer account/i)).toBeTruthy());
    expect(mockRequestOtp).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Create a customer profile')).toBeTruthy();
  });

  it('blocks provider login before OTP when the DB hint says no provider account exists', async () => {
    mockRouteParams = { role: 'provider' };
    mockFetchPhoneAccountHint.mockResolvedValue({
      account: {
        has_customer: true,
        has_provider: false,
        customer_profile_complete: true,
      },
      resolved_role: 'provider',
    });

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(/No provider account/i)).toBeTruthy());
    expect(mockRequestOtp).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Register as a provider')).toBeTruthy();
  });

  it('shows register CTA and does not open verify when customer account is missing', async () => {
    mockRequestOtp.mockRejectedValue(new HttpError(404, 'not found', 'CUSTOMER_NOT_FOUND'));

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(/No customer account/i)).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Create a customer profile')).toBeTruthy();
  });
});

describe('LoginScreen 429 copy', () => {
  it('shows the specific server wait time parsed from raw 429 signals', async () => {
    const err = new HttpError(429, 'rate limited', 'OTP_COOLDOWN');
    err.retryRaw = { body: { retry_after_seconds: 42 }, retryAfter: '42', rateLimitReset: null };
    mockRequestOtp.mockRejectedValue(err);

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(/42 seconds/i)).toBeTruthy());
  });

  it('never renders or toasts a raw backend business-error message', async () => {
    mockRequestOtp.mockRejectedValue(
      new ApiBusinessError('SELECT * FROM users; supabase provider body +251912345678', 'PGRST204'),
    );

    renderLogin();
    typeValidPhone();
    fireEvent.press(screen.getByText('Send code'));

    await waitFor(() => expect(screen.getByText(en.errors.unknownMessage)).toBeTruthy());
    expect(screen.queryByText(/supabase|SELECT|PGRST204|\+251912345678/i)).toBeNull();
    expect(useAppStore.getState().toast).toBeNull();
  });
});
