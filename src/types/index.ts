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

// ============================================================================
// Organizations API
// ============================================================================

/**
 * Request parameters for getting organizations
 */
export interface GetOrganizationsRequest {
  /**
   * List of organization IDs to filter by
   * If not specified, all available organizations are returned
   */
  organizationIds?: string[];

  /**
   * Whether to return additional info (address, geo coordinates, etc.)
   * @default false
   */
  returnAdditionalInfo?: boolean;

  /**
   * Whether to include disabled organizations
   * @default false
   */
  includeDisabled?: boolean;
}

/**
 * Organization entity from iiko API
 */
export interface Organization {
  /**
   * Organization ID (UUID)
   */
  id: string;

  /**
   * Organization name
   */
  name: string;

  /**
   * Country code
   */
  country?: string;

  /**
   * Restaurant address (only if returnAdditionalInfo is true)
   */
  restaurantAddress?: string;

  /**
   * Latitude coordinate (only if returnAdditionalInfo is true)
   */
  latitude?: number;

  /**
   * Longitude coordinate (only if returnAdditionalInfo is true)
   */
  longitude?: number;

  /**
   * Whether the organization uses UTC timezone
   */
  useUTCOffset?: boolean;

  /**
   * UTC offset in minutes
   */
  utcOffset?: number;

  /**
   * Currency ISO code
   */
  currencyIsoName?: string;

  /**
   * Currency minimum denomination
   */
  currencyMinimumDenomination?: number;

  /**
   * Whether the organization is disabled
   */
  isDisabled?: boolean;
}

/**
 * Response from the organizations endpoint
 */
export interface GetOrganizationsResponse {
  /**
   * Correlation ID for request tracing
   */
  correlationId: string;

  /**
   * List of organizations
   */
  organizations: Organization[];
}
