import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ContactSheets from '../ContactSheets';
import { useContactStore } from '../../store/contactStore';
import * as api from '../../api';
import type { Provider } from '../../types';

jest.mock('../../api', () => ({
  __esModule: true,
  logProviderContact: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] || null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
        return null;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
        return null;
      }),
      _clear: () => {
        store = {};
      },
    },
  };
});

const mockLog = api.logProviderContact as jest.MockedFunction<typeof api.logProviderContact>;

const PROVIDER: Provider = {
  id: 'prov-1',
  name: 'Tekle Plumbing',
  service: 'Plumbers',
  categoryId: 'plumbers',
  rating: 0,
  reviewCount: 0,
  area: 'Bole',
  verified: false,
  adminReviewed: true,
  availableToday: false,
  hasPastWork: false,
  exp: 8,
  price: 'Standard',
  description: '',
  phone: '+251911234567',
  whatsapp: '+251911234567',
};

describe('ContactSheets — contact is never blocked by logging (M-2/M-6)', () => {
  beforeEach(() => {
    mockLog.mockReset();
    useContactStore.setState({ mode: null, provider: null });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
  });

  afterEach(() => {
    (Linking.openURL as jest.Mock).mockRestore();
    // Clear the toast auto-hide timer so the jest worker can exit cleanly.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../store/appStore').useAppStore.getState().hideToast();
  });

  it('opens tel: immediately even while the contact-event log never resolves', () => {
    // A logging call that HANGS forever — the call must still go out instantly.
    mockLog.mockImplementation(() => new Promise(() => {}));
    useContactStore.getState().openCall(PROVIDER);
    render(<ContactSheets />);

    fireEvent.press(screen.getByText('Call now'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+251911234567');
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'prov-1', eventType: 'phone_click', sourceFlow: 'contact_sheet' }),
    );
  });

  it('opens WhatsApp and logs whatsapp_click fire-and-forget', () => {
    mockLog.mockImplementation(() => new Promise(() => {}));
    useContactStore.getState().openWhatsapp(PROVIDER);
    render(<ContactSheets />);

    fireEvent.press(screen.getByText('Open WhatsApp'));

    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('whatsapp://send?phone=251911234567'));
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'prov-1', eventType: 'whatsapp_click' }),
    );
  });

  it('still opens the call when logging resolves { recorded: false } (failure path)', () => {
    mockLog.mockResolvedValue({ recorded: false });
    useContactStore.getState().openCall(PROVIDER);
    render(<ContactSheets />);

    fireEvent.press(screen.getByText('Call now'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+251911234567');
  });

  it('sanitizes a messy backend phone into a +/digits-only tel: intent (T9)', () => {
    // A backend value carrying spaces, parens, and DTMF/pause control chars must
    // never reach the dialer intent raw — only a leading + and digits survive.
    mockLog.mockResolvedValue({ recorded: true });
    useContactStore.getState().openCall({ ...PROVIDER, phone: '+251 (911) 234-567#,;' });
    render(<ContactSheets />);

    fireEvent.press(screen.getByText('Call now'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+251911234567');
  });
});
