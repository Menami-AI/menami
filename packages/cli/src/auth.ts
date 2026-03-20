import * as crypto from 'crypto';
import * as http from 'http';
import * as url from 'url';
import { saveConfig } from './config.js';

const CALLBACK_PORT = 19284;
const CALLBACK_PATH = '/callback';

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function buildAuthUrl(serverUrl: string, codeChallenge: string, state: string): string {
  const authUrl = new URL(`${serverUrl}/oauth/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  return authUrl.toString();
}

export async function exchangeCode(serverUrl: string, code: string, codeVerifier: string): Promise<void> {
  const res = await fetch(`${serverUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errorText}`);
  }

  const tokens = await res.json();

  saveConfig({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    serverUrl,
  });
}

export function waitForCallback(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url || '', true);

      if (parsed.pathname !== CALLBACK_PATH) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const { code, state, error } = parsed.query;

      if (error) {
        res.writeHead(400);
        res.end(`Authorization error: ${error}`);
        server.close();
        reject(new Error(`Authorization error: ${error}`));
        return;
      }

      if (state !== expectedState) {
        res.writeHead(400);
        res.end('State mismatch');
        server.close();
        reject(new Error('State mismatch'));
        return;
      }

      if (!code || typeof code !== 'string') {
        res.writeHead(400);
        res.end('Missing authorization code');
        server.close();
        reject(new Error('Missing authorization code'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0"><div style="text-align:center"><h1 style="color:#D95A28">Connected to Menami</h1><p>You can close this window and return to your terminal.</p></div></body></html>');
      server.close();
      resolve(code);
    });

    server.listen(CALLBACK_PORT);

    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out (5 minutes)'));
    }, 5 * 60 * 1000);
  });
}
