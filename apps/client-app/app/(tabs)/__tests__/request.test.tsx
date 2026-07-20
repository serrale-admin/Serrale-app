import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { ApiBusinessError } from '../../../src/lib/http';
import { labelsFor } from '../../../src/lib/labels';
import { useAppStore } from '../../../src/store/appStore';
import RequestScreen from '../request';

const mockMutation = {
  data: undefined,
  error: new ApiBusinessError('SELECT * FROM leads; supabase body +251912345678', 'PGRST204'),
  isError: true,
  isPending: false,
  isSuccess: false,
  mutate: jest.fn(),
  reset: jest.fn(),
  variables: undefined,
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
}));

jest.mock('../../../src/hooks/queries', () => ({
  useCreateRequest: () => mockMutation,
}));

jest.mock('../../../src/components/CategorySheet', () => () => null);
jest.mock('../../../src/components/LocationSheet', () => () => null);

describe('RequestScreen error presentation', () => {
  beforeEach(() => {
    useAppStore.setState({
      loggedIn: true,
      hasCustomerSession: true,
      sessionReady: true,
      activeSession: 'customer',
      lang: 'en',
      toast: null,
    });
  });

  it('maps raw backend errors to safe toast copy (never leaks SQL/PII)', () => {
    render(<RequestScreen />);

    const en = labelsFor('en');
    expect(useAppStore.getState().toast?.text).toBe(en.errors.unknownMessage);
    expect(screen.getByText(en.errors.retry)).toBeTruthy();
    expect(screen.queryByText(/supabase|SELECT|PGRST204|\+251912345678/i)).toBeNull();
  });
});
