import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLoginFlow = vi.fn();

vi.mock('../../auth.js', () => ({
  loginFlow: (...args: any[]) => mockLoginFlow(...args),
}));

import { loginAction } from '../../commands/login.js';

describe('login command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls loginFlow with the server URL', async () => {
    mockLoginFlow.mockResolvedValue(undefined);

    await loginAction({ server: 'https://api.getmenami.com' });

    expect(mockLoginFlow).toHaveBeenCalledWith('https://api.getmenami.com');
  });

  it('strips trailing slash from server URL', async () => {
    mockLoginFlow.mockResolvedValue(undefined);

    await loginAction({ server: 'https://api.getmenami.com/' });

    expect(mockLoginFlow).toHaveBeenCalledWith('https://api.getmenami.com');
  });
});
