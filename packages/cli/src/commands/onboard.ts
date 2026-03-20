import * as readline from 'readline';
import { createClient } from '../client.js';
import chalk from 'chalk';

export async function onboardStep(
  message: string,
  log: (msg: string) => void = console.log,
): Promise<any> {
  const client = createClient();
  const data = await client.post('/recommendations', {
    message,
    constraints: { onboarding: true },
  });

  if (data.response) log(`${chalk.green('Agent:')} ${data.response}`);
  return data;
}

export async function onboardInteractive(): Promise<void> {
  console.log(chalk.bold('\n\ud83c\udf7d  Menami Taste Profile Setup'));
  console.log(chalk.dim('Answer a few questions so I can learn your food preferences.\n'));

  const client = createClient();
  try {
    const start = await client.post('/recommendations', {
      message: 'start onboarding',
      constraints: { onboarding: true },
    });
    if (start.response) console.log(`${chalk.green('Agent:')} ${start.response}\n`);
  } catch (err: any) {
    console.error(chalk.red(`Error: ${err.message}`));
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('You: '),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }

    try {
      const data = await client.post('/recommendations', {
        message: input,
        constraints: { onboarding: true },
      });

      if (data.response) console.log(`${chalk.green('Agent:')} ${data.response}\n`);

      if (data.onboardingComplete) {
        console.log(chalk.bold.green('\nTaste profile setup complete!\n'));
        rl.close();
        return;
      }
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
    }

    rl.prompt();
  });

  return new Promise((resolve) => rl.on('close', resolve));
}
