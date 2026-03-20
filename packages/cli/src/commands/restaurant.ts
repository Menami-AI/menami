import { createClient } from '../client.js';
import { formatError } from '../format.js';
import chalk from 'chalk';

export async function restaurantAction(
  id: string,
  json: boolean,
  log: (msg: string) => void = console.log,
  errLog: (msg: string) => void = console.error,
): Promise<void> {
  try {
    const client = createClient();
    const data = await client.get(`/restaurants/${id}`);

    if (json) {
      log(JSON.stringify(data, null, 2));
      return;
    }

    log(chalk.bold(`\n${data.name}`));
    if (data.city) log(chalk.dim(`${data.neighborhood ? data.neighborhood + ', ' : ''}${data.city}`));
    if (data.categories?.length) log(`Cuisine: ${data.categories.join(', ')}`);
    if (data.price_tier) log(`Price: ${'$'.repeat(data.price_tier)}`);
    if (data.overall_score != null) log(`Score: ${data.overall_score}/100`);
    if (data.platform_status) log(`Platform: ${data.platform_status === 'on_platform' ? chalk.green('on-platform') : chalk.dim('off-platform')}`);
    log('');
  } catch (err: any) {
    errLog(formatError(err));
  }
}
