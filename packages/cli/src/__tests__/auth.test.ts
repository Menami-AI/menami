import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('../config.js', () => ({
  saveConfig: vi.fn(),
  loadConfig: vi.fn(),
}));

import { sendCode, authenticate } from '../auth.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendCode', () => {
  it('calls the send-code endpoint with phone and channel', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, channel: 'sms' }),
    });

    await sendCode('https://api.getmenami.com', '+15551234567', 'sms');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.getmenami.com/api/v2/auth/send-code',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '+15551234567', channel: 'sms' }),
      }),
    );
  });

  it('throws on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Rate limited' }),
    });

    await expect(sendCode('https://api.getmenami.com', '+15551234567', 'sms'))
      .rejects.toThrow('Rate limited');
  });
});

describe('authenticate', () => {
  it('calls the phone auth endpoint and returns tokens', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'tok_123',
        refreshToken: 'ref_456',
        expiresIn: 604800,
      }),
    });

    const result = await authenticate('https://api.getmenami.com', '+15551234567', '123456', 'sms');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.getmenami.com/api/v2/auth/phone',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '+15551234567', code: '123456', channel: 'sms' }),
      }),
    );
    expect(result.accessToken).toBe('tok_123');
  });

  it('throws on invalid code', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid or expired verification code' }),
    });

    await expect(authenticate('https://api.getmenami.com', '+15551234567', '000000', 'sms'))
      .rejects.toThrow('Invalid or expired verification code');
  });
});
