#!/usr/bin/env node
import { Command } from 'commander';
import { loginAction } from './commands/login.js';
import { searchAction } from './commands/search.js';
import { restaurantAction } from './commands/restaurant.js';
import { profileAction } from './commands/profile.js';
import { feedbackAction } from './commands/feedback.js';
import { occasionsAction } from './commands/occasions.js';
import { bookAction } from './commands/book.js';
import { recommendSingleShot, recommendInteractive } from './commands/recommend.js';
import { onboardInteractive } from './commands/onboard.js';

const program = new Command();

program
  .name('menami')
  .description('Menami Food Agent CLI — the food intelligence layer for the agentic internet')
  .version('0.1.0')
  .option('--json', 'Output raw JSON instead of formatted text');

// ── Auth ──────────────────────────────────────────────────────────────
program
  .command('login')
  .description('Authenticate with Menami')
  .option('--server <url>', 'Menami API server URL', 'https://api.getmenami.com')
  .action((opts) => loginAction(opts));

// ── Core commands ─────────────────────────────────────────────────────
program
  .command('recommend [message]')
  .description('Get personalized restaurant recommendations (interactive without args)')
  .option('--cuisine <cuisine>', 'Filter by cuisine')
  .option('--occasion <occasion>', 'Occasion context')
  .option('--price <range>', 'Price range')
  .action((message, opts) => {
    if (message) return recommendSingleShot(message, opts, program.opts().json);
    return recommendInteractive(opts);
  });

program
  .command('search')
  .description('Search the restaurant knowledge graph')
  .requiredOption('--city <city>', 'City to search in')
  .option('--cuisine <cuisine>', 'Filter by cuisine')
  .option('--query <query>', 'Free-text search query')
  .option('--price-min <min>', 'Minimum price tier (1-4)')
  .option('--price-max <max>', 'Maximum price tier (1-4)')
  .action((opts) => searchAction(opts, program.opts().json));

program
  .command('restaurant <id>')
  .description('Get full details about a restaurant')
  .action((id) => restaurantAction(id, program.opts().json));

program
  .command('profile')
  .description('View your taste profile')
  .option('--format <format>', 'Output format: summary or full', 'summary')
  .action((opts) => profileAction(opts, program.opts().json));

program
  .command('onboard')
  .description('Interactive taste profile setup (5-step wizard)')
  .action(() => onboardInteractive());

program
  .command('feedback <restaurant-id>')
  .description('Submit feedback about a dining experience')
  .requiredOption('--rating <1-5>', 'Overall rating (1-5)')
  .option('--text <text>', 'Feedback text')
  .option('--occasion <occasion>', 'Occasion type')
  .action((restaurantId, opts) => feedbackAction(restaurantId, opts, program.opts().json));

program
  .command('book <restaurant-id>')
  .description('Book a table at a restaurant')
  .requiredOption('--date <YYYY-MM-DD>', 'Booking date')
  .requiredOption('--time <HH:MM>', 'Booking time')
  .requiredOption('--party <size>', 'Party size')
  .requiredOption('--name <name>', 'Guest name')
  .requiredOption('--email <email>', 'Guest email')
  .option('--requests <text>', 'Special requests')
  .action((restaurantId, opts) => bookAction(restaurantId, opts, program.opts().json));

program
  .command('occasions [action] [value]')
  .description('Manage dining occasions (list, add)')
  .action((action = 'list', value) => occasionsAction(action, value, program.opts().json));

// ── TODO: Future commands ─────────────────────────────────────────────
// TODO: Add `menami order <restaurant-id>` when POST /api/v2/orders is fully implemented
//   - Should support: --items, --type (delivery|pickup), --address, --schedule
//   - API endpoint exists but returns placeholder response
//
// TODO: Add `menami status <order-id>` for real-time order tracking
//   - Requires: order tracking API endpoint (not yet built)
//
// TODO: Add `menami history` for past orders, bookings, and feedback
//   - Requires: GET /api/v2/history endpoint (not yet built)
//   - Should support: --type (orders|bookings|feedback), --limit, --since

program.parse();
