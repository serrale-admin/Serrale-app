/**
 * Navigation / render smoke coverage — every route under app/ mounts without
 * throwing and shows a key element. This is the one automated item from the
 * Task 11 "Required automated coverage" list that had no test: a per-route
 * mount/render assertion for all four tabs plus every stack/utility route.
 *
 * Conventions reused from the existing suite (see localization.test.tsx,
 * request.test.tsx, login.test.tsx): AsyncStorage is mocked globally by
 * jest.setup.js; `expo-router` and the `src/api` facade are mocked at the module
 * boundary so screens render offline and deterministically. The concrete query
 * hooks (hooks/queries.ts) run for real against the mocked API through a real
 * QueryClient, so this exercises the true screen → hook → adapter render path,
 * not a stub of it. Dynamic routes render with a representative param and cover
 * loading / loaded / error query states where cheap.
 */
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { presentError } from '../../src/lib/error-presentation';
import { HttpError } from '../../src/lib/http';
import { labelsFor } from '../../src/lib/labels';
import { useAppStore } from '../../src/store/appStore';
import type { Category, Provider } from '../../src/types';

// ─── screens under test ────────────────────────────────────────────────────
import HomeScreen from '../(tabs)/home';
import ProfileScreen from '../(tabs)/profile';
import RequestScreen from '../(tabs)/request';
import SearchScreen from '../(tabs)/search';
import LoginScreen from '../auth/login';
import VerifyScreen from '../auth/verify';
import BookmarksScreen from '../bookmarks';
import CategoryDetailScreen from '../categories/[id]';
import CategoriesIndexScreen from '../categories/index';
import HelpScreen from '../help';
import Splash from '../index';
import LanguageScreen from '../language';
import ProviderDetailScreen from '../provider/[id]';
import ProvidersScreen from '../providers';
import SafetyScreen from '../safety';
import SettingsScreen from '../settings';

// ─── mocks ───────────────────────────────────────────────────────────────────
// A single mutable params object lets each dynamic-route test set its own params
// (mock-prefixed so the hoisted expo-router factory may reference it).
let mockRouteParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() }),
    useLocalSearchParams: () => mockRouteParams,
    useSegments: () => [],
    useFocusEffect: (effect: () => void | (() => void)) => {
      React.useEffect(() => effect(), [effect]);
    },
    Redirect: ({ href }: { href: string }) => {
      const { Text } = require('react-native');
      return <Text>{`redirect:${href}`}</Text>;
    },
  };
});

// Mock the API facade: keep the real constants + typed-error classes (spread of
// requireActual) but replace every data function with a jest.fn we drive per
// test. Every query hook funnels through this module, so this is the one seam.
jest.mock('../../src/api', () => {
  const actual = jest.requireActual('../../src/api');
  return {
    ...actual,
    getCategories: jest.fn(),
    getCategoryGroups: jest.fn(),
    getCategory: jest.fn(),
    getProviders: jest.fn(),
    getProvider: jest.fn(),
    getNearbyProviders: jest.fn(),
    getVerifiedProviders: jest.fn(),
    getRecentWork: jest.fn(),
    getProviderPastWork: jest.fn(),
    getProviderReviews: jest.fn(),
    getReviewEligibility: jest.fn(),
    searchSuggest: jest.fn(),
    logProviderContact: jest.fn(),
    createServiceRequest: jest.fn(),
    fetchMyActivity: jest.fn(),
    fetchActivityDetail: jest.fn(),
  };
});

// eslint-disable-next-line import/first
import * as api from '../../src/api';

const en = labelsFor('en');

// ─── fixtures ──────────────────────────────────────────────────────────────
const CATEGORY: Category = {
  id: 'plumbers',
  name: 'Plumbers',
  am: 'ቧንቧ ሠራተኞች',
  icon: 'ph-wrench',
  count: 126,
  group: 'Home Services',
  subs: ['Leak repair', 'Pipe fitting'],
};

const PROVIDER: Provider = {
  id: 'tekle-plumbing',
  name: 'Tekle Plumbing',
  service: 'Plumber',
  categoryId: 'plumbers',
  rating: 4.8,
  reviewCount: 12,
  area: 'Bole',
  verified: true,
  adminReviewed: true,
  availableToday: true,
  hasPastWork: true,
  exp: 6,
  price: 'Standard',
  description: 'Reliable plumbing across Addis.',
  phone: '+251911000000',
  whatsapp: '+251911000000',
};

const PAGE = { items: [PROVIDER], page: 0, pageSize: 20, total: 1, hasMore: false };

// Synchronous safe-area insets so screens reading useSafeAreaInsets (provider
// detail) mount without an async layout pass.
const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// ─── render harness ──────────────────────────────────────────────────────────
const clients: QueryClient[] = [];
const views: ReturnType<typeof render>[] = [];

function renderScreen(ui: React.ReactElement) {
  // retry:false + gcTime:0 so a rejected query fails immediately and no cache GC
  // timer outlives the test (keeps the jest worker exiting cleanly).
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  clients.push(client);
  const view = render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
  views.push(view);
  return { ...view, client };
}

/** Wait for every in-flight query to settle so nothing updates after teardown. */
async function settle(client: QueryClient) {
  await waitFor(() => expect(client.isFetching()).toBe(0));
}

/**
 * Assert an ErrorBlock surfaced the localized, user-safe copy the real
 * error-presentation mapper produces for `error` — never a raw backend message.
 */
async function expectMappedError(error: unknown) {
  const view = presentError(error, en);
  expect(await screen.findByText(view.title)).toBeTruthy();
  expect(screen.getByText(view.message)).toBeTruthy();
}

beforeEach(() => {
  mockRouteParams = {};
  useAppStore.setState({ lang: 'en', loggedIn: false, hasCustomerSession: false, user: null, saved: {}, area: 'Addis Ababa', sessionReady: true, providerProfile: null, activeSession: null });
  useAppStore.getState().resetFilters();
  useAppStore.setState({ pendingPhone: '', pendingChallengeId: '' });

  (api.getCategories as jest.Mock).mockResolvedValue([CATEGORY]);
  (api.getCategoryGroups as jest.Mock).mockResolvedValue([{ name: 'Home Services', items: [CATEGORY] }]);
  (api.getCategory as jest.Mock).mockResolvedValue(CATEGORY);
  (api.getProviders as jest.Mock).mockResolvedValue(PAGE);
  (api.getProvider as jest.Mock).mockResolvedValue(PROVIDER);
  (api.getNearbyProviders as jest.Mock).mockResolvedValue([PROVIDER]);
  (api.getVerifiedProviders as jest.Mock).mockResolvedValue([PROVIDER]);
  (api.getRecentWork as jest.Mock).mockResolvedValue([]);
  (api.getProviderPastWork as jest.Mock).mockResolvedValue([]);
  (api.getProviderReviews as jest.Mock).mockResolvedValue([]);
  (api.getReviewEligibility as jest.Mock).mockResolvedValue({ status: 'eligible' });
  (api.searchSuggest as jest.Mock).mockResolvedValue([]);
  (api.logProviderContact as jest.Mock).mockResolvedValue(undefined);
  (api.createServiceRequest as jest.Mock).mockResolvedValue({ ok: true, duplicate: false });
  (api.fetchMyActivity as jest.Mock).mockResolvedValue({ items: [], total: 0 });
  (api.fetchActivityDetail as jest.Mock).mockResolvedValue(null);
});

afterEach(() => {
  useAppStore.getState().hideToast();
  views.splice(0).forEach((view) => view.unmount());
  clients.splice(0).forEach((client) => client.clear());
  jest.clearAllMocks();
});

// ─── bottom tabs ─────────────────────────────────────────────────────────────
describe('bottom-tab routes mount and render', () => {
  it('home renders its brand header and section rails', async () => {
    const { client } = renderScreen(<HomeScreen />);
    expect(screen.getByLabelText('SERRALE')).toBeTruthy();
    expect(screen.getByText(en.nearbyTitle)).toBeTruthy();
    await settle(client);
  });

  it('search (categories) renders its title and search field', async () => {
    const { client } = renderScreen(<SearchScreen />);
    expect(screen.getByText(en.categories.title)).toBeTruthy();
    expect(screen.getByPlaceholderText(en.categories.searchPlaceholder)).toBeTruthy();
    await settle(client);
  });

  it('request shows loading skeleton while session is hydrating', () => {
    useAppStore.setState({ sessionReady: false, hasCustomerSession: false, loggedIn: true });
    renderScreen(<RequestScreen />);
    expect(screen.queryByText(en.request.gateTitle)).toBeNull();
    expect(screen.getByText(en.request.title)).toBeTruthy();
  });

  it('request renders the guest gate when signed out', () => {
    useAppStore.setState({ sessionReady: true, hasCustomerSession: false, loggedIn: false });
    renderScreen(<RequestScreen />);
    expect(screen.getByText(en.request.gateTitle)).toBeTruthy();
  });

  it('request renders the submission form when signed in', () => {
    useAppStore.setState({ loggedIn: true, hasCustomerSession: true, sessionReady: true, activeSession: 'customer' });
    renderScreen(<RequestScreen />);
    expect(screen.getByText(en.request.title)).toBeTruthy();
    expect(screen.getByText(en.request.serviceLabel)).toBeTruthy();
  });

  it('request allows hybrid provider sessions to submit requests', () => {
    useAppStore.setState({
      loggedIn: true,
      hasCustomerSession: true,
      sessionReady: true,
      activeSession: 'provider',
      user: { name: 'Abebe', phone: '+251911000000', profileComplete: true },
    });
    renderScreen(<RequestScreen />);
    expect(screen.getByText(en.request.title)).toBeTruthy();
    expect(screen.getByText(en.request.serviceLabel)).toBeTruthy();
  });

  it('request keeps guest gate only when fully signed out', () => {
    useAppStore.setState({
      loggedIn: false,
      hasCustomerSession: false,
      sessionReady: true,
      activeSession: null,
      user: null,
    });
    renderScreen(<RequestScreen />);
    expect(screen.getByText(en.request.gateTitle)).toBeTruthy();
    expect(screen.queryByText(en.request.serviceLabel)).toBeNull();
  });

  it('request allows provider-only sessions to submit requests', () => {
    useAppStore.setState({
      loggedIn: true,
      hasCustomerSession: false,
      sessionReady: true,
      activeSession: 'provider',
      user: { name: 'Abebe', phone: '+251911000000', profileComplete: true },
    });
    renderScreen(<RequestScreen />);
    expect(screen.getByText(en.request.title)).toBeTruthy();
    expect(screen.getByText(en.request.serviceLabel)).toBeTruthy();
  });

  it('profile renders the guest card when signed out', () => {
    renderScreen(<ProfileScreen />);
    expect(screen.getByText(en.tabs.profile)).toBeTruthy();
    expect(screen.getByText(en.common.welcomeToSerrale)).toBeTruthy();
  });

  it('profile renders the account rows when signed in', () => {
    useAppStore.setState({
      loggedIn: true,
      hasCustomerSession: true,
      sessionReady: true,
      activeSession: 'customer',
      user: { name: 'Sara T.', phone: '+251911000000', profileComplete: true },
    });
    renderScreen(<ProfileScreen />);
    expect(screen.getByText('Sara T.')).toBeTruthy();
    expect(screen.getByText(en.profile.logout)).toBeTruthy();
  });
});

// ─── stack + utility routes ──────────────────────────────────────────────────
describe('stack + utility routes mount and render', () => {
  it('providers renders results for the loaded state', async () => {
    const { client } = renderScreen(<ProvidersScreen />);
    expect(screen.getByLabelText(en.a11y.searchProviders)).toBeTruthy();
    await settle(client);
    expect(await screen.findByText(PROVIDER.name)).toBeTruthy();
  });

  it('providers renders a safe error surface when the list fails to load', async () => {
    const err = new HttpError(500, 'boom', 'INTERNAL');
    (api.getProviders as jest.Mock).mockRejectedValue(err);
    const { client } = renderScreen(<ProvidersScreen />);
    await settle(client);
    await expectMappedError(err);
  });

  it('categories/[id] renders provider results for a representative slug', async () => {
    mockRouteParams = { id: 'plumbers' };
    const { client } = renderScreen(<CategoryDetailScreen />);
    await settle(client);
    expect(await screen.findByText(PROVIDER.name)).toBeTruthy();
    expect(api.getProviders).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'plumbers' }),
    );
  });

  it('categories/[id] renders a safe error surface when the list fails', async () => {
    mockRouteParams = { id: 'plumbers' };
    const err = new HttpError(503, 'down', 'MAINTENANCE');
    (api.getProviders as jest.Mock).mockRejectedValue(err);
    const { client } = renderScreen(<CategoryDetailScreen />);
    await settle(client);
    await expectMappedError(err);
  });

  it('provider/[id] shows the loading indicator before data arrives', () => {
    mockRouteParams = { id: 'tekle-plumbing' };
    renderScreen(<ProviderDetailScreen />);
    expect(screen.getByLabelText(en.a11y.loadingProvider)).toBeTruthy();
  });

  it('provider/[id] renders the profile and logs a single profile_view on load', async () => {
    mockRouteParams = { id: 'tekle-plumbing' };
    const { client } = renderScreen(<ProviderDetailScreen />);
    await settle(client);
    expect(await screen.findByText(PROVIDER.name)).toBeTruthy();
    // Contract matrix M-6: a profile_view is logged once when the provider loads.
    await waitFor(() => expect(api.logProviderContact).toHaveBeenCalledTimes(1));
    expect(api.logProviderContact).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'tekle-plumbing', eventType: 'profile_view' }),
    );
  });

  it('provider/[id] renders a safe error surface when the fetch fails', async () => {
    mockRouteParams = { id: 'missing' };
    const err = new HttpError(404, 'nope', 'NOT_FOUND');
    (api.getProvider as jest.Mock).mockRejectedValue(err);
    const { client } = renderScreen(<ProviderDetailScreen />);
    await settle(client);
    await expectMappedError(err);
  });

  it('categories/index redirects to the search tab', () => {
    renderScreen(<CategoriesIndexScreen />);
    expect(screen.getByText('redirect:/(tabs)/search')).toBeTruthy();
  });

  it('bookmarks renders the empty state with no saved providers', () => {
    useAppStore.setState({ loggedIn: true, sessionReady: true, hasCustomerSession: true });
    renderScreen(<BookmarksScreen />);
    expect(screen.getByText(en.activity.tabRequests)).toBeTruthy();
    expect(screen.getByText(en.activity.tabSaved)).toBeTruthy();
    expect(screen.getByText(en.common.savedProviders)).toBeTruthy();
    expect(screen.getByText(en.bookmarks.emptyTitle)).toBeTruthy();
  });

  it('bookmarks saved tab shows login gate when signed out', () => {
    mockRouteParams = { tab: 'saved' };
    useAppStore.setState({ loggedIn: false, sessionReady: true, saved: { 'tekle-plumbing': true } });
    renderScreen(<BookmarksScreen />);
    expect(screen.getByText(en.bookmarks.loginTitle)).toBeTruthy();
    expect(screen.queryByText(PROVIDER.name)).toBeNull();
  });

  it('bookmarks renders a saved provider row when one is saved', async () => {
    useAppStore.setState({
      loggedIn: true,
      sessionReady: true,
      hasCustomerSession: true,
      saved: { 'tekle-plumbing': true },
    });
    const { client } = renderScreen(<BookmarksScreen />);
    await settle(client);
    expect(await screen.findByText(PROVIDER.name)).toBeTruthy();
    expect(api.getProvider).toHaveBeenCalledWith('tekle-plumbing');
  });

  it('bookmarks requests tab shows skeleton while session is hydrating', () => {
    mockRouteParams = { tab: 'requests' };
    useAppStore.setState({ sessionReady: false, hasCustomerSession: false, loggedIn: true });
    renderScreen(<BookmarksScreen />);
    expect(screen.queryByText(en.activity.loginTitle)).toBeNull();
    expect(api.fetchMyActivity).not.toHaveBeenCalled();
  });

  it('bookmarks requests tab loads history for provider-only sessions', async () => {
    mockRouteParams = { tab: 'requests' };
    useAppStore.setState({
      sessionReady: true,
      loggedIn: true,
      hasCustomerSession: false,
      activeSession: 'provider',
      providerProfile: {
        id: 'prov-1',
        full_name: 'Abebe',
        phone: '+251911000000',
        category_slug: 'plumbers',
      },
      user: { name: 'Abebe', phone: '+251911000000', profileComplete: true },
    });
    (api.fetchMyActivity as jest.Mock).mockResolvedValue({
      items: [
        {
          type: 'request',
          id: 'req-1',
          title: 'Plumbing help',
          display_status: 'submitted',
          engagement: 'temporary',
          location: 'Bole',
          created_at: '2026-07-01T10:00:00.000Z',
        },
      ],
      total: 1,
    });
    const { client } = renderScreen(<BookmarksScreen />);
    await settle(client);
    expect(api.fetchMyActivity).toHaveBeenCalled();
    expect(await screen.findByText('Plumbing help')).toBeTruthy();
  });

  it('bookmarks requests tab allows provider profile even if loggedIn flag lagged', async () => {
    mockRouteParams = { tab: 'requests' };
    useAppStore.setState({
      sessionReady: true,
      loggedIn: false,
      hasCustomerSession: false,
      activeSession: 'provider',
      providerProfile: {
        id: 'prov-1',
        full_name: 'Abebe',
        phone: '+251911000000',
        category_slug: 'plumbers',
      },
      user: null,
    });
    (api.fetchMyActivity as jest.Mock).mockResolvedValue({ items: [], total: 0 });
    const { client } = renderScreen(<BookmarksScreen />);
    await settle(client);
    expect(screen.queryByText(en.activity.loginTitle)).toBeNull();
    expect(api.fetchMyActivity).toHaveBeenCalled();
  });

  it('bookmarks requests tab shows login gate when signed out', () => {
    mockRouteParams = { tab: 'requests' };
    useAppStore.setState({
      sessionReady: true,
      loggedIn: false,
      hasCustomerSession: false,
      activeSession: null,
      user: null,
    });
    renderScreen(<BookmarksScreen />);
    expect(screen.getByText(en.activity.loginTitle)).toBeTruthy();
    expect(api.fetchMyActivity).not.toHaveBeenCalled();
  });

  it('bookmarks requests tab loads history for hybrid provider sessions', async () => {
    mockRouteParams = { tab: 'requests' };
    useAppStore.setState({
      sessionReady: true,
      loggedIn: true,
      hasCustomerSession: true,
      activeSession: 'provider',
      user: { name: 'Abebe', phone: '+251911000000', profileComplete: true },
    });
    (api.fetchMyActivity as jest.Mock).mockResolvedValue({
      items: [
        {
          type: 'request',
          id: 'req-1',
          title: 'Plumbing help',
          display_status: 'submitted',
          engagement: 'temporary',
          location: 'Bole',
          created_at: '2026-07-01T10:00:00.000Z',
        },
      ],
      total: 1,
    });
    const { client } = renderScreen(<BookmarksScreen />);
    await settle(client);
    expect(api.fetchMyActivity).toHaveBeenCalled();
    expect(await screen.findByText('Plumbing help')).toBeTruthy();
  });

  it('settings renders its grouped rows', () => {
    renderScreen(<SettingsScreen />);
    expect(screen.getByText(en.common.settings)).toBeTruthy();
    expect(screen.getByText(en.settings.defaultArea)).toBeTruthy();
  });

  it('help renders its support rows', () => {
    renderScreen(<HelpScreen />);
    expect(screen.getByText(en.common.helpSupport)).toBeTruthy();
    expect(screen.getByText(en.help.callSupport)).toBeTruthy();
  });

  it('language renders both language options', () => {
    renderScreen(<LanguageScreen />);
    expect(screen.getByText(en.common.language)).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('አማርኛ')).toBeTruthy();
  });

  it('safety renders the safety tips', () => {
    renderScreen(<SafetyScreen />);
    expect(screen.getByText(en.common.safetyTips)).toBeTruthy();
    expect(screen.getByText(en.safety.tip1Title)).toBeTruthy();
  });

  it('index (splash) renders the branded loading screen', () => {
    renderScreen(<Splash />);
    expect(screen.getByText(en.splash.tagline)).toBeTruthy();
    expect(screen.getByText(en.splash.preparing)).toBeTruthy();
  });
});

// ─── auth routes ──────────────────────────────────────────────────────────────
// Deeper behavior (send-dedup, resend countdown, verify routing) is covered by
// login.test.tsx / verify.test.tsx; here we only assert each auth route mounts.
describe('auth routes mount and render', () => {
  it('auth/login renders the phone entry form', () => {
    renderScreen(<LoginScreen />);
    expect(screen.getByPlaceholderText('9 12 345 678')).toBeTruthy();
    expect(screen.getByText('Send code')).toBeTruthy();
  });

  it('auth/verify renders the code entry with a live challenge', () => {
    useAppStore.setState({ pendingPhone: '+251911000000', pendingChallengeId: 'chal-1' });
    renderScreen(<VerifyScreen />);
    // Six empty OTP boxes render (the code entry surface).
    expect(screen.getAllByDisplayValue('').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/Resend code in 60s/)).toBeTruthy();
  });
});
