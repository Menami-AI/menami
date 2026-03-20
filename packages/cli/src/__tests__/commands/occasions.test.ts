import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ get: mockGet, post: mockPost }),
}));

import { occasionsAction } from '../../commands/occasions.js';

describe('occasions command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists occasions', async () => {
    mockGet.mockResolvedValue({ occasions: ['date_night', 'work_lunch'] });
    const output: string[] = [];
    await occasionsAction('list', undefined, false, (msg: string) => output.push(msg));
    expect(mockGet).toHaveBeenCalledWith('/occasions');
    expect(output.some(l => l.includes('date_night'))).toBe(true);
  });

  it('adds an occasion', async () => {
    mockPost.mockResolvedValue({ occasions: ['date_night', 'birthday'] });
    const output: string[] = [];
    await occasionsAction('add', 'birthday', false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/occasions', { occasion: 'birthday' });
  });

  it('outputs JSON when flag is set', async () => {
    mockGet.mockResolvedValue({ occasions: ['date_night'] });
    const output: string[] = [];
    await occasionsAction('list', undefined, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });
});
