// ── Menami MCP Server — OAuth Authentication ──────────────────────────
// Opens browser-based OAuth flow, receives callback, and saves tokens
// to ~/.menami/config.json for Claude Desktop and other MCP clients.

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as url from 'url';

const CONFIG_DIR = path.join(os.homedir(), '.menami');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const CALLBACK_PORT = 19284;
const CALLBACK_PATH = '/callback';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface MenamiConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  serverUrl: string;
}

// ── PKCE helpers ──────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// ── Config persistence ────────────────────────────────────────────────

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function saveConfig(config: MenamiConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

export function loadConfig(): MenamiConfig | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as MenamiConfig;
  } catch {
    return null;
  }
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
}

// ── OAuth connect flow ────────────────────────────────────────────────

/**
 * Runs the full OAuth PKCE flow:
 * 1. Generate PKCE code verifier + challenge
 * 2. Open browser to authorization URL
 * 3. Start local HTTP server to receive callback
 * 4. Exchange authorization code for tokens
 * 5. Save tokens to ~/.menami/config.json
 */
export async function connect(mcpServerUrl: string): Promise<void> {
  const serverUrl = mcpServerUrl.replace(/\/$/, '');
  const redirectUri = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;

  // Step 1: Generate PKCE pair
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  // Step 2: Build authorization URL
  const authUrl = new URL(`${serverUrl}/oauth/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  console.log('\nOpening browser for Menami authorization...\n');
  console.log(`If the browser doesn't open, visit:\n${authUrl.toString()}\n`);

  // Open browser (cross-platform)
  const openCommand =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';

  const { exec } = await import('child_process');
  exec(`${openCommand} "${authUrl.toString()}"`);

  // Step 3: Start local server to receive the callback
  const code = await waitForCallback(state);

  // Step 4: Exchange code for tokens
  const tokenUrl = `${serverUrl}/oauth/token`;
  const tokenBody = JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: tokenBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
  }

  const tokens = (await response.json()) as TokenResponse;

  // Step 5: Save tokens
  const config: MenamiConfig = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    serverUrl,
  };

  saveConfig(config);

  console.log('Connected to Menami successfully!');
  console.log(`Config saved to ${CONFIG_PATH}\n`);
  console.log('Add this to your Claude Desktop config (claude_desktop_config.json):\n');
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          menami: {
            command: 'npx',
            args: ['@menami/mcp-server'],
          },
        },
      },
      null,
      2,
    ),
  );
}

// ── Callback server ───────────────────────────────────────────────────

function waitForCallback(expectedState: string): Promise<string> {
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
        res.end('State mismatch — possible CSRF attack');
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
      res.end(`
        <html>
          <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h1 style="color: #D95A28;">Connected to Menami</h1>
              <p>You can close this window and return to your terminal.</p>
            </div>
          </body>
        </html>
      `);

      server.close();
      resolve(code);
    });

    server.listen(CALLBACK_PORT, () => {
      // Server ready, waiting for browser callback
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out (5 minutes)'));
    }, 5 * 60 * 1000);
  });
}
