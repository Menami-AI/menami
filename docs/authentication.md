# Authentication

Menami uses OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange). This is suitable for native apps and CLIs because it does not require a client secret.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/oauth/authorize` | GET | Start the authorization flow (redirect user here) |
| `/oauth/token` | POST | Exchange authorization code for tokens |
| `/api/v2/auth/refresh` | POST | Refresh an expired access token |

Base URL: `https://busboy-api-production.up.railway.app`

---

## PKCE Flow Step-by-Step

### Step 1: Generate PKCE Pair

```typescript
import * as crypto from 'crypto';

// 32 random bytes, base64url-encoded
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// SHA-256 hash of the verifier, base64url-encoded
const codeChallenge = crypto.createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');
```

### Step 2: Build Authorization URL

```
GET /oauth/authorize
  ?response_type=code
  &redirect_uri=http://localhost:19284/callback
  &code_challenge=<base64url SHA-256 of verifier>
  &code_challenge_method=S256
  &state=<random hex string for CSRF protection>
```

Open this URL in the user's browser.

### Step 3: Receive Callback

Start a local HTTP server on port `19284` listening for `GET /callback`:

```
http://localhost:19284/callback?code=<auth_code>&state=<state>
```

Verify the `state` parameter matches what you sent to prevent CSRF attacks.

### Step 4: Exchange Code for Tokens

```bash
curl -X POST https://busboy-api-production.up.railway.app/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "<auth_code>",
    "redirect_uri": "http://localhost:19284/callback",
    "code_verifier": "<original verifier string>"
  }'
```

Response:

```json
{
  "access_token": "men_...",
  "refresh_token": "men_...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Step 5: Use the Token

Include the access token in all API requests:

```
Authorization: Bearer men_...
```

### Step 6: Refresh When Expired

Access tokens expire after 1 hour. Refresh using the refresh token:

```bash
curl -X POST https://busboy-api-production.up.railway.app/api/v2/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "men_..."}'
```

Response:

```json
{
  "access_token": "men_new_...",
  "expires_in": 3600
}
```

---

## Token Storage

The CLI and MCP server store tokens at `~/.menami/config.json`:

```json
{
  "accessToken": "men_...",
  "refreshToken": "men_...",
  "expiresAt": 1744000000000,
  "serverUrl": "https://busboy-api-production.up.railway.app"
}
```

File permissions are set to `0600` (owner read/write only) and the directory to `0700`.

---

## Callback Server

The CLI starts a temporary HTTP server on `localhost:19284` to receive the OAuth callback. This port is hardcoded and registered as the only allowed redirect URI. The server shuts down immediately after receiving the callback (or times out after 5 minutes).

---

## Security Notes

- Never log or transmit the `code_verifier` before exchanging it
- Always validate the `state` parameter in the callback to prevent CSRF
- Tokens are stored with restricted file permissions — do not copy them to shared locations
- The `refresh_token` is long-lived; treat it like a password
