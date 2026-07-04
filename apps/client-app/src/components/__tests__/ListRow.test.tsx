import { fireEvent, render, screen } from '@testing-library/react-native';
import ListRow from '../ListRow';

describe('ListRow', () => {
  it('renders its label and optional sub / value lines', () => {
    render(<ListRow label="Language" sub="Choose your language" value="English" onPress={() => {}} />);
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByText('Choose your language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ListRow label="Settings" onPress={onPress} />);

    fireEvent.press(screen.getByText('Settings'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the label as its accessibility label', () => {
    render(<ListRow label="Help & Support" onPress={() => {}} />);
    expect(screen.getByLabelText('Help & Support')).toBeTruthy();
  });
});
