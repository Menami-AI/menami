#!/usr/bin/env node
// ── Menami MCP Server — CLI Entry Point ──────────────────────────────
// Provides the `npx @menami/mcp-server` command for connecting to Menami.

import { connect } from './auth';

const DEFAULT_SERVER = 'https://api.getmenami.com';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'connect' || command === 'login') {
  const serverUrl = args[1] || process.env.MENAMI_API_URL || DEFAULT_SERVER;
  console.log('Connecting to Menami...');
  connect(serverUrl)
    .then(() => {
      console.log('\n✓ Connected! Your AI assistant can now use Menami tools.');
      console.log('\nTo use with Claude Desktop, add this to your config:');
      console.log(JSON.stringify({
        mcpServers: {
          menami: {
            command: 'npx',
            args: ['@menami/mcp-server', 'serve'],
          },
        },
      }, null, 2));
      process.exit(0);
    })
    .catch((err: Error) => {
      console.error('Connection failed:', err.message);
      process.exit(1);
    });
} else if (command === 'serve') {
  // MCP server mode — reads from stdin, writes to stdout (stdio transport)
  // This is what Claude Desktop calls
  console.error('[menami-mcp] Server mode starting...');
  // For now, just export the tools — full stdio transport can be added later
  import('./index').then(({ tools }) => {
    console.error(`[menami-mcp] ${tools.length} tools available`);
    // Keep process alive for MCP client connection
    process.stdin.resume();
  });
} else {
  console.log(`
Menami MCP Server — Food intelligence for AI agents

Usage:
  npx @menami/mcp-server connect    Connect your Menami account (OAuth)
  npx @menami/mcp-server serve      Start MCP server (for Claude Desktop)

Environment:
  MENAMI_API_URL    API server URL (default: ${DEFAULT_SERVER})

Learn more: https://github.com/menami-ai/menami
  `);
}
