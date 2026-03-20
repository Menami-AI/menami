// ── Menami MCP Server — Tool Definitions ──────────────────────────────
// 7 MCP tools with full JSON Schema input/output specifications.

import { ToolDefinition } from './types';

export const tools: ToolDefinition[] = [
  // ── 1. Consult Agent ──────────────────────────────────────────────
  {
    name: 'menami_consult_agent',
    description:
      'Get personalized restaurant recommendations from your Menami food agent. ' +
      'It considers your taste profile, location, occasion, and dietary needs ' +
      'to suggest the best options.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural-language request, e.g. "Best sushi near me for a date night"',
        },
        location: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
          required: ['lat', 'lng'],
          description: 'Current location for proximity-based results',
        },
        cuisine: {
          type: 'string',
          description: 'Preferred cuisine type, e.g. "Japanese", "Mexican", "Italian"',
        },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
            currency: { type: 'string', default: 'USD' },
          },
          description: 'Budget range per person',
        },
        dietaryRestrictions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Dietary restrictions, e.g. ["vegetarian", "gluten-free"]',
        },
        occasion: {
          type: 'string',
          description: 'Occasion type, e.g. "date_night", "business", "birthday"',
        },
        partySize: {
          type: 'number',
          description: 'Number of guests',
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              restaurantId: { type: 'string' },
              name: { type: 'string' },
              cuisine: { type: 'string' },
              priceRange: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                  currency: { type: 'string' },
                },
              },
              rating: { type: 'number' },
              matchScore: { type: 'number' },
              matchReason: { type: 'string' },
              address: { type: 'string' },
              distance: { type: 'number' },
              availableSlots: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    time: { type: 'string' },
                    partySize: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        explanation: { type: 'string' },
        followUpQuestions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['recommendations', 'explanation'],
    },
  },

  // ── 2. Book Table ─────────────────────────────────────────────────
  {
    name: 'menami_book_table',
    description:
      'Book a table at a restaurant. Checks availability and creates a reservation.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'Restaurant identifier',
        },
        date: {
          type: 'string',
          description: 'Reservation date in ISO 8601 format (YYYY-MM-DD)',
        },
        time: {
          type: 'string',
          description: 'Reservation time in 24h format (HH:mm)',
        },
        partySize: {
          type: 'number',
          description: 'Number of guests',
        },
        specialRequests: {
          type: 'string',
          description: 'Special requests, e.g. "window seat", "high chair needed"',
        },
        occasion: {
          type: 'string',
          description: 'Occasion type for the reservation',
        },
      },
      required: ['restaurantId', 'date', 'time', 'partySize'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        reservationId: { type: 'string' },
        restaurantName: { type: 'string' },
        date: { type: 'string' },
        time: { type: 'string' },
        partySize: { type: 'number' },
        confirmationCode: { type: 'string' },
        status: {
          type: 'string',
          enum: ['confirmed', 'pending', 'waitlisted'],
        },
        cancellationPolicy: { type: 'string' },
      },
      required: ['reservationId', 'restaurantName', 'date', 'time', 'partySize', 'confirmationCode', 'status'],
    },
  },

  // ── 3. Place Order ────────────────────────────────────────────────
  {
    name: 'menami_place_order',
    description:
      'Place a delivery or pickup order at a restaurant. Handles item selection, ' +
      'delivery logistics, and payment.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'Restaurant identifier',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              menuItemId: { type: 'string' },
              name: { type: 'string' },
              quantity: { type: 'number' },
              specialInstructions: { type: 'string' },
              modifiers: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['menuItemId', 'name', 'quantity'],
          },
          description: 'Items to order',
        },
        orderType: {
          type: 'string',
          enum: ['delivery', 'pickup'],
          description: 'Delivery or pickup',
        },
        deliveryAddress: {
          type: 'string',
          description: 'Delivery address (required for delivery orders)',
        },
        scheduledTime: {
          type: 'string',
          description: 'Schedule the order for a specific time (ISO 8601)',
        },
        paymentMethodId: {
          type: 'string',
          description: 'Saved payment method ID',
        },
        tip: {
          type: 'number',
          description: 'Tip amount in dollars',
        },
      },
      required: ['restaurantId', 'items', 'orderType'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        restaurantName: { type: 'string' },
        items: { type: 'array' },
        subtotal: { type: 'number' },
        deliveryFee: { type: 'number' },
        tax: { type: 'number' },
        tip: { type: 'number' },
        total: { type: 'number' },
        estimatedTime: { type: 'string' },
        status: {
          type: 'string',
          enum: ['placed', 'confirmed', 'preparing'],
        },
        trackingUrl: { type: 'string' },
      },
      required: ['orderId', 'restaurantName', 'items', 'subtotal', 'tax', 'total', 'estimatedTime', 'status'],
    },
  },

  // ── 4. Submit Feedback ────────────────────────────────────────────
  {
    name: 'menami_submit_feedback',
    description:
      'Rate your dining experience. Feedback updates your taste profile so ' +
      'future recommendations improve.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'Restaurant identifier',
        },
        orderId: {
          type: 'string',
          description: 'Order ID if rating a delivery/pickup order',
        },
        reservationId: {
          type: 'string',
          description: 'Reservation ID if rating a dine-in experience',
        },
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Overall rating (1-5)',
        },
        foodRating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Food quality rating (1-5)',
        },
        serviceRating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Service quality rating (1-5)',
        },
        ambienceRating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Ambience rating (1-5)',
        },
        comment: {
          type: 'string',
          description: 'Written review or comments',
        },
        dishes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              comment: { type: 'string' },
            },
            required: ['name', 'rating'],
          },
          description: 'Individual dish ratings',
        },
      },
      required: ['restaurantId', 'rating'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        feedbackId: { type: 'string' },
        profileUpdated: { type: 'boolean' },
        tasteProfileChanges: {
          type: 'array',
          items: { type: 'string' },
        },
        thankYouMessage: { type: 'string' },
      },
      required: ['feedbackId', 'profileUpdated', 'thankYouMessage'],
    },
  },

  // ── 5. Get Taste Profile ──────────────────────────────────────────
  {
    name: 'menami_get_taste_profile',
    description:
      'View your food preference profile built from your ratings, orders, and feedback. ' +
      'Shows cuisine preferences, dietary restrictions, favorite restaurants, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        detailed: {
          type: 'boolean',
          description: 'Return detailed breakdown including individual dish preferences',
          default: false,
        },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        cuisinePreferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cuisine: { type: 'string' },
              score: { type: 'number' },
              visitCount: { type: 'number' },
              avgRating: { type: 'number' },
            },
          },
        },
        dietaryRestrictions: {
          type: 'array',
          items: { type: 'string' },
        },
        favoriteRestaurants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              visitCount: { type: 'number' },
            },
          },
        },
        pricePreference: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
            currency: { type: 'string' },
          },
        },
        spiceLevel: { type: 'number' },
        adventurousness: { type: 'number' },
        topDishes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              cuisine: { type: 'string' },
              rating: { type: 'number' },
            },
          },
        },
        lastUpdated: { type: 'string' },
      },
      required: ['cuisinePreferences', 'dietaryRestrictions', 'favoriteRestaurants', 'pricePreference', 'adventurousness', 'topDishes', 'lastUpdated'],
    },
  },

  // ── 6. Get Restaurant ─────────────────────────────────────────────
  {
    name: 'menami_get_restaurant',
    description:
      'Get detailed information about a specific restaurant including menu, ' +
      'hours, reviews, and location.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'Restaurant identifier',
        },
        slug: {
          type: 'string',
          description: 'Restaurant URL slug (alternative to restaurantId)',
        },
        includeMenu: {
          type: 'boolean',
          description: 'Include full menu in response',
          default: false,
        },
        includeReviews: {
          type: 'boolean',
          description: 'Include recent reviews in response',
          default: false,
        },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' },
        cuisine: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        website: { type: 'string' },
        rating: { type: 'number' },
        reviewCount: { type: 'number' },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
            currency: { type: 'string' },
          },
        },
        hours: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string' },
              open: { type: 'string' },
              close: { type: 'string' },
            },
          },
        },
        features: {
          type: 'array',
          items: { type: 'string' },
        },
        menu: { type: 'array' },
        reviews: { type: 'array' },
        location: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
      },
      required: ['id', 'name', 'slug', 'cuisine', 'address', 'phone', 'rating', 'reviewCount', 'priceRange', 'hours', 'features', 'location'],
    },
  },

  // ── 7. Manage Occasions ───────────────────────────────────────────
  {
    name: 'menami_manage_occasions',
    description:
      'Set up special occasions (birthdays, anniversaries, trips) and get ' +
      'proactive restaurant recommendations when they approach.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'create', 'update', 'delete'],
          description: 'Action to perform',
        },
        occasion: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['birthday', 'anniversary', 'business', 'date_night', 'trip', 'custom'],
            },
            name: { type: 'string' },
            date: { type: 'string' },
            partySize: { type: 'number' },
            budget: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string' },
              },
            },
            preferences: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
            },
            city: { type: 'string' },
            reminderDaysBefore: { type: 'number' },
          },
          required: ['type', 'name', 'date'],
          description: 'Occasion details (required for create)',
        },
        occasionId: {
          type: 'string',
          description: 'Occasion ID (required for update/delete)',
        },
        updates: {
          type: 'object',
          description: 'Fields to update (required for update)',
        },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        occasions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              name: { type: 'string' },
              date: { type: 'string' },
              partySize: { type: 'number' },
              budget: { type: 'object' },
              preferences: { type: 'string' },
              location: { type: 'object' },
              city: { type: 'string' },
              reminderDaysBefore: { type: 'number' },
            },
          },
        },
        message: { type: 'string' },
      },
      required: ['occasions', 'message'],
    },
  },
];
