# Menami

**Your personal food agent.** Personalized restaurant recommendations, table bookings, and delivery orders — via MCP protocol, CLI, or REST API.

[![npm (CLI)](https://img.shields.io/npm/v/menami?label=menami%20CLI&color=D95A28)](https://www.npmjs.com/package/menami)
[![npm (MCP)](https://img.shields.io/npm/v/%40menami%2Fmcp-server?label=%40menami%2Fmcp-server&color=D95A28)](https://www.npmjs.com/package/@menami/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-D95A28.svg)](https://opensource.org/licenses/MIT)

---

## Quick Start

Choose your path:

| I want to... | Use this |
|---|---|
| Use Menami inside Claude Desktop or another AI agent | [MCP Server](#for-ai-agents-mcp) |
| Use Menami from the terminal | [CLI](#for-developers-cli) |
| Build an app on top of Menami | [REST API](#for-apps-api) |

---

## What Can Menami Do?

- **Personalized recommendations** — powered by your taste graph (cuisine preferences, dietary restrictions, price range, past ratings)
- **Restaurant search** — query the knowledge graph by city, cuisine, or natural language
- **Table booking** — check availability and reserve via OpenTable/Resy adapters
- **Delivery orders** — place pickup or delivery orders with integrated payment
- **Feedback loop** — rate experiences; your taste profile improves with every meal
- **Occasion planning** — save upcoming birthdays, anniversaries, and trips; get proactive restaurant suggestions

---

## For AI Agents (MCP)

Menami implements the [Model Context Protocol](https://modelcontextprotocol.io/) so AI assistants like Claude can call it as a tool.

### 1. Authenticate

```bash
npx @menami/mcp-server connect
```

This opens a browser OAuth flow and saves credentials to `~/.menami/config.json`.

### 2. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent on your platform:

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

Restart Claude Desktop. You'll see Menami tools available in the tool panel.

### 3. Try it in Claude

```
User: Find me a good sushi place for a date night in San Francisco. My budget is $80-120 per person.
```

Claude will call `menami_consult_agent` and return personalized recommendations from your taste profile.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MENAMI_API_URL` | `https://busboy-api-production.up.railway.app` | Override API base URL |

---

## For Developers (CLI)

```bash
npm install -g menami
```

### Commands

#### `menami login`
Authenticate with Menami (OAuth PKCE browser flow).

```bash
menami login
menami login --server https://api.getmenami.com
```

#### `menami recommend [message]`
Get personalized recommendations. Without a message, starts interactive mode.

```bash
menami recommend "best ramen for a cold night"
menami recommend --cuisine japanese --occasion date_night
menami recommend   # interactive mode
```

#### `menami search`
Search the restaurant knowledge graph.

```bash
menami search --city "San Francisco" --cuisine italian
menami search --city "Mexico City" --query "tacos de guisado" --price-max 2
```

#### `menami restaurant <id>`
Get full details for a restaurant.

```bash
menami restaurant rst_abc123
menami restaurant rst_abc123 --json
```

#### `menami profile`
View your taste profile.

```bash
menami profile
menami profile --format full
```

#### `menami onboard`
Interactive 5-step taste profile setup wizard.

```bash
menami onboard
```

#### `menami feedback <restaurant-id>`
Rate a dining experience. Updates your taste profile.

```bash
menami feedback rst_abc123 --rating 4 --text "Amazing tonkotsu, but noisy"
menami feedback rst_abc123 --rating 5 --occasion date_night
```

#### `menami book <restaurant-id>`
Book a table.

```bash
menami book rst_abc123 --date 2026-04-15 --time 19:30 --party 2 --name "Alice" --email alice@example.com
menami book rst_abc123 --date 2026-04-15 --time 19:30 --party 4 --name "Bob" --email bob@example.com --requests "window seat if possible"
```

#### `menami occasions [action] [value]`
Manage dining occasions.

```bash
menami occasions              # list all occasions
menami occasions add birthday
menami occasions add anniversary
```

### Global Flags

| Flag | Description |
|---|---|
| `--json` | Output raw JSON instead of formatted text |
| `--help` | Show help for any command |
| `--version` | Show version |

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MENAMI_API_URL` | `https://busboy-api-production.up.railway.app` | Override API base URL (useful for local dev) |

---

## For Apps (API)

Base URL: `https://busboy-api-production.up.railway.app` (use `https://api.getmenami.com` when custom domain is live)

All endpoints require a Bearer token obtained via OAuth PKCE. See [Authentication](#authentication).

### Key Endpoints

```bash
# Get personalized recommendations
curl -X POST https://busboy-api-production.up.railway.app/api/v2/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "best sushi for a date night", "constraints": {"occasion": "date_night"}}'

# Search restaurants
curl "https://busboy-api-production.up.railway.app/api/v2/restaurants/search?city=sf&cuisine=japanese" \
  -H "Authorization: Bearer $TOKEN"

# Get restaurant details
curl "https://busboy-api-production.up.railway.app/api/v2/restaurants/rst_abc123" \
  -H "Authorization: Bearer $TOKEN"

# Get taste profile
curl "https://busboy-api-production.up.railway.app/api/v2/profile" \
  -H "Authorization: Bearer $TOKEN"

# Submit feedback
curl -X POST https://busboy-api-production.up.railway.app/api/v2/feedback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "rst_abc123", "overallRating": 5, "feedbackText": "Perfect omakase"}'

# Book a table
curl -X POST https://busboy-api-production.up.railway.app/api/v2/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "rst_abc123", "datetime": "2026-04-15T19:30:00", "partySize": 2, "guest": {"name": "Alice", "email": "alice@example.com"}}'

# Token refresh
curl -X POST https://busboy-api-production.up.railway.app/api/v2/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "$REFRESH_TOKEN"}'
```

Full endpoint reference: [docs/api-reference.md](./docs/api-reference.md)

---

## Authentication

Menami uses OAuth 2.0 with PKCE (no client secrets required — safe for native apps and CLIs).

### Flow Overview

```
1. Generate code_verifier (random 32-byte base64url string)
2. Derive code_challenge = SHA256(code_verifier) encoded as base64url
3. Redirect user to: GET /oauth/authorize
      ?response_type=code
      &redirect_uri=http://localhost:19284/callback
      &code_challenge=<challenge>
      &code_challenge_method=S256
      &state=<random>
4. User authenticates in browser
5. Server redirects to callback with ?code=<auth_code>&state=<state>
6. Exchange: POST /oauth/token
      {"grant_type": "authorization_code", "code": "...", "redirect_uri": "...", "code_verifier": "..."}
7. Receive: {"access_token": "...", "refresh_token": "...", "expires_in": 3600}
8. Refresh: POST /api/v2/auth/refresh
      {"refreshToken": "..."}
```

Tokens are stored at `~/.menami/config.json` (permissions: 600).

Full details: [docs/authentication.md](./docs/authentication.md)

---

## Available Tools (MCP)

| Tool | Description |
|---|---|
| `menami_consult_agent` | Get personalized restaurant recommendations based on your taste profile, location, and occasion |
| `menami_book_table` | Book a table at a restaurant — checks availability and creates a reservation |
| `menami_place_order` | Place a delivery or pickup order with item selection and payment |
| `menami_submit_feedback` | Rate a dining experience — updates your taste profile for better future recommendations |
| `menami_get_taste_profile` | View your full taste profile: cuisine preferences, dietary restrictions, price range, favorite dishes |
| `menami_get_restaurant` | Get details for a specific restaurant: menu, hours, reviews, location |
| `menami_manage_occasions` | Create and manage special occasions (birthdays, anniversaries, trips) with proactive reminders |

Full schema reference: [docs/tools.md](./docs/tools.md)

---

## Repository Structure

```
menami/
├── packages/
│   ├── mcp-server/          # @menami/mcp-server — MCP server for AI agents
│   │   └── src/
│   │       ├── cli.ts       # npx entry point (connect + stdio server)
│   │       ├── index.ts     # package exports
│   │       ├── tools.ts     # 7 MCP tool definitions with JSON Schema
│   │       ├── types.ts     # TypeScript interfaces
│   │       └── auth.ts      # OAuth PKCE flow
│   └── cli/                 # menami — terminal CLI
│       └── src/
│           ├── index.ts     # Commander.js entry point (9 commands)
│           ├── auth.ts      # PKCE helpers
│           ├── client.ts    # HTTP client with auto token refresh
│           ├── config.ts    # ~/.menami/config.json persistence
│           ├── format.ts    # Terminal output formatting
│           └── commands/    # One file per command
├── docs/
│   ├── authentication.md
│   ├── api-reference.md
│   └── tools.md
└── .github/workflows/
    └── publish.yml          # CI/CD: build on push, publish on tag
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Open a pull request

Bug reports and feature requests welcome via [GitHub Issues](https://github.com/menami-ai/menami/issues).

---

## License

MIT — see [LICENSE](./LICENSE) for full text.

---

Built by the Menami team. Learn more at [getmenami.com](https://getmenami.com).
