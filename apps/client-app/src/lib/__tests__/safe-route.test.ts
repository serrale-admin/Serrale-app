import { navigateAuthBack, safeNextRoute } from '../safe-route';

jest.mock('expo-router', () => ({
  router: {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { canGoBack: jest.Mock; back: jest.Mock; replace: jest.Mock };
};

describe('navigateAuthBack', () => {
  beforeEach(() => {
    router.canGoBack.mockReset();
    router.back.mockReset();
    router.replace.mockReset();
  });

  it('pops when navigation history exists', () => {
    router.canGoBack.mockReturnValue(true);
    navigateAuthBack('/(tabs)/profile');
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('replaces with a safe fallback when history is empty', () => {
    router.canGoBack.mockReturnValue(false);
    navigateAuthBack('/(tabs)/request');
    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/request');
  });

  it('rejects unsafe fallback URLs', () => {
    router.canGoBack.mockReturnValue(false);
    navigateAuthBack('https://evil.test');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/profile');
  });
});

describe('safeNextRoute', () => {
  it('accepts internal tab routes', () => {
    expect(safeNextRoute('/(tabs)/profile')).toBe('/(tabs)/profile');
  });
});
