import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGeneratePkce = vi.fn();
const mockBuildAuthUrl = vi.fn();
const mockWaitForCallback = vi.fn();
const mockExchangeCode = vi.fn();

vi.mock('../../auth.js', () => ({
  generatePkce: () => mockGeneratePkce(),
  buildAuthUrl: (...args: any[]) => mockBuildAuthUrl(...args),
  waitForCallback: (...args: any[]) => mockWaitForCallback(...args),
  exchangeCode: (...args: any[]) => mockExchangeCode(...args),
}));

vi.mock('open', () => ({ default: vi.fn() }));

import { loginAction } from '../../commands/login.js';

describe('login command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('runs full login flow', async () => {
    mockGeneratePkce.mockReturnValue({ verifier: 'v', challenge: 'c' });
    mockBuildAuthUrl.mockReturnValue('https://api.getmenami.com/oauth/authorize?...');
    mockWaitForCallback.mockResolvedValue('auth_code_123');
    mockExchangeCode.mockResolvedValue(undefined);

    const logs: string[] = [];
    await loginAction({ server: 'https://api.getmenami.com' }, (msg: string) => logs.push(msg));

    expect(mockExchangeCode).toHaveBeenCalledWith('https://api.getmenami.com', 'auth_code_123', 'v');
    expect(logs.some(l => l.includes('Connected'))).toBe(true);
  });

  it('handles authorization errors gracefully', async () => {
    mockGeneratePkce.mockReturnValue({ verifier: 'v', challenge: 'c' });
    mockBuildAuthUrl.mockReturnValue('https://...');
    mockWaitForCallback.mockRejectedValue(new Error('Authorization timed out'));

    const logs: string[] = [];
    const errLogs: string[] = [];

    await loginAction(
      { server: 'https://api.getmenami.com' },
      (msg: string) => logs.push(msg),
      (msg: string) => errLogs.push(msg),
    );

    expect(errLogs.some(l => l.includes('timed out'))).toBe(true);
  });
});
