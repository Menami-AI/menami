import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as crypto from 'crypto';

const mockSaveConfig = vi.fn();

vi.mock('../config.js', () => ({
  saveConfig: (c: any) => mockSaveConfig(c),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { generatePkce, buildAuthUrl, exchangeCode } from '../auth.js';

describe('auth', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('generatePkce', () => {
    it('returns verifier and challenge of correct format', () => {
      const { verifier, challenge } = generatePkce();
      expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
      const expected = crypto.createHash('sha256').update(verifier).digest('base64url');
      expect(challenge).toBe(expected);
    });
  });

  describe('buildAuthUrl', () => {
    it('builds correct authorization URL with all params', () => {
      const url = buildAuthUrl('https://api.getmenami.com', 'challenge123', 'state456');
      expect(url).toContain('https://api.getmenami.com/oauth/authorize');
      expect(url).toContain('code_challenge=challenge123');
      expect(url).toContain('state=state456');
      expect(url).toContain('code_challenge_method=S256');
      expect(url).toContain('response_type=code');
    });
  });

  describe('exchangeCode', () => {
    it('exchanges code for tokens and saves config', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'men_access',
          refresh_token: 'men_refresh',
          expires_in: 3600,
        }),
      });

      await exchangeCode('https://api.getmenami.com', 'auth_code', 'verifier123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.getmenami.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('auth_code'),
        }),
      );
      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'men_access',
          refreshToken: 'men_refresh',
          serverUrl: 'https://api.getmenami.com',
        }),
      );
    });

    it('throws on failed token exchange', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Invalid code',
      });

      await expect(exchangeCode('https://api.getmenami.com', 'bad', 'v'))
        .rejects.toThrow('Token exchange failed');
    });
  });
});
