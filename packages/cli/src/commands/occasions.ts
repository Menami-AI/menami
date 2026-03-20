import { createClient } from '../client.js';
import chalk from 'chalk';

export async function occasionsAction(
  action: string,
  value: string | undefined,
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();

  if (action === 'add') {
    if (!value) throw new Error('Provide an occasion name: menami occasions add <name>');
    const data = await client.post('/occasions', { occasion: value });
    if (json) { log(JSON.stringify(data, null, 2)); return; }
    log(chalk.green(`\nAdded "${value}". Your occasions: ${data.occasions.join(', ')}\n`));
    return;
  }

  // Default: list
  const data = await client.get('/occasions');
  if (json) { log(JSON.stringify(data, null, 2)); return; }

  if (!data.occasions?.length) {
    log(chalk.dim('\nNo occasions set. Add one with: menami occasions add <name>\n'));
    return;
  }

  log(`\n${chalk.bold('Your Occasions')}`);
  data.occasions.forEach((o: string) => log(`  • ${o}`));
  log('');
}
