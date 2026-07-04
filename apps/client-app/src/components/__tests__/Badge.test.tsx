import { render, screen } from '@testing-library/react-native';
import Badge from '../Badge';
import { colors } from '../../lib/theme';

describe('Badge', () => {
  it('renders a numeric count', () => {
    render(<Badge label={3} tone="count" />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders a trust label with the success foreground color', () => {
    render(<Badge label="Verified" tone="trust" icon="ph-seal-check" />);

    const label = screen.getByText('Verified');
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.success })]),
    );
  });

  it('renders a gold label with the AA-contrast gold foreground color', () => {
    render(<Badge label="Premium" tone="gold" />);

    const label = screen.getByText('Premium');
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.goldSoftText })]),
    );
  });
});
