/**
 * Configuration options for the IikoClient
 */
export interface IikoClientOptions {
  /**
   * Base URL for the iiko API
   * @default "https://api-ru.iiko.services"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Authentication response from iiko API
 */
export interface AuthResponse {
  /**
   * Correlation ID for the request
   */
  correlationId: string;

  /**
   * JWT access token
   */
  token: string;
}

/**
 * Base API error response structure
 */
export interface ApiErrorResponse {
  /**
   * Error code
   */
  errorCode?: string;

  /**
   * Error message
   */
  message?: string;

  /**
   * Additional error details
   */
  details?: unknown;
}
