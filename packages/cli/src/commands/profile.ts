import { createClient } from '../client.js';
import chalk from 'chalk';

export async function profileAction(
  opts: { format: string },
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();
  const data = await client.get('/profile', { format: opts.format });

  if (json) {
    log(JSON.stringify(data, null, 2));
    return;
  }

  if (data.summary) {
    log(`\n${chalk.bold('Your Taste Profile')}`);
    log(data.summary);
    log('');
    return;
  }

  log(`\n${chalk.bold('Your Taste Profile (full)')}`);
  log(JSON.stringify(data.profile, null, 2));
  log('');
}
