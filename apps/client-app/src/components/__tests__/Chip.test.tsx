import { fireEvent, render, screen } from '@testing-library/react-native';
import Chip from '../Chip';
import { colors } from '../../lib/theme';

describe('Chip', () => {
  it('renders its label', () => {
    render(<Chip label="Plumbing" onPress={() => {}} />);
    expect(screen.getByText('Plumbing')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Chip label="Cleaning" onPress={onPress} />);

    fireEvent.press(screen.getByText('Cleaning'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the active green fill and white label when active', () => {
    render(<Chip label="All" active onPress={() => {}} />);

    const label = screen.getByText('All');
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#fff' })])
    );
  });

  it('uses the surface background and default text color when inactive', () => {
    render(<Chip label="All" active={false} onPress={() => {}} />);

    const label = screen.getByText('All');
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.text })])
    );
  });
});
