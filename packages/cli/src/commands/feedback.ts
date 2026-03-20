import { createClient } from '../client.js';
import chalk from 'chalk';

export async function feedbackAction(
  restaurantId: string,
  opts: { rating: string; text?: string; occasion?: string },
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();
  const body: any = {
    restaurantId,
    overallRating: parseInt(opts.rating, 10),
  };
  if (opts.text) body.feedbackText = opts.text;
  if (opts.occasion) body.occasion = opts.occasion;

  const data = await client.post('/feedback', body);

  if (json) {
    log(JSON.stringify(data, null, 2));
    return;
  }

  log(chalk.green('\nFeedback submitted successfully! Your taste profile has been updated.\n'));
}
