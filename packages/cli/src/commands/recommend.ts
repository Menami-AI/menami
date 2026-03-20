import * as readline from 'readline';
import { createClient } from '../client.js';
import { formatScore } from '../format.js';
import chalk from 'chalk';

export async function recommendSingleShot(
  message: string,
  opts: { cuisine?: string; occasion?: string; price?: string },
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();

  const constraints: any = {};
  if (opts.cuisine) constraints.cuisine = opts.cuisine;
  if (opts.occasion) constraints.occasion = opts.occasion;
  if (opts.price) constraints.priceRange = opts.price;

  const data = await client.post('/recommendations', {
    message,
    ...(Object.keys(constraints).length > 0 ? { constraints } : {}),
  });

  if (json) {
    log(JSON.stringify(data, null, 2));
    return;
  }

  if (data.response) log(`\n${data.response}`);

  if (data.recommendations?.length) {
    log('');
    data.recommendations.forEach((r: any, i: number) => {
      const score = r.match_score != null ? `  ${formatScore(r.match_score)}` : '';
      log(`  ${chalk.dim(`${i + 1}.`)} ${chalk.bold(r.name)}${score}`);
      if (r.match_reasons?.length) log(`     ${chalk.dim(r.match_reasons.join(', '))}`);
    });
    log('');
  }
}

export async function recommendInteractive(
  opts: { cuisine?: string; occasion?: string; price?: string },
): Promise<void> {
  const client = createClient();

  console.log(chalk.bold('\n\ud83c\udf7d  Menami Food Agent') + chalk.dim(' (type "exit" to quit)\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('You: '),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log(chalk.dim('\nGoodbye!\n'));
      rl.close();
      return;
    }

    try {
      const constraints: any = {};
      if (opts.cuisine) constraints.cuisine = opts.cuisine;
      if (opts.occasion) constraints.occasion = opts.occasion;
      if (opts.price) constraints.priceRange = opts.price;

      const data = await client.post('/recommendations', {
        message: input,
        ...(Object.keys(constraints).length > 0 ? { constraints } : {}),
      });

      if (data.response) console.log(`${chalk.green('Agent:')} ${data.response}`);
      if (data.recommendations?.length) {
        data.recommendations.forEach((r: any, i: number) => {
          const score = r.match_score != null ? `  ${formatScore(r.match_score)}` : '';
          console.log(`  ${chalk.dim(`${i + 1}.`)} ${chalk.bold(r.name)}${score}`);
          if (r.match_reasons?.length) console.log(`     ${chalk.dim(r.match_reasons.join(', '))}`);
        });
      }
      console.log('');
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
    }

    rl.prompt();
  });

  return new Promise((resolve) => rl.on('close', resolve));
}
