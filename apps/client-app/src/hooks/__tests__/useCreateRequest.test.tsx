import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useCreateRequest } from '../queries';
import * as api from '../../api';
import type { ServiceRequest } from '../../types';

jest.mock('../../api', () => ({
  __esModule: true,
  createServiceRequest: jest.fn(),
}));

const mockCreate = api.createServiceRequest as jest.MockedFunction<typeof api.createServiceRequest>;

const INPUT: ServiceRequest = {
  categoryId: 'plumbers',
  area: 'Bole',
  description: 'Leaking sink.',
  when: 'Today',
  budget: '',
  preferredContact: 'Both',
};

const clients: QueryClient[] = [];
const unmounts: (() => void)[] = [];

function renderCreateRequestHook() {
  // gcTime 0 so no cache GC timers outlive the test (keeps the jest worker
  // exiting cleanly); retry off so a rejected mutation fails immediately.
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  clients.push(client);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useCreateRequest(), { wrapper: Wrapper });
  unmounts.push(view.unmount);
  return view;
}

beforeEach(() => {
  mockCreate.mockReset();
});

afterEach(() => {
  // Detach mutation observers before clearing their clients. This prevents
  // React Query's scheduled notifications/GC callbacks from updating an
  // already-finished hook test in a later suite.
  unmounts.splice(0).forEach((unmount) => unmount());
  clients.splice(0).forEach((client) => client.clear());
});

describe('useCreateRequest — idempotency key stability', () => {
  it('reuses the SAME key across retry-taps of one failed submission, then mints a fresh one after success', async () => {
    const keys: (string | undefined)[] = [];
    mockCreate.mockImplementation((_input, key?: string) => {
      keys.push(key);
      return keys.length === 1
        ? Promise.reject(new Error('offline'))
        : Promise.resolve({ ok: true, duplicate: false });
    });

    const { result } = renderCreateRequestHook();

    // First attempt fails (offline/timeout).
    await act(async () => {
      await expect(result.current.mutateAsync(INPUT)).rejects.toThrow('offline');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    // Retry-tap of the SAME logical submission.
    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]); // stable across the retry → server replays, no duplicate

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // A NEW logical submission after success gets a fresh key.
    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(keys).toHaveLength(3);
    expect(keys[2]).toBeTruthy();
    expect(keys[2]).not.toBe(keys[0]);
  });

  it('passes the form input through unchanged', async () => {
    mockCreate.mockResolvedValue({ ok: true, duplicate: false });
    const { result } = renderCreateRequestHook();
    await act(async () => {
      await result.current.mutateAsync(INPUT);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreate.mock.calls[0][0]).toEqual(INPUT);
  });
});
