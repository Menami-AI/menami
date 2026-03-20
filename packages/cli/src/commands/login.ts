import * as crypto from 'crypto';
import { generatePkce, buildAuthUrl, waitForCallback, exchangeCode } from '../auth.js';

export async function loginAction(
  opts: { server: string },
  log: (msg: string) => void = console.log,
  errLog: (msg: string) => void = console.error,
): Promise<void> {
  const serverUrl = opts.server.replace(/\/$/, '');
  const { verifier, challenge } = generatePkce();
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = buildAuthUrl(serverUrl, challenge, state);

  log('\nOpening browser for Menami authorization...');
  log(`If the browser doesn't open, visit:\n${authUrl}\n`);

  try {
    const open = (await import('open')).default;
    await open(authUrl);
  } catch {
    // Browser open failed — user can visit URL manually
  }

  try {
    const code = await waitForCallback(state);
    await exchangeCode(serverUrl, code, verifier);
    log('\nConnected to Menami successfully!');
  } catch (err: unknown) {
    errLog(`\nLogin failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}
