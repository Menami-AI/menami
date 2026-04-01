import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockLoadConfig = vi.fn();
const mockSaveConfig = vi.fn();

vi.mock('../config.js', () => ({
  loadConfig: () => mockLoadConfig(),
  saveConfig: (c: any) => mockSaveConfig(c),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { createClient, ApiError } from '../client.js';

describe('client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MENAMI_API_URL;
  });

  it('throws when not authenticated', async () => {
    mockLoadConfig.mockReturnValue(null);
    const client = createClient();
    await expect(client.get('/profile')).rejects.toThrow('Not authenticated');
  });

  it('sends GET with Bearer token', async () => {
    mockLoadConfig.mockReturnValue({
      accessToken: 'men_abc',
      refreshToken: 'men_ref',
      expiresAt: Date.now() + 60000,
      serverUrl: 'https://api.getmenami.com',
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ profile: {} }),
    });

    const client = createClient();
    const result = await client.get('/profile');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.getmenami.com/api/v2/profile',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer men_abc' }),
      }),
    );
    expect(result).toEqual({ profile: {} });
  });

  it('sends POST with JSON body', async () => {
    mockLoadConfig.mockReturnValue({
      accessToken: 'men_abc',
      refreshToken: 'men_ref',
      expiresAt: Date.now() + 60000,
      serverUrl: 'https://api.getmenami.com',
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const client = createClient();
    await client.post('/feedback', { restaurantId: 'r1', overallRating: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.getmenami.com/api/v2/feedback',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ restaurantId: 'r1', overallRating: 5 }),
      }),
    );
  });

  it('throws ApiError on non-ok response', async () => {
    mockLoadConfig.mockReturnValue({
      accessToken: 'men_abc',
      refreshToken: 'men_ref',
      expiresAt: Date.now() + 60000,
      serverUrl: 'https://api.getmenami.com',
    });
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    });

    const client = createClient();
    await expect(client.get('/restaurants/xyz')).rejects.toThrow(ApiError);
  });

  it('auto-refreshes expired token', async () => {
    mockLoadConfig.mockReturnValue({
      accessToken: 'men_expired',
      refreshToken: 'men_ref',
      expiresAt: Date.now() - 1000,
      serverUrl: 'https://api.getmenami.com',
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'men_new', expires_in: 3600 }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ profile: {} }),
    });

    const client = createClient();
    await client.get('/profile');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockSaveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'men_new' }),
    );
  });

  it('uses MENAMI_API_URL env var when set', async () => {
    process.env.MENAMI_API_URL = 'http://localhost:3000';
    mockLoadConfig.mockReturnValue({
      accessToken: 'men_abc',
      refreshToken: 'men_ref',
      expiresAt: Date.now() + 60000,
      serverUrl: 'https://api.getmenami.com',
    });
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const client = createClient();
    await client.get('/profile');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v2/profile',
      expect.any(Object),
    );
  });
});
