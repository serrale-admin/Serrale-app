import { fireEvent, render, screen } from '@testing-library/react-native';
import ErrorBlock from '../ErrorBlock';
import { HttpError } from '../../lib/http';
import { labelsFor } from '../../lib/labels';

// ErrorBlock now consumes useLabels() (→ app store → AsyncStorage). Mock the
// native module so the component mounts under Jest (babel hoists this above the
// imports above).
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

const en = labelsFor('en');

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

  it('maps a caught error to localized, user-safe copy (no internals shown)', () => {
    const leaky = new HttpError(
      500,
      'ERROR at supabase.rpc SELECT * FROM users WHERE phone=+251912345678',
      'PGRST204',
    );
    render(<ErrorBlock error={leaky} onRetry={() => {}} />);

    // Mapped server copy, not the raw message.
    expect(screen.getByText(en.errors.serverTitle)).toBeTruthy();
    expect(screen.getByText(en.errors.serverMessage)).toBeTruthy();
    expect(screen.queryByText(/supabase/)).toBeNull();
    expect(screen.queryByText(/SELECT/)).toBeNull();
    expect(screen.queryByText(/\+251912345678/)).toBeNull();
  });

  it('uses an explicit action for session expiry and never wires retry', () => {
    const onAction = jest.fn();
    const onRetry = jest.fn();
    render(
      <ErrorBlock
        error={new HttpError(401, 'raw backend session message', 'SESSION_EXPIRED')}
        onAction={onAction}
        onRetry={onRetry}
      />,
    );

    fireEvent.press(screen.getByText(en.errors.signIn));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.queryByText(en.errors.retry)).toBeNull();
  });
});
