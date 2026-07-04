import { fireEvent, render, screen } from '@testing-library/react-native';
import OtpInput from '../OtpInput';

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

  it('forwards key presses with the box index', () => {
    const onKeyPress = jest.fn();
    render(
      <OtpInput value={['1', '', '', '', '', '']} onChangeDigit={noop} onKeyPress={onKeyPress} setRef={noop} />,
    );

    fireEvent(screen.getByLabelText('Digit 1'), 'keyPress', { nativeEvent: { key: 'Backspace' } });

    expect(onKeyPress).toHaveBeenCalledWith(0, 'Backspace');
  });
});
