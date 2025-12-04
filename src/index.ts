// Main client
export { IikoClient } from "./client.js";

// Types
export type {
  ApiErrorResponse,
  AuthResponse,
  IikoClientOptions,
} from "./types/index.js";

// Errors
export { IikoApiError, IikoAuthError, IikoRateLimitError } from "./errors.js";
