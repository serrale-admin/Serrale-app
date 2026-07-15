/**
 * Provider join — Amharic copy parity and OTP/register wiring (mock API).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { TextInput } from 'react-native';
import { CATS } from '../../../src/data/mock';
import { fill, labelsFor } from '../../../src/lib/labels';
import { providerSession } from '../../../src/lib/provider-session';
import { useAppStore } from '../../../src/store/appStore';
import ProviderJoinScreen from '../join';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockRequestOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockRegisterProvider = jest.fn();

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
}));

jest.mock('../../../src/lib/provider-session', () => ({
  providerSession: {
    write: jest.fn(async () => {}),
    read: jest.fn(async () => null),
    clear: jest.fn(async () => {}),
  },
}));

jest.mock('../../../src/api', () => {
  const actual = jest.requireActual('../../../src/lib/http');
  return {
    requestOtp: (...args: unknown[]) => mockRequestOtp(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    registerProvider: (...args: unknown[]) => mockRegisterProvider(...args),
    HttpError: actual.HttpError,
  };
});

const am = labelsFor('am');
const en = labelsFor('en');
const plumbers = CATS.find((c) => c.id === 'plumbers')!;

function renderJoin(lang: 'en' | 'am' = 'en') {
  useAppStore.setState({ lang });
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } });
  const view = render(
    <QueryClientProvider client={client}>
      <ProviderJoinScreen />
    </QueryClientProvider>,
  );
  return { view, client };
}

function fillRequiredFields(name = 'Abebe Kebede', phone = '0912345678') {
  const inputs = screen.UNSAFE_getAllByType(TextInput);
  fireEvent.changeText(inputs[0], name);
  fireEvent.changeText(inputs[1], phone);
}

function acceptTerms() {
  fireEvent.press(screen.getByRole('checkbox'));
}

function pickCategory(lang: 'en' | 'am') {
  const labels = labelsFor(lang);
  fireEvent.press(screen.getByText(labels.providerJoin.selectCategory));
  fireEvent.press(screen.getByText(lang === 'am' ? plumbers.am : plumbers.name));
}

beforeEach(() => {
  mockReplace.mockReset();
  mockBack.mockReset();
  mockCanGoBack.mockReturnValue(false);
  mockRequestOtp.mockReset();
  mockVerifyOtp.mockReset();
  mockRegisterProvider.mockReset();
  useAppStore.getState().hideToast();
  useAppStore.setState({ lang: 'en' });
});

afterEach(() => {
  useAppStore.getState().hideToast();
});

describe('ProviderJoinScreen Amharic', () => {
  it('renders web-aligned Amharic register copy', () => {
    renderJoin('am');
    expect(screen.getByText(am.providerJoin.title)).toBeTruthy();
    expect(screen.getByText(am.providerJoin.submit)).toBeTruthy();
    expect(screen.getByText(am.providerJoin.sectionContact)).toBeTruthy();
  });

  it('shows Amharic validation toast when category is missing', async () => {
    renderJoin('am');
    fillRequiredFields();
    acceptTerms();
    fireEvent.press(screen.getByText(am.providerJoin.submit));
    await waitFor(() => expect(useAppStore.getState().toast?.text).toBe(am.providerJoin.categoryRequired));
    expect(mockRequestOtp).not.toHaveBeenCalled();
  });

  it('shows terms required toast when terms are not accepted', async () => {
    renderJoin('en');
    fillRequiredFields();
    pickCategory('en');
    fireEvent.press(screen.getByText(en.providerJoin.submit));
    await waitFor(() => expect(useAppStore.getState().toast?.text).toBe(en.providerJoin.termsRequired));
    expect(mockRequestOtp).not.toHaveBeenCalled();
  });
});

describe('ProviderJoinScreen OTP flow', () => {
  it('requests directory_provider_join OTP after a valid form submit', async () => {
    mockRequestOtp.mockResolvedValue({ challengeId: 'ch-1', expiresAt: new Date().toISOString() });

    renderJoin('en');
    fillRequiredFields();
    pickCategory('en');
    acceptTerms();
    fireEvent.press(screen.getByText(en.providerJoin.submit));

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalledTimes(1));
    expect(mockRequestOtp).toHaveBeenCalledWith(
      '+251912345678',
      'directory_provider_join',
      expect.stringMatching(/^otp_/),
    );
    await waitFor(() => expect(screen.getByText(en.providerJoin.otpSentTitle)).toBeTruthy());
  });

  it('supports Amharic category labels in the picker', async () => {
    mockRequestOtp.mockResolvedValue({ challengeId: 'ch-1', expiresAt: new Date().toISOString() });

    renderJoin('am');
    fillRequiredFields();
    pickCategory('am');
    expect(screen.getByText(plumbers.am)).toBeTruthy();
    acceptTerms();
    fireEvent.press(screen.getByText(am.providerJoin.submit));

    await waitFor(() => expect(mockRequestOtp).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText(am.providerJoin.otpSentTitle)).toBeTruthy());
  });

  it('completes verify and register in Amharic without crashing', async () => {
    mockRequestOtp.mockResolvedValue({ challengeId: 'ch-am', expiresAt: new Date().toISOString() });
    mockVerifyOtp.mockResolvedValue({ verified: true, verifyToken: 'vt-1' });
    mockRegisterProvider.mockResolvedValue({
      session_token: 'st-1',
      provider: {
        id: 'p-1',
        full_name: 'Abebe Kebede',
        phone: '+251912345678',
        category_slug: 'plumbers',
      },
    });

    renderJoin('am');
    fillRequiredFields();
    pickCategory('am');
    acceptTerms();
    fireEvent.press(screen.getByText(am.providerJoin.submit));

    await waitFor(() => expect(screen.getByText(am.providerJoin.otpSentTitle)).toBeTruthy());

    for (let i = 0; i < 6; i += 1) {
      fireEvent.changeText(screen.getByLabelText(fill(am.a11y.digit, { n: i + 1 })), String(i + 1));
    }

    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    await waitFor(() => expect(mockRegisterProvider).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(providerSession.write).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText(am.providerJoin.successTitle)).toBeTruthy());
    expect(useAppStore.getState().activeSession).toBe('provider');
    expect(useAppStore.getState().providerProfile?.id).toBe('p-1');
  });
});
