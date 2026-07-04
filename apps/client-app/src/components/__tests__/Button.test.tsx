import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button label="Send code" onPress={() => {}} />);
    expect(screen.getByText('Send code')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Button label="Submit" onPress={onPress} />);

    fireEvent.press(screen.getByText('Submit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Submit" disabled onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress while loading and marks itself busy', () => {
    const onPress = jest.fn();
    render(<Button label="Submitting" loading onPress={onPress} />);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    );
  });

  it('hides the label text while loading (spinner only)', () => {
    render(<Button label="Submitting" loading onPress={() => {}} />);
    expect(screen.queryByText('Submitting')).toBeNull();
  });

  it('exposes an accessibility label defaulting to the visible label', () => {
    render(<Button label="Verify" onPress={() => {}} />);
    expect(screen.getByLabelText('Verify')).toBeTruthy();
  });
});
