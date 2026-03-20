// ── Menami MCP Server — Type Definitions ──────────────────────────────
// Standalone types for the MCP tool schemas. These mirror the API types
// so the package has zero runtime dependency on the main Busboy codebase.

// ── Common ────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface TimeSlot {
  date: string;       // ISO 8601 date (YYYY-MM-DD)
  time: string;       // HH:mm (24h)
  partySize: number;
}

// ── Consult Agent ─────────────────────────────────────────────────────

export interface ConsultAgentInput {
  query: string;
  location?: LatLng;
  cuisine?: string;
  priceRange?: PriceRange;
  dietaryRestrictions?: string[];
  occasion?: string;
  partySize?: number;
}

export interface RestaurantRecommendation {
  restaurantId: string;
  name: string;
  cuisine: string;
  priceRange: PriceRange;
  rating: number;
  matchScore: number;
  matchReason: string;
  address: string;
  distance?: number;
  availableSlots?: TimeSlot[];
}

export interface ConsultAgentOutput {
  recommendations: RestaurantRecommendation[];
  explanation: string;
  followUpQuestions?: string[];
}

// ── Book Table ────────────────────────────────────────────────────────

export interface BookTableInput {
  restaurantId: string;
  date: string;        // ISO 8601 date
  time: string;        // HH:mm
  partySize: number;
  specialRequests?: string;
  occasion?: string;
}

export interface BookTableOutput {
  reservationId: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  confirmationCode: string;
  status: 'confirmed' | 'pending' | 'waitlisted';
  cancellationPolicy?: string;
}

// ── Place Order ───────────────────────────────────────────────────────

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
  modifiers?: string[];
}

export interface PlaceOrderInput {
  restaurantId: string;
  items: OrderItem[];
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  scheduledTime?: string;
  paymentMethodId?: string;
  tip?: number;
}

export interface PlaceOrderOutput {
  orderId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee?: number;
  tax: number;
  tip: number;
  total: number;
  estimatedTime: string;
  status: 'placed' | 'confirmed' | 'preparing';
  trackingUrl?: string;
}

// ── Submit Feedback ───────────────────────────────────────────────────

export interface SubmitFeedbackInput {
  restaurantId: string;
  orderId?: string;
  reservationId?: string;
  rating: number;          // 1-5
  foodRating?: number;     // 1-5
  serviceRating?: number;  // 1-5
  ambienceRating?: number; // 1-5
  comment?: string;
  dishes?: Array<{
    name: string;
    rating: number;
    comment?: string;
  }>;
}

export interface SubmitFeedbackOutput {
  feedbackId: string;
  profileUpdated: boolean;
  tasteProfileChanges?: string[];
  thankYouMessage: string;
}

// ── Get Taste Profile ─────────────────────────────────────────────────

export interface GetTasteProfileInput {
  detailed?: boolean;
}

export interface CuisinePreference {
  cuisine: string;
  score: number;        // 0-1
  visitCount: number;
  avgRating: number;
}

export interface GetTasteProfileOutput {
  cuisinePreferences: CuisinePreference[];
  dietaryRestrictions: string[];
  favoriteRestaurants: Array<{ id: string; name: string; visitCount: number }>;
  pricePreference: PriceRange;
  spiceLevel?: number;   // 1-5
  adventurousness: number; // 0-1 (0=stick to favorites, 1=always try new)
  topDishes: Array<{ name: string; cuisine: string; rating: number }>;
  lastUpdated: string;
}

// ── Get Restaurant ────────────────────────────────────────────────────

export interface GetRestaurantInput {
  restaurantId?: string;
  slug?: string;
  includeMenu?: boolean;
  includeReviews?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  dietaryTags: string[];
  popular: boolean;
  imageUrl?: string;
}

export interface RestaurantReview {
  rating: number;
  comment: string;
  date: string;
  authorName: string;
}

export interface GetRestaurantOutput {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  address: string;
  phone: string;
  website?: string;
  rating: number;
  reviewCount: number;
  priceRange: PriceRange;
  hours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  features: string[];
  menu?: MenuItem[];
  reviews?: RestaurantReview[];
  location: LatLng;
}

// ── Manage Occasions ──────────────────────────────────────────────────

export interface Occasion {
  id: string;
  type: 'birthday' | 'anniversary' | 'business' | 'date_night' | 'trip' | 'custom';
  name: string;
  date: string;
  partySize?: number;
  budget?: PriceRange;
  preferences?: string;
  location?: LatLng;
  city?: string;
  reminderDaysBefore?: number;
}

export interface ManageOccasionsInput {
  action: 'list' | 'create' | 'update' | 'delete';
  occasion?: Omit<Occasion, 'id'>;
  occasionId?: string;
  updates?: Partial<Omit<Occasion, 'id'>>;
}

export interface ManageOccasionsOutput {
  occasions: Occasion[];
  message: string;
}

// ── Tool Definition ───────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}
