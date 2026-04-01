# @menami/mcp-server

> Menami is the food intelligence layer for AI agents. Connect once, access every restaurant.

## Quick Start

### 1. Connect your account

```bash
npx @menami/mcp-server connect
```

Enter your phone number and receive a verification code via SMS or WhatsApp. Your phone number is your Menami identity — no API keys, no OAuth. Same account whether you text Menami or use the CLI.

### 2. Add to Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "menami": {
      "command": "npx",
      "args": ["@menami/mcp-server", "serve"]
    }
  }
}
```

Restart Claude Desktop. You can now ask Claude things like:
- "Find me a great Italian restaurant in SF"
- "Book a table at Pujol for Friday"
- "What's trending in NYC right now?"

## Available Tools

| Tool | Description |
|------|-------------|
| `menami_consult_agent` | Get personalized restaurant recommendations |
| `menami_book_table` | Book a table at any restaurant |
| `menami_place_order` | Place a delivery or pickup order |
| `menami_submit_feedback` | Rate your dining experience |
| `menami_get_taste_profile` | View your food preference profile |
| `menami_get_restaurant` | Get detailed restaurant info |
| `menami_manage_occasions` | Set up special occasions and trips |

## CLI Usage

For a full command-line experience, install the Menami CLI:

```bash
npm install -g menami
menami login
menami recommend "best tacos in SF"
```

See the [CLI documentation](https://github.com/menami-ai/menami) for all 9 commands.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MENAMI_API_URL` | `https://api.getmenami.com` | API server URL |

## Cities

Menami currently covers restaurants in:
- San Francisco
- New York City
- Mexico City

## Links

- [GitHub](https://github.com/menami-ai/menami)
- [Website](https://getmenami.com)
- [API Docs](https://api.getmenami.com)
