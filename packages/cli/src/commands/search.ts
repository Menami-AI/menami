import { createClient } from '../client.js';
import { formatRestaurantRow, formatNoResults } from '../format.js';

export async function searchAction(
  opts: { city: string; cuisine?: string; query?: string; priceMin?: string; priceMax?: string },
  json: boolean,
  log: (msg: string) => void = console.log,
): Promise<void> {
  const client = createClient();
  const query: Record<string, string> = { city: opts.city };
  if (opts.cuisine) query.cuisine = opts.cuisine;
  if (opts.query) query.query = opts.query;
  if (opts.priceMin) query.priceMin = opts.priceMin;
  if (opts.priceMax) query.priceMax = opts.priceMax;

  const data = await client.get('/restaurants/search', query);

  if (json) {
    log(JSON.stringify(data, null, 2));
    return;
  }

  if (!data.results?.length) {
    log(formatNoResults('restaurants'));
    return;
  }

  data.results.forEach((r: any) => log(formatRestaurantRow(r)));
}
