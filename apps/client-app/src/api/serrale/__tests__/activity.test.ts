import { HttpError } from '../../../lib/http';
import { fetchMyActivity } from '../activity';
import { http } from '../../../lib/http';

jest.mock('../../../lib/http', () => {
  const actual = jest.requireActual('../../../lib/http');
  return {
    ...actual,
    http: jest.fn(),
    __esModule: true,
  };
});

const mockHttp = http as jest.MockedFunction<typeof http>;

describe('fetchMyActivity', () => {
  beforeEach(() => mockHttp.mockReset());

  it('returns items from the activity API', async () => {
    mockHttp.mockResolvedValue({ items: [], total: 0 } as never);
    await expect(fetchMyActivity()).resolves.toEqual({ items: [], total: 0 });
  });

  it('soft-fails to empty when activity endpoint is not deployed (404)', async () => {
    mockHttp.mockRejectedValue(new HttpError(404, 'not found', 'NOT_FOUND'));
    await expect(fetchMyActivity()).resolves.toEqual({ items: [], total: 0 });
  });

  it('rethrows non-404 errors', async () => {
    mockHttp.mockRejectedValue(new HttpError(401, 'expired', 'SESSION_EXPIRED'));
    await expect(fetchMyActivity()).rejects.toBeInstanceOf(HttpError);
  });
});
