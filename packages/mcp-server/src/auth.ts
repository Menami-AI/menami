// ── Menami MCP Server — Phone Number Authentication ───────────────────
// Authenticate by phone number + verification code.
// Saves tokens to ~/.menami/config.json for Claude Desktop and other MCP clients.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline';

const CONFIG_DIR = path.join(os.homedir(), '.menami');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

interface MenamiConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  serverUrl: string;
  phone: string;
  channel: string;
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

// ── Prompts ───────────────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Phone connect flow ────────────────────────────────────────────────

export async function connect(mcpServerUrl: string): Promise<void> {
  const serverUrl = mcpServerUrl.replace(/\/$/, '');

  console.log('\n  Welcome to Menami — your personal food agent.\n');
  console.log('  Your phone number is your Menami identity — it works across');
  console.log('  SMS, WhatsApp, CLI, and any AI assistant.\n');

  // Phone number
  const phoneRaw = await prompt('  Phone number (e.g. +1 555 123 4567): ');
  const phone = phoneRaw.replace(/[\s\-\(\)]/g, '');
  if (!phone.startsWith('+') || phone.length < 10) {
    throw new Error('Please enter a valid phone number with country code');
  }

  // Channel choice
  console.log('\n  How would you like to receive your code?');
  console.log('  1) SMS');
  console.log('  2) WhatsApp');
  const channelChoice = await prompt('  > ');
  const channel = (channelChoice === '2' || channelChoice.toLowerCase() === 'whatsapp') ? 'whatsapp' : 'sms';

  // Send code
  console.log(`\n  Sending code via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}...`);

  const sendRes = await fetch(`${serverUrl}/api/v2/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, channel }),
  });

  if (!sendRes.ok) {
    const body = await sendRes.json().catch(() => null);
    throw new Error(body?.error || `Failed to send code (${sendRes.status})`);
  }

  const sendData = await sendRes.json();
  if (sendData.code) {
    console.log(`\n  [DEV] Your code is: ${sendData.code}`);
  }

  console.log('  Code sent!');
  const code = await prompt('\n  Enter the 6-digit code: ');

  // Authenticate
  const authRes = await fetch(`${serverUrl}/api/v2/auth/phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, channel }),
  });

  if (!authRes.ok) {
    const body = await authRes.json().catch(() => null);
    throw new Error(body?.error || `Authentication failed (${authRes.status})`);
  }

  const tokens = await authRes.json();

  // Save config
  saveConfig({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    serverUrl,
    phone,
    channel,
  });

  console.log('\n  ✓ Connected! Your AI assistant can now use Menami tools.\n');
  console.log(`  Config saved to ${CONFIG_PATH}\n`);
}
