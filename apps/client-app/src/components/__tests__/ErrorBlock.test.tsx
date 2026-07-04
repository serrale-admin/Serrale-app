import { fireEvent, render, screen } from '@testing-library/react-native';
import ErrorBlock from '../ErrorBlock';

describe('ErrorBlock', () => {
  it('renders the provided title and text', () => {
    render(<ErrorBlock title="Couldn't load providers" text="Check your connection." />);
    expect(screen.getByText("Couldn't load providers")).toBeTruthy();
    expect(screen.getByText('Check your connection.')).toBeTruthy();
  });

  it('fires the retry callback when the retry button is pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorBlock onRetry={onRetry} />);

    fireEvent.press(screen.getByText('Try again'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders no retry button when onRetry is omitted', () => {
    render(<ErrorBlock />);
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('uses a custom retry label when provided', () => {
    render(<ErrorBlock onRetry={() => {}} retryLabel="Reload" />);
    expect(screen.getByText('Reload')).toBeTruthy();
  });
});
