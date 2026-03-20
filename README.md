<p align="center">
  <img src="assets/logo.svg" alt="menami" width="320" />
</p>

<p align="center">
  <strong>Your personal food agent.</strong><br>
  AI-powered restaurant recommendations, table bookings, and delivery — via MCP, CLI, or API.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-D95A28.svg" alt="License: MIT"></a>
  <a href="https://getmenami.com"><img src="https://img.shields.io/badge/getmenami.com-D95A28" alt="getmenami.com"></a>
</p>

---

## Why Menami?

Most restaurant APIs give you data. Menami gives you an **agent that knows you**.

- **It learns your taste.** Not just "Italian" — it knows you love smoky mole, hate loud restaurants, and your partner is allergic to shellfish.
- **It acts on your behalf.** Your anniversary is in 3 weeks? Menami already booked a table at the impossible-to-get restaurant that matches both your taste profiles.
- **It gets better every meal.** Every rating, every feedback, every "I tried that place and loved it" makes the next recommendation sharper.
- **It works everywhere.** Use it from Claude, from the terminal, from your own app, or just text it on WhatsApp.

Menami covers **San Francisco, New York City, and Mexico City** with 3,000+ restaurants in the knowledge graph.

---

## Quick Start

| I want to... | Use this |
|---|---|
| Use Menami inside Claude Desktop or another AI agent | [MCP Server](#for-ai-agents-mcp) |
| Use Menami from the terminal | [CLI](#for-developers-cli) |
| Build an app on top of Menami | [REST API](#for-apps-api) |

---

## For AI Agents (MCP)

Menami implements the [Model Context Protocol](https://modelcontextprotocol.io/) so AI assistants like Claude can call it as a tool.

### 1. Authenticate

```bash
npx @menami/mcp-server connect
```

This opens a browser OAuth flow and saves credentials to `~/.menami/config.json`.

### 2. Add to Claude Desktop

Edit your Claude Desktop config:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "menami": {
      "command": "npx",
      "args": ["@menami/mcp-server"]
    }
  }
}
```

Restart Claude Desktop. You'll see Menami tools in the tool panel.

### 3. Try it

> "Find me a good sushi place for a date night in San Francisco. Budget is $80-120 per person."

Claude will call `menami_consult_agent` and return personalized recommendations from your taste profile.

### Available Tools

| Tool | Description |
|---|---|
| `menami_consult_agent` | Personalized restaurant recommendations based on taste, location, and occasion |
| `menami_book_table` | Check availability and book a table |
| `menami_place_order` | Place a delivery or pickup order |
| `menami_submit_feedback` | Rate a dining experience — improves future recommendations |
| `menami_get_taste_profile` | View your taste profile (cuisines, dietary, price range, favorites) |
| `menami_get_restaurant` | Get restaurant details (menu, hours, reviews, location) |
| `menami_manage_occasions` | Manage birthdays, anniversaries, and trips for proactive suggestions |

Full schema reference: [docs/tools.md](./docs/tools.md)

---

## For Developers (CLI)

```bash
npx menami login
```

### Commands

```bash
# Get personalized recommendations
menami recommend "best ramen for a cold night"
menami recommend --cuisine japanese --occasion date_night
menami recommend                    # interactive mode

# Search the knowledge graph
menami search --city "San Francisco" --cuisine italian
menami search --city "Mexico City" --query "tacos de guisado"

# Get restaurant details
menami restaurant <id>
menami restaurant <id> --json

# View your taste profile
menami profile
menami profile --format full

# Set up your taste profile (interactive wizard)
menami onboard

# Rate a dining experience
menami feedback <restaurant-id> --rating 4 --text "Amazing tonkotsu, but noisy"

# Book a table
menami book <restaurant-id> --date 2026-04-15 --time 19:30 --party 2

# Manage occasions
menami occasions add birthday
menami occasions add anniversary
```

### Global Flags

| Flag | Description |
|---|---|
| `--json` | Output raw JSON |
| `--help` | Show help for any command |
| `--version` | Show version |

---

## For Apps (API)

Base URL: `https://api.getmenami.com`

All endpoints require a Bearer token. See [Authentication](#authentication).

### Recommendations

```bash
curl -X POST https://api.getmenami.com/v2/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "date night Italian restaurant"}'
```

### Search Restaurants

```bash
curl "https://api.getmenami.com/v2/restaurants/search?city=sf&cuisine=japanese" \
  -H "Authorization: Bearer $TOKEN"
```

### Book a Table

```bash
curl -X POST https://api.getmenami.com/v2/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rst_abc123",
    "datetime": "2026-04-15T19:30:00",
    "partySize": 2,
    "guest": {"name": "Alice", "email": "alice@example.com"}
  }'
```

### Submit Feedback

```bash
curl -X POST https://api.getmenami.com/v2/feedback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "rst_abc123", "overallRating": 5, "feedbackText": "Perfect omakase"}'
```

### Get Taste Profile

```bash
curl https://api.getmenami.com/v2/profile \
  -H "Authorization: Bearer $TOKEN"
```

Full endpoint reference: [docs/api-reference.md](./docs/api-reference.md)

---

## Authentication

Menami uses **OAuth 2.0 with PKCE** — no client secrets needed. Safe for CLIs, native apps, and AI agents.

```
1. Generate code_verifier + code_challenge (SHA-256)
2. Open browser → /oauth/authorize?code_challenge=...
3. User authenticates
4. Receive auth code at localhost callback
5. Exchange code + verifier for access_token + refresh_token
6. Use Bearer token for all API calls
7. Refresh when expired via POST /v2/auth/refresh
```

Tokens are stored at `~/.menami/config.json`.

Full details: [docs/authentication.md](./docs/authentication.md)

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `MENAMI_API_URL` | `https://api.getmenami.com` | Override API base URL |

---

## Repository Structure

```
menami/
├── packages/
│   ├── mcp-server/        # @menami/mcp-server — for AI agents
│   │   └── src/
│   │       ├── cli.ts     # npx entry point (connect + MCP stdio server)
│   │       ├── tools.ts   # 7 MCP tool definitions with JSON Schema
│   │       ├── types.ts   # TypeScript interfaces
│   │       └── auth.ts    # OAuth PKCE flow
│   └── cli/               # menami — terminal CLI
│       └── src/
│           ├── index.ts   # Commander.js (9 commands)
│           ├── commands/  # One file per command
│           ├── client.ts  # HTTP client with auto token refresh
│           └── config.ts  # ~/.menami/config.json persistence
├── docs/
│   ├── api-reference.md   # Full REST API docs
│   ├── authentication.md  # OAuth PKCE details
│   └── tools.md           # MCP tool schemas
└── assets/
    └── logo.svg
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Open a pull request

Bug reports and feature requests: [GitHub Issues](https://github.com/menami-ai/menami/issues)

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  Built by the Menami team. <a href="https://getmenami.com">getmenami.com</a>
</p>
