# menami

> Personal food agent CLI — the food intelligence layer for the agentic internet.

## Install

```bash
npm install -g menami
```

Or run directly:

```bash
npx menami recommend "best ramen in NYC"
```

## Why Phone Number?

Menami gives you personalized restaurant recommendations. To personalize, we need to know who you are. Your phone number is your Menami identity — it works across SMS, WhatsApp, CLI, and any AI assistant. No API keys to manage, no OAuth flows to configure. Text us or run a command — same account, same taste profile, same bookings.

## Quick Start

```bash
# 1. Login (enter your phone number, get a code via SMS or WhatsApp)
menami login

# 2. Complete your taste profile
menami onboard

# 3. Get recommendations
menami recommend "romantic Italian dinner in SF"

# 4. Book a table
menami book <restaurant-id> --date 2026-04-15 --time 19:30 --party 2
```

## Commands

| Command | Description |
|---------|-------------|
| `menami login` | Authenticate with your Menami account |
| `menami recommend <query>` | Get personalized restaurant recommendations |
| `menami recommend -i` | Interactive recommendation session |
| `menami search <query>` | Search the restaurant knowledge graph |
| `menami restaurant <id>` | Get detailed restaurant info |
| `menami profile` | View your taste profile summary |
| `menami profile --full` | View full taste profile with embeddings |
| `menami onboard` | Complete the 5-step taste profile wizard |
| `menami feedback <id>` | Rate a dining experience |
| `menami book <id>` | Book a table at a restaurant |
| `menami occasions` | Manage special dates and trips |

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON instead of formatted text |
| `--help` | Show help for any command |
| `--version` | Show CLI version |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MENAMI_API_URL` | `https://api.getmenami.com` | API server URL |

## Configuration

Credentials are stored in `~/.menami/config.json` (created on first login).

## MCP Server

To use Menami with Claude Desktop or other MCP clients, install the MCP server:

```bash
npx @menami/mcp-server connect
```

See [@menami/mcp-server](https://www.npmjs.com/package/@menami/mcp-server) for setup instructions.

## Cities

Menami currently covers 8,396 restaurants across:
- San Francisco
- New York City
- Mexico City

## Links

- [GitHub](https://github.com/menami-ai/menami)
- [Website](https://getmenami.com)
- [MCP Server](https://www.npmjs.com/package/@menami/mcp-server)
