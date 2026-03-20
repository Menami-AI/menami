# MCP Tool Reference

Menami exposes 7 tools via the Model Context Protocol. Each tool has a full JSON Schema for inputs and outputs.

---

## `menami_consult_agent`

Get personalized restaurant recommendations based on your taste profile, location, occasion, and dietary needs.

### Input Schema

```json
{
  "type": "object",
  "required": ["query"],
  "properties": {
    "query": {
      "type": "string",
      "description": "Natural-language request, e.g. 'Best sushi near me for a date night'"
    },
    "location": {
      "type": "object",
      "required": ["lat", "lng"],
      "properties": {
        "lat": { "type": "number" },
        "lng": { "type": "number" }
      },
      "description": "Current location for proximity-based results"
    },
    "cuisine": {
      "type": "string",
      "description": "Preferred cuisine type, e.g. 'Japanese', 'Mexican', 'Italian'"
    },
    "priceRange": {
      "type": "object",
      "properties": {
        "min": { "type": "number" },
        "max": { "type": "number" },
        "currency": { "type": "string", "default": "USD" }
      },
      "description": "Budget range per person"
    },
    "dietaryRestrictions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "e.g. ['vegetarian', 'gluten-free']"
    },
    "occasion": {
      "type": "string",
      "description": "e.g. 'date_night', 'business', 'birthday'"
    },
    "partySize": {
      "type": "number",
      "description": "Number of guests"
    }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["recommendations", "explanation"],
  "properties": {
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "restaurantId": { "type": "string" },
          "name": { "type": "string" },
          "cuisine": { "type": "string" },
          "priceRange": { "type": "object" },
          "rating": { "type": "number" },
          "matchScore": { "type": "number" },
          "matchReason": { "type": "string" },
          "address": { "type": "string" },
          "distance": { "type": "number" },
          "availableSlots": { "type": "array" }
        }
      }
    },
    "explanation": { "type": "string" },
    "followUpQuestions": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## `menami_book_table`

Book a table at a restaurant. Checks real-time availability and creates a reservation via OpenTable or Resy adapters.

### Input Schema

```json
{
  "type": "object",
  "required": ["restaurantId", "date", "time", "partySize"],
  "properties": {
    "restaurantId": { "type": "string" },
    "date": { "type": "string", "description": "ISO 8601 date: YYYY-MM-DD" },
    "time": { "type": "string", "description": "24h format: HH:mm" },
    "partySize": { "type": "number" },
    "specialRequests": { "type": "string" },
    "occasion": { "type": "string" }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["reservationId", "restaurantName", "date", "time", "partySize", "confirmationCode", "status"],
  "properties": {
    "reservationId": { "type": "string" },
    "restaurantName": { "type": "string" },
    "date": { "type": "string" },
    "time": { "type": "string" },
    "partySize": { "type": "number" },
    "confirmationCode": { "type": "string" },
    "status": { "type": "string", "enum": ["confirmed", "pending", "waitlisted"] },
    "cancellationPolicy": { "type": "string" }
  }
}
```

---

## `menami_place_order`

Place a delivery or pickup order. Handles item selection, delivery logistics, and payment.

### Input Schema

```json
{
  "type": "object",
  "required": ["restaurantId", "items", "orderType"],
  "properties": {
    "restaurantId": { "type": "string" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["menuItemId", "name", "quantity"],
        "properties": {
          "menuItemId": { "type": "string" },
          "name": { "type": "string" },
          "quantity": { "type": "number" },
          "specialInstructions": { "type": "string" },
          "modifiers": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "orderType": { "type": "string", "enum": ["delivery", "pickup"] },
    "deliveryAddress": { "type": "string" },
    "scheduledTime": { "type": "string", "description": "ISO 8601" },
    "paymentMethodId": { "type": "string" },
    "tip": { "type": "number" }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["orderId", "restaurantName", "items", "subtotal", "tax", "total", "estimatedTime", "status"],
  "properties": {
    "orderId": { "type": "string" },
    "restaurantName": { "type": "string" },
    "items": { "type": "array" },
    "subtotal": { "type": "number" },
    "deliveryFee": { "type": "number" },
    "tax": { "type": "number" },
    "tip": { "type": "number" },
    "total": { "type": "number" },
    "estimatedTime": { "type": "string" },
    "status": { "type": "string", "enum": ["placed", "confirmed", "preparing"] },
    "trackingUrl": { "type": "string" }
  }
}
```

---

## `menami_submit_feedback`

Rate a dining experience. Feedback is processed to update your taste profile so future recommendations improve.

### Input Schema

```json
{
  "type": "object",
  "required": ["restaurantId", "rating"],
  "properties": {
    "restaurantId": { "type": "string" },
    "orderId": { "type": "string" },
    "reservationId": { "type": "string" },
    "rating": { "type": "number", "minimum": 1, "maximum": 5 },
    "foodRating": { "type": "number", "minimum": 1, "maximum": 5 },
    "serviceRating": { "type": "number", "minimum": 1, "maximum": 5 },
    "ambienceRating": { "type": "number", "minimum": 1, "maximum": 5 },
    "comment": { "type": "string" },
    "dishes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "rating"],
        "properties": {
          "name": { "type": "string" },
          "rating": { "type": "number", "minimum": 1, "maximum": 5 },
          "comment": { "type": "string" }
        }
      }
    }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["feedbackId", "profileUpdated", "thankYouMessage"],
  "properties": {
    "feedbackId": { "type": "string" },
    "profileUpdated": { "type": "boolean" },
    "tasteProfileChanges": { "type": "array", "items": { "type": "string" } },
    "thankYouMessage": { "type": "string" }
  }
}
```

---

## `menami_get_taste_profile`

View your food preference profile: cuisine preferences ranked by affinity score, dietary restrictions, favorite restaurants, price range, spice tolerance, and adventurousness.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "detailed": {
      "type": "boolean",
      "default": false,
      "description": "Return detailed breakdown including individual dish preferences"
    }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["cuisinePreferences", "dietaryRestrictions", "favoriteRestaurants", "pricePreference", "adventurousness", "topDishes", "lastUpdated"],
  "properties": {
    "cuisinePreferences": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "cuisine": { "type": "string" },
          "score": { "type": "number", "description": "0-1 affinity score" },
          "visitCount": { "type": "number" },
          "avgRating": { "type": "number" }
        }
      }
    },
    "dietaryRestrictions": { "type": "array", "items": { "type": "string" } },
    "favoriteRestaurants": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "visitCount": { "type": "number" }
        }
      }
    },
    "pricePreference": {
      "type": "object",
      "properties": {
        "min": { "type": "number" },
        "max": { "type": "number" },
        "currency": { "type": "string" }
      }
    },
    "spiceLevel": { "type": "number", "description": "1-5" },
    "adventurousness": { "type": "number", "description": "0-1 (0=stick to favorites, 1=always try new)" },
    "topDishes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "cuisine": { "type": "string" },
          "rating": { "type": "number" }
        }
      }
    },
    "lastUpdated": { "type": "string", "description": "ISO 8601 timestamp" }
  }
}
```

---

## `menami_get_restaurant`

Get detailed information about a specific restaurant including menu, hours, reviews, and location.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "restaurantId": { "type": "string", "description": "Restaurant ID" },
    "slug": { "type": "string", "description": "URL slug (alternative to restaurantId)" },
    "includeMenu": { "type": "boolean", "default": false },
    "includeReviews": { "type": "boolean", "default": false }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["id", "name", "slug", "cuisine", "address", "phone", "rating", "reviewCount", "priceRange", "hours", "features", "location"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "slug": { "type": "string" },
    "cuisine": { "type": "string" },
    "address": { "type": "string" },
    "phone": { "type": "string" },
    "website": { "type": "string" },
    "rating": { "type": "number" },
    "reviewCount": { "type": "number" },
    "priceRange": { "type": "object" },
    "hours": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "day": { "type": "string" },
          "open": { "type": "string" },
          "close": { "type": "string" }
        }
      }
    },
    "features": { "type": "array", "items": { "type": "string" } },
    "menu": { "type": "array", "description": "Only present if includeMenu=true" },
    "reviews": { "type": "array", "description": "Only present if includeReviews=true" },
    "location": {
      "type": "object",
      "properties": {
        "lat": { "type": "number" },
        "lng": { "type": "number" }
      }
    }
  }
}
```

---

## `menami_manage_occasions`

Create and manage special dining occasions (birthdays, anniversaries, trips). The agent monitors upcoming occasions and proactively suggests restaurants.

### Input Schema

```json
{
  "type": "object",
  "required": ["action"],
  "properties": {
    "action": {
      "type": "string",
      "enum": ["list", "create", "update", "delete"]
    },
    "occasion": {
      "type": "object",
      "required": ["type", "name", "date"],
      "description": "Required for 'create'",
      "properties": {
        "type": { "type": "string", "enum": ["birthday", "anniversary", "business", "date_night", "trip", "custom"] },
        "name": { "type": "string" },
        "date": { "type": "string", "description": "ISO 8601 date" },
        "partySize": { "type": "number" },
        "budget": { "type": "object" },
        "preferences": { "type": "string" },
        "location": { "type": "object" },
        "city": { "type": "string" },
        "reminderDaysBefore": { "type": "number" }
      }
    },
    "occasionId": { "type": "string", "description": "Required for 'update' and 'delete'" },
    "updates": { "type": "object", "description": "Fields to update (required for 'update')" }
  }
}
```

### Output Schema

```json
{
  "type": "object",
  "required": ["occasions", "message"],
  "properties": {
    "occasions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string" },
          "name": { "type": "string" },
          "date": { "type": "string" },
          "partySize": { "type": "number" },
          "budget": { "type": "object" },
          "preferences": { "type": "string" },
          "location": { "type": "object" },
          "city": { "type": "string" },
          "reminderDaysBefore": { "type": "number" }
        }
      }
    },
    "message": { "type": "string" }
  }
}
```
