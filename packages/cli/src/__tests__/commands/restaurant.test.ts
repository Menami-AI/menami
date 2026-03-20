import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ get: mockGet }),
}));

import { restaurantAction } from '../../commands/restaurant.js';

describe('restaurant command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls API with restaurant ID and displays name', async () => {
    mockGet.mockResolvedValue({ name: 'Nopa', city: 'San Francisco', categories: ['American'] });
    const output: string[] = [];
    await restaurantAction('rst_123', false, (msg: string) => output.push(msg));
    expect(mockGet).toHaveBeenCalledWith('/restaurants/rst_123');
    expect(output.some(l => l.includes('Nopa'))).toBe(true);
  });

  it('outputs JSON when flag is set', async () => {
    mockGet.mockResolvedValue({ name: 'Nopa' });
    const output: string[] = [];
    await restaurantAction('rst_123', true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });

  it('handles not found error', async () => {
    mockGet.mockRejectedValue({ status: 404, body: { error: 'Restaurant not found' } });
    const output: string[] = [];
    await restaurantAction('bad_id', false, () => {}, (msg: string) => output.push(msg));
    expect(output.some(l => l.includes('not found') || l.includes('Error'))).toBe(true);
  });
});
