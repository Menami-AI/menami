import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ post: mockPost }),
}));

import { feedbackAction } from '../../commands/feedback.js';

describe('feedback command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits feedback with rating and text', async () => {
    mockPost.mockResolvedValue({ success: true });
    const output: string[] = [];
    await feedbackAction('rst_123', { rating: '4', text: 'Great pasta' }, false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/feedback', {
      restaurantId: 'rst_123',
      overallRating: 4,
      feedbackText: 'Great pasta',
    });
    expect(output.some(l => l.includes('submitted') || l.includes('success'))).toBe(true);
  });

  it('submits feedback with rating only', async () => {
    mockPost.mockResolvedValue({ success: true });
    const output: string[] = [];
    await feedbackAction('rst_123', { rating: '5' }, false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/feedback', {
      restaurantId: 'rst_123',
      overallRating: 5,
    });
  });

  it('outputs JSON when flag is set', async () => {
    mockPost.mockResolvedValue({ success: true });
    const output: string[] = [];
    await feedbackAction('rst_123', { rating: '4' }, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });
});
