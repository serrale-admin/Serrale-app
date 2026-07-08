/**
 * End-to-end localization smoke: with the store language set to Amharic, a
 * migrated screen renders its Amharic copy and shows NO raw English for the keys
 * it owns. This exercises the whole path — `useLabels()` → store `lang` →
 * `labelsFor` — not just the label table in isolation.
 */
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { labelsFor } from '../../src/lib/labels';
import { useAppStore } from '../../src/store/appStore';
import SafetyScreen from '../safety';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => {}), removeItem: jest.fn(async () => {}) },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

const en = labelsFor('en');
const am = labelsFor('am');

afterEach(() => {
  useAppStore.setState({ lang: 'en' });
});

describe('Amharic rendering', () => {
  it('renders the Safety screen in Amharic and leaks no English for its keys', () => {
    useAppStore.setState({ lang: 'am' });
    render(<SafetyScreen />);

    expect(screen.getByText(am.common.safetyTips)).toBeTruthy();
    expect(screen.getByText(am.safety.tip1Title)).toBeTruthy();
    expect(screen.getByText(am.safety.tip4Text)).toBeTruthy();

    expect(screen.queryByText(en.common.safetyTips)).toBeNull();
    expect(screen.queryByText(en.safety.tip1Title)).toBeNull();
    expect(screen.queryByText(en.safety.tip4Text)).toBeNull();
  });

  it('renders the Safety screen in English when lang=en', () => {
    useAppStore.setState({ lang: 'en' });
    render(<SafetyScreen />);

    expect(screen.getByText(en.common.safetyTips)).toBeTruthy();
    expect(screen.getByText(en.safety.tip1Title)).toBeTruthy();
  });
});
