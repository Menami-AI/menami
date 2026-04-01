import { loginFlow } from '../auth.js';

export async function loginAction(
  opts: { server: string },
): Promise<void> {
  const serverUrl = opts.server.replace(/\/$/, '');

  try {
    await loginFlow(serverUrl);
  } catch (err: unknown) {
    console.error(`\n  Login failed: ${err instanceof Error ? err.message : 'Unknown error'}\n`);
    process.exit(1);
  }
}
