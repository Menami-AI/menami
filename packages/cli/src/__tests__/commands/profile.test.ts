import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ get: mockGet }),
}));

import { profileAction } from '../../commands/profile.js';

describe('profile command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches summary format by default', async () => {
    mockGet.mockResolvedValue({ summary: 'Loves Japanese and Italian' });
    const output: string[] = [];
    await profileAction({ format: 'summary' }, false, (msg: string) => output.push(msg));
    expect(mockGet).toHaveBeenCalledWith('/profile', { format: 'summary' });
    expect(output.some(l => l.includes('Japanese'))).toBe(true);
  });

  it('fetches full format when requested', async () => {
    mockGet.mockResolvedValue({ profile: { cuisines: { japanese: { affinity: 'loved' } } } });
    const output: string[] = [];
    await profileAction({ format: 'full' }, false, (msg: string) => output.push(msg));
    expect(mockGet).toHaveBeenCalledWith('/profile', { format: 'full' });
  });

  it('outputs JSON when flag is set', async () => {
    mockGet.mockResolvedValue({ summary: 'test' });
    const output: string[] = [];
    await profileAction({ format: 'summary' }, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });
});
