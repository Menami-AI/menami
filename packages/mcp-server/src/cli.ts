#!/usr/bin/env node

import { connect } from './auth';

const args = process.argv.slice(2);
const command = args[0];

const HELP = `
menami-mcp — Menami Food Agent MCP Server

Usage:
  npx @menami/mcp-server              Start the MCP server (for Claude Desktop, etc.)
  npx @menami/mcp-server connect      Authenticate with Menami
  npx @menami/mcp-server --help       Show this help

Setup with Claude Desktop:
  1. Run: npx @menami/mcp-server connect
  2. Add to claude_desktop_config.json:
     {
       "mcpServers": {
         "menami": {
           "command": "npx",
           "args": ["@menami/mcp-server"]
         }
       }
     }
  3. Restart Claude Desktop

Learn more: https://github.com/menami-ai/menami
`;

async function main() {
  if (command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP);
    process.exit(0);
  }

  if (command === 'connect') {
    const apiUrl = process.env.MENAMI_API_URL || 'https://busboy-api-production.up.railway.app';
    console.log('Connecting to Menami...');
    try {
      await connect(apiUrl);
      console.log('\nConnected! You can now use Menami with Claude Desktop.');
      console.log('\nAdd this to your claude_desktop_config.json:');
      console.log(JSON.stringify({
        mcpServers: {
          menami: {
            command: 'npx',
            args: ['@menami/mcp-server'],
          },
        },
      }, null, 2));
    } catch (err) {
      console.error('Connection failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
    process.exit(0);
  }

  // Default: start MCP server (stdio mode for Claude Desktop)
  const { tools } = await import('./tools');
  const { loadConfig } = await import('./auth');

  const config = loadConfig();
  if (!config?.accessToken) {
    console.error('Not authenticated. Run: npx @menami/mcp-server connect');
    process.exit(1);
  }

  // MCP stdio server — reads JSON-RPC from stdin, writes to stdout
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', async (line: string) => {
    try {
      const request = JSON.parse(line);

      if (request.method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: { tools: tools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) },
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } else if (request.method === 'tools/call') {
        const tool = tools.find(t => t.name === request.params.name);
        if (!tool) {
          process.stdout.write(JSON.stringify({
            jsonrpc: '2.0', id: request.id,
            error: { code: -32601, message: `Unknown tool: ${request.params.name}` },
          }) + '\n');
          return;
        }

        // Call the Menami API
        const apiUrl = process.env.MENAMI_API_URL || 'https://busboy-api-production.up.railway.app';
        const response = await fetch(`${apiUrl}/api/mcp/tools/${request.params.name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.accessToken}`,
          },
          body: JSON.stringify(request.params.arguments),
        });

        const result = await response.json();
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0', id: request.id,
          result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
        }) + '\n');
      }
    } catch (err) {
      // Ignore parse errors on stdin
    }
  });
}

main();
