// ── Menami CLI — Phone Number Authentication ──────────────────────────
// Authenticate by phone number + verification code.
// Your phone number is your identity across SMS, WhatsApp, CLI, and MCP.

import * as readline from 'readline';
import { saveConfig } from './config.js';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptPhone(): Promise<string> {
  const phone = await prompt('\n  Phone number (e.g. +1 555 123 4567): ');
  // Normalize: strip spaces, dashes, parens
  const normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (!normalized.startsWith('+') || normalized.length < 10) {
    throw new Error('Please enter a valid phone number with country code (e.g. +1 5551234567)');
  }
  return normalized;
}

export async function promptChannel(): Promise<'sms' | 'whatsapp'> {
  console.log('\n  How would you like to receive your code?');
  console.log('  1) SMS');
  console.log('  2) WhatsApp');
  const choice = await prompt('  > ');
  if (choice === '2' || choice.toLowerCase() === 'whatsapp') return 'whatsapp';
  return 'sms';
}

export async function promptCode(): Promise<string> {
  const code = await prompt('\n  Enter the 6-digit code: ');
  return code.trim();
}

export async function sendCode(
  serverUrl: string,
  phone: string,
  channel: string,
): Promise<void> {
  const res = await fetch(`${serverUrl}/api/v2/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, channel }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to send code (${res.status})`);
  }

  // In dev mode, the API returns the code
  const data = await res.json();
  if (data.code) {
    console.log(`\n  [DEV] Your code is: ${data.code}`);
  }
}

export async function authenticate(
  serverUrl: string,
  phone: string,
  code: string,
  channel: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch(`${serverUrl}/api/v2/auth/phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, channel }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Authentication failed (${res.status})`);
  }

  return res.json();
}

export async function loginFlow(serverUrl: string): Promise<void> {
  console.log('\n  Welcome to Menami — your personal food agent.\n');
  console.log('  Menami gives you personalized restaurant recommendations,');
  console.log('  books tables, and hunts cancellations at impossible-to-get');
  console.log('  restaurants.\n');
  console.log('  Your phone number is your Menami identity — it works across');
  console.log('  SMS, WhatsApp, CLI, and any AI assistant.');

  const phone = await promptPhone();
  const channel = await promptChannel();

  console.log(`\n  Sending code via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}...`);
  await sendCode(serverUrl, phone, channel);

  console.log('  Code sent!');
  const code = await promptCode();

  const tokens = await authenticate(serverUrl, phone, code, channel);

  saveConfig({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    serverUrl,
    phone,
    channel,
  });

  console.log('\n  ✓ Welcome to Menami! You\'re all set.\n');
  console.log('  Try: menami recommend "best tacos in SF"\n');
}
