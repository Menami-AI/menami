#!/usr/bin/env node
// ── Menami MCP Server — CLI Entry Point ──────────────────────────────

import { connect } from './auth';

const DEFAULT_SERVER = 'https://api.getmenami.com';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'connect' || command === 'login') {
  const serverUrl = args[1] || process.env.MENAMI_API_URL || DEFAULT_SERVER;
  connect(serverUrl)
    .then(() => {
      console.log('  To use with Claude Desktop, add this to your config:\n');
      console.log(JSON.stringify({
        mcpServers: {
          menami: {
            command: 'npx',
            args: ['@menami/mcp-server', 'serve'],
          },
        },
      }, null, 2));
      console.log('');
      process.exit(0);
    })
    .catch((err: Error) => {
      console.error('\n  Connection failed:', err.message, '\n');
      process.exit(1);
    });
} else if (command === 'serve') {
  // MCP server mode — for Claude Desktop
  console.error('[menami-mcp] Server mode starting...');
  import('./index').then(({ tools }) => {
    console.error(`[menami-mcp] ${tools.length} tools available`);
    process.stdin.resume();
  });
} else {
  console.log(`
  Menami MCP Server — Food intelligence for AI agents

  Usage:
    npx @menami/mcp-server connect    Connect your Menami account (phone number)
    npx @menami/mcp-server serve      Start MCP server (for Claude Desktop)

  Your phone number is your Menami identity — it works across SMS,
  WhatsApp, CLI, and any AI assistant. No API keys needed.

  Environment:
    MENAMI_API_URL    API server URL (default: ${DEFAULT_SERVER})

  Learn more: https://github.com/menami-ai/menami
  `);
}
