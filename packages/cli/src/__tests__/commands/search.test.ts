import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ get: mockGet }),
}));

import { searchAction } from '../../commands/search.js';

describe('search command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls API with city and options', async () => {
    mockGet.mockResolvedValue({ results: [{ name: 'Nopa', cuisine: 'American', price_tier: 3 }] });
    const output: string[] = [];
    await searchAction({ city: 'sf', cuisine: 'american' }, false, (msg: string) => output.push(msg));
    expect(mockGet).toHaveBeenCalledWith('/restaurants/search', expect.objectContaining({ city: 'sf', cuisine: 'american' }));
  });

  it('outputs JSON when flag is set', async () => {
    mockGet.mockResolvedValue({ results: [{ name: 'Nopa' }] });
    const output: string[] = [];
    await searchAction({ city: 'sf' }, true, (msg: string) => output.push(msg));
    expect(() => JSON.parse(output[0])).not.toThrow();
  });

  it('prints friendly message on empty results', async () => {
    mockGet.mockResolvedValue({ results: [] });
    const output: string[] = [];
    await searchAction({ city: 'sf' }, false, (msg: string) => output.push(msg));
    expect(output.some(l => l.includes('No'))).toBe(true);
  });
});
