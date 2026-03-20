import { createClient } from '../client.js';
import chalk from 'chalk';

export async function bookAction(
  restaurantId: string,
  opts: { date: string; time: string; party: string; name: string; email: string; requests?: string },
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();
  const datetime = `${opts.date}T${opts.time}:00`;

  const data = await client.post('/bookings', {
    restaurantId,
    datetime,
    partySize: parseInt(opts.party, 10),
    guest: { name: opts.name, email: opts.email },
    specialRequests: opts.requests,
  });

  if (json) {
    log(JSON.stringify(data, null, 2));
    return;
  }

  log(`\n${chalk.green('Booking confirmed!')}`);
  log(`  Booking ID: ${data.bookingId}`);
  log(`  Status: ${data.status}`);
  log(`  Date: ${opts.date} at ${opts.time}`);
  log(`  Party size: ${opts.party}`);
  log('');
}
