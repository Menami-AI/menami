import chalk from 'chalk';

export function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length)),
  );

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
  const separator = colWidths.map(w => '─'.repeat(w)).join('──');
  const body = rows
    .map(row => row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join('  '))
    .join('\n');

  return `${chalk.bold(headerLine)}\n${chalk.dim(separator)}\n${body}`;
}

export function formatScore(score: number): string {
  if (score >= 80) return chalk.green(`${score}`);
  if (score >= 50) return chalk.yellow(`${score}`);
  return chalk.red(`${score}`);
}

export function formatPriceTier(tier: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, tier)));
}

export function formatRestaurantRow(r: {
  name: string;
  cuisine?: string;
  price_tier?: number;
  overall_score?: number;
}): string {
  const parts = [chalk.bold(r.name)];
  if (r.cuisine) parts.push(chalk.dim(r.cuisine));
  if (r.price_tier) parts.push(chalk.yellow(formatPriceTier(r.price_tier)));
  if (r.overall_score != null) parts.push(formatScore(r.overall_score));
  return parts.join('  ');
}

export function formatError(err: any): string {
  if (err?.body?.error) return chalk.red(`Error: ${err.body.error}`);
  if (err?.message) return chalk.red(`Error: ${err.message}`);
  return chalk.red('An unknown error occurred.');
}

export function formatNoResults(entity: string): string {
  return chalk.dim(`No ${entity} found. Try broadening your criteria.`);
}
