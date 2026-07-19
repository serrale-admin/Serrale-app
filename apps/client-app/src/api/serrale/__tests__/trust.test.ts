import { fetchNotifications, markNotificationRead } from '../trust';
import { http } from '../../../lib/http';

jest.mock('../../../lib/http', () => ({
  http: jest.fn(),
}));

describe('trust API client', () => {
  beforeEach(() => {
    (http as jest.Mock).mockReset();
  });

  it('fetches notifications with unread filter', async () => {
    (http as jest.Mock).mockResolvedValue({ items: [], unread_count: 0 });
    await fetchNotifications({ unreadOnly: true, limit: 10 });
    expect(http).toHaveBeenCalledWith(
      expect.stringContaining('/notifications'),
      expect.objectContaining({
        query: expect.objectContaining({ unread_only: 'true', limit: 10 }),
      }),
    );
  });

  it('marks a notification read', async () => {
    (http as jest.Mock).mockResolvedValue({});
    await markNotificationRead('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(http).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/read'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
