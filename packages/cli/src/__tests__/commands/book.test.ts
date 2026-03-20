import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ post: mockPost }),
}));

import { bookAction } from '../../commands/book.js';

describe('book command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a booking with required fields', async () => {
    mockPost.mockResolvedValue({ bookingId: 'bk_123', status: 'confirmed' });
    const output: string[] = [];
    await bookAction('rst_123', { date: '2026-03-20', time: '19:00', party: '2', name: 'Christian', email: 'c@m.com' }, false, (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/bookings', expect.objectContaining({
      restaurantId: 'rst_123',
      partySize: 2,
    }));
    expect(output.some(l => l.includes('confirmed') || l.includes('Booking'))).toBe(true);
  });

  it('outputs JSON when flag is set', async () => {
    mockPost.mockResolvedValue({ bookingId: 'bk_123', status: 'confirmed' });
    const output: string[] = [];
    await bookAction('rst_123', { date: '2026-03-20', time: '19:00', party: '2', name: 'C', email: 'c@m.com' }, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });
});
