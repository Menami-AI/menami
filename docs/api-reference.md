# API Reference

Base URL: `https://busboy-api-production.up.railway.app`

All endpoints (except `/oauth/*`) require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Authentication

### POST `/oauth/token`

Exchange an authorization code for tokens.

**Request:**
```json
{
  "grant_type": "authorization_code",
  "code": "auth_code_from_callback",
  "redirect_uri": "http://localhost:19284/callback",
  "code_verifier": "original_pkce_verifier"
}
```

**Response:**
```json
{
  "access_token": "men_...",
  "refresh_token": "men_...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

---

### POST `/api/v2/auth/refresh`

Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "men_..."
}
```

**Response:**
```json
{
  "access_token": "men_new_...",
  "expires_in": 3600
}
```

---

## Recommendations

### POST `/api/v2/recommendations`

Get personalized restaurant recommendations from the food agent.

**Request:**
```json
{
  "message": "best sushi for a date night",
  "constraints": {
    "cuisine": "japanese",
    "occasion": "date_night",
    "priceRange": "$$$",
    "onboarding": false
  }
}
```

**Response:**
```json
{
  "response": "Based on your taste profile, here are my top picks...",
  "recommendations": [
    {
      "id": "rst_abc123",
      "name": "Nobu",
      "match_score": 94,
      "match_reasons": ["matches omakase preference", "date-night atmosphere"],
      "cuisine": "Japanese",
      "price_tier": 4
    }
  ],
  "onboardingComplete": false
}
```

**Onboarding mode:** Set `"onboarding": true` in constraints to run the 5-step taste profile setup. The agent returns `"onboardingComplete": true` when the flow is done.

---

## Restaurants

### GET `/api/v2/restaurants/search`

Search the restaurant knowledge graph.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `city` | string | yes | City to search (e.g. `"San Francisco"`, `"sf"`) |
| `cuisine` | string | no | Cuisine type filter |
| `query` | string | no | Free-text search |
| `priceMin` | number | no | Minimum price tier (1-4) |
| `priceMax` | number | no | Maximum price tier (1-4) |

**Example:**
```bash
curl "https://busboy-api-production.up.railway.app/api/v2/restaurants/search?city=sf&cuisine=japanese&priceMax=3" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "results": [
    {
      "id": "rst_abc123",
      "name": "Nojo Ramen",
      "cuisine": "Japanese",
      "price_tier": 2,
      "overall_score": 87,
      "city": "San Francisco",
      "neighborhood": "Hayes Valley",
      "platform_status": "on_platform"
    }
  ],
  "total": 12,
  "city": "San Francisco"
}
```

---

### GET `/api/v2/restaurants/:id`

Get full details for a restaurant.

**Example:**
```bash
curl "https://busboy-api-production.up.railway.app/api/v2/restaurants/rst_abc123" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "id": "rst_abc123",
  "name": "Nojo Ramen",
  "cuisine": "Japanese",
  "categories": ["Japanese", "Ramen", "Noodles"],
  "price_tier": 2,
  "overall_score": 87,
  "address": "231 Franklin St, San Francisco, CA",
  "city": "San Francisco",
  "neighborhood": "Hayes Valley",
  "phone": "+14155551234",
  "website": "https://nojoramen.com",
  "hours": [
    {"day": "Monday", "open": "11:30", "close": "21:00"}
  ],
  "platform_status": "on_platform",
  "location": {"lat": 37.7749, "lng": -122.4194}
}
```

---

## Profile

### GET `/api/v2/profile`

Get the authenticated user's taste profile.

**Query Parameters:**

| Parameter | Values | Description |
|---|---|---|
| `format` | `summary` (default), `full` | Level of detail |

**Response (summary):**
```json
{
  "summary": "You love Japanese and Italian food. High adventurousness score. Prefers mid-range ($$ - $$$). Top dishes: tonkotsu ramen, cacio e pepe."
}
```

**Response (full):**
```json
{
  "profile": {
    "cuisines": {
      "japanese": {"affinity": "loved", "visit_count": 14, "avg_rating": 4.6},
      "italian": {"affinity": "liked", "visit_count": 8, "avg_rating": 4.2}
    },
    "dietary_restrictions": [],
    "price_preference": {"min": 2, "max": 3},
    "adventurousness": 0.82,
    "spice_tolerance": 3,
    "top_dishes": [
      {"name": "Tonkotsu Ramen", "cuisine": "japanese", "rating": 5.0}
    ],
    "last_updated": "2026-03-15T10:00:00Z"
  }
}
```

---

## Feedback

### POST `/api/v2/feedback`

Submit feedback for a dining experience. Updates the user's taste profile.

**Request:**
```json
{
  "restaurantId": "rst_abc123",
  "overallRating": 5,
  "feedbackText": "Incredible omakase, every course was perfect",
  "occasion": "date_night"
}
```

**Response:**
```json
{
  "success": true,
  "feedbackId": "fb_xyz789",
  "profileUpdated": true,
  "message": "Thanks for your feedback!"
}
```

---

## Bookings

### POST `/api/v2/bookings`

Book a table at a restaurant.

**Request:**
```json
{
  "restaurantId": "rst_abc123",
  "datetime": "2026-04-15T19:30:00",
  "partySize": 2,
  "guest": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+14155550001"
  },
  "specialRequests": "window seat if available"
}
```

**Response:**
```json
{
  "bookingId": "bk_abc123",
  "restaurantName": "Nojo Ramen",
  "datetime": "2026-04-15T19:30:00",
  "partySize": 2,
  "status": "confirmed",
  "confirmationCode": "MEN-4821",
  "cancellationPolicy": "Cancel by 5pm day-of for full refund"
}
```

---

## Occasions

### GET `/api/v2/occasions`

List the user's saved dining occasions.

**Response:**
```json
{
  "occasions": ["date_night", "birthday", "work_lunch"]
}
```

---

### POST `/api/v2/occasions`

Add an occasion.

**Request:**
```json
{
  "occasion": "anniversary"
}
```

**Response:**
```json
{
  "occasions": ["date_night", "birthday", "work_lunch", "anniversary"]
}
```

---

## MCP Tool Proxy

### POST `/api/mcp/tools/:toolName`

Proxy endpoint used by the MCP server to invoke Menami tools by name.

**Supported tool names:** `menami_consult_agent`, `menami_book_table`, `menami_place_order`, `menami_submit_feedback`, `menami_get_taste_profile`, `menami_get_restaurant`, `menami_manage_occasions`

**Request:** The tool's input schema (see [tools.md](./tools.md))

**Response:** The tool's output schema

---

## Error Format

All errors return:

```json
{
  "error": "Human-readable error message"
}
```

Common status codes:

| Code | Meaning |
|---|---|
| 400 | Bad request — check your input |
| 401 | Unauthorized — token missing or expired |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Server error |
