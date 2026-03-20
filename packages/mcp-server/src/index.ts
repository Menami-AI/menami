// ── Menami MCP Server — Entry Point ───────────────────────────────────
// Exports tools, types, and the OAuth connect function.

export { tools } from './tools';
export { connect, loadConfig, clearConfig } from './auth';
export type {
  // Common
  LatLng,
  PriceRange,
  TimeSlot,
  ToolDefinition,

  // Consult Agent
  ConsultAgentInput,
  ConsultAgentOutput,
  RestaurantRecommendation,

  // Book Table
  BookTableInput,
  BookTableOutput,

  // Place Order
  OrderItem,
  PlaceOrderInput,
  PlaceOrderOutput,

  // Submit Feedback
  SubmitFeedbackInput,
  SubmitFeedbackOutput,

  // Taste Profile
  GetTasteProfileInput,
  GetTasteProfileOutput,
  CuisinePreference,

  // Get Restaurant
  GetRestaurantInput,
  GetRestaurantOutput,
  MenuItem,
  RestaurantReview,

  // Manage Occasions
  Occasion,
  ManageOccasionsInput,
  ManageOccasionsOutput,
} from './types';
