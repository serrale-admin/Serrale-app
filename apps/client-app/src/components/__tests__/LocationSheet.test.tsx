import { render } from '@testing-library/react-native';
import React from 'react';
import LocationSheet from '../LocationSheet';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

describe('LocationSheet', () => {
  it('renders without module-level font reference errors', () => {
    expect(() =>
      render(
        <LocationSheet visible onClose={() => {}} value="Bole" onSelect={() => {}} />,
      ),
    ).not.toThrow();
  });
});
