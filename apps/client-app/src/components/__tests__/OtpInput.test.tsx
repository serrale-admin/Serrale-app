import { fireEvent, render, screen } from '@testing-library/react-native';
import OtpInput, { otpBoxMetrics } from '../OtpInput';

describe('otpBoxMetrics', () => {
  it('fits six boxes inside a typical phone card width', () => {
    const { gap, box } = otpBoxMetrics(300);
    expect(box).toBeGreaterThanOrEqual(32);
    expect(box).toBeLessThanOrEqual(44);
    expect(box * 6 + gap * 5).toBeLessThanOrEqual(300);
  });
});

describe('OtpInput', () => {
  const noop = () => {};

  it('renders one box per value entry', () => {
    render(
      <OtpInput value={['', '', '', '', '', '']} onChangeDigit={noop} onKeyPress={noop} setRef={noop} />,
    );
    expect(screen.getAllByLabelText(/Digit \d/)).toHaveLength(6);
  });

  it('forwards changes with the box index', () => {
    const onChangeDigit = jest.fn();
    render(
      <OtpInput value={['', '', '', '', '', '']} onChangeDigit={onChangeDigit} onKeyPress={noop} setRef={noop} />,
    );

    fireEvent.changeText(screen.getByLabelText('Digit 3'), '7');

    expect(onChangeDigit).toHaveBeenCalledWith(2, '7');
  });

  it('forwards paste payloads', () => {
    const onPaste = jest.fn();
    render(
      <OtpInput
        value={['', '', '', '', '', '']}
        onChangeDigit={noop}
        onPaste={onPaste}
        onKeyPress={noop}
        setRef={noop}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Digit 1'), '123456');

    expect(onPaste).toHaveBeenCalledWith(['1', '2', '3', '4', '5', '6']);
  });

  it('forwards key presses with the box index', () => {
    const onKeyPress = jest.fn();
    render(
      <OtpInput value={['1', '', '', '', '', '']} onChangeDigit={noop} onKeyPress={onKeyPress} setRef={noop} />,
    );

    fireEvent(screen.getByLabelText('Digit 1'), 'keyPress', { nativeEvent: { key: 'Backspace' } });

    expect(onKeyPress).toHaveBeenCalledWith(0, 'Backspace');
  });
});
