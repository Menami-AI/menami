import { loadConfig, saveConfig } from './config.js';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: any,
  ) {
    super(body?.error || `API error (${status})`);
    this.name = 'ApiError';
  }
}

export interface ApiClient {
  get(path: string, query?: Record<string, string>): Promise<any>;
  post(path: string, body?: any): Promise<any>;
  delete(path: string, body?: any): Promise<any>;
}

export function createClient(): ApiClient {
  function getBaseUrl(): string {
    if (process.env.MENAMI_API_URL) return process.env.MENAMI_API_URL;
    const config = loadConfig();
    return config?.serverUrl ?? 'https://api.getmenami.com';
  }

  async function getToken(): Promise<string> {
    const config = loadConfig();
    if (!config) {
      throw new Error('Not authenticated. Run `menami login` to get started.');
    }

    if (Date.now() >= config.expiresAt) {
      const refreshUrl = `${getBaseUrl()}/api/v2/auth/refresh`;
      const res = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: config.refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Session expired. Run `menami login` to re-authenticate.');
      }

      const data = await res.json();
      config.accessToken = data.access_token;
      config.expiresAt = Date.now() + data.expires_in * 1000;
      saveConfig(config);
    }

    return config.accessToken;
  }

  async function request(method: string, path: string, body?: any, query?: Record<string, string>): Promise<any> {
    const token = await getToken();
    const baseUrl = getBaseUrl();
    const url = new URL(`/api/v2${path}`, baseUrl);

    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v != null) url.searchParams.set(k, v);
      });
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, data);
    }

    return data;
  }

  return {
    get: (path, query) => request('GET', path, undefined, query),
    post: (path, body) => request('POST', path, body),
    delete: (path, body) => request('DELETE', path, body),
  };
}
