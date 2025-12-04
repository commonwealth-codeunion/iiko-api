import type { ApiErrorResponse } from "./types/index.js";

/**
 * Custom error class for iiko API errors
 */
export class IikoApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly statusCode: number;

  /**
   * Error code from the API
   */
  public readonly errorCode: string | undefined;

  /**
   * Original API response data
   */
  public readonly response: ApiErrorResponse | undefined;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    response?: ApiErrorResponse
  ) {
    super(message);
    this.name = "IikoApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IikoApiError);
    }
  }
}

/**
 * Error thrown when authentication fails
 */
export class IikoAuthError extends IikoApiError {
  constructor(message: string, response?: ApiErrorResponse) {
    super(message, 401, "AUTH_ERROR", response);
    this.name = "IikoAuthError";
  }
}

/**
 * Error thrown when the API rate limit is exceeded
 */
export class IikoRateLimitError extends IikoApiError {
  /**
   * Time in seconds until the rate limit resets
   */
  public readonly retryAfter: number | undefined;

  constructor(
    message: string,
    retryAfter?: number,
    response?: ApiErrorResponse
  ) {
    super(message, 429, "RATE_LIMIT", response);
    this.name = "IikoRateLimitError";
    this.retryAfter = retryAfter;
  }
}
