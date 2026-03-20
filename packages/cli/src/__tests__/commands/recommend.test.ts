import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ post: mockPost }),
}));

import { recommendSingleShot } from '../../commands/recommend.js';

describe('recommend command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends message and displays recommendations', async () => {
    mockPost.mockResolvedValue({
      response: 'Here are my picks',
      recommendations: [
        { name: 'Nopa', match_score: 94, match_reasons: ['farm-to-table'] },
        { name: 'Lazy Bear', match_score: 91, match_reasons: ['tasting menu'] },
      ],
    });
    const output: string[] = [];
    await recommendSingleShot('date night italian', {}, false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/recommendations', expect.objectContaining({
      message: 'date night italian',
    }));
    expect(output.some(l => l.includes('Nopa'))).toBe(true);
  });

  it('passes constraints from flags', async () => {
    mockPost.mockResolvedValue({ response: 'ok', recommendations: [] });
    const output: string[] = [];
    await recommendSingleShot('sushi', { cuisine: 'japanese', occasion: 'date_night' }, false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/recommendations', expect.objectContaining({
      message: 'sushi',
      constraints: expect.objectContaining({ cuisine: 'japanese', occasion: 'date_night' }),
    }));
  });

  it('outputs JSON when flag is set', async () => {
    mockPost.mockResolvedValue({ response: 'ok', recommendations: [] });
    const output: string[] = [];
    await recommendSingleShot('anything', {}, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });

  it('shows agent response when no recommendations', async () => {
    mockPost.mockResolvedValue({ response: 'No matches found', recommendations: [] });
    const output: string[] = [];
    await recommendSingleShot('xyz', {}, false, (msg: string) => output.push(msg));
    expect(output.some(l => l.includes('No matches'))).toBe(true);
  });
});
