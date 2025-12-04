import axios, { type AxiosError, type AxiosInstance } from "axios";
import { IikoApiError, IikoAuthError, IikoRateLimitError } from "./errors.js";
import type {
  ApiErrorResponse,
  AuthResponse,
  GetOrganizationsRequest,
  GetOrganizationsResponse,
  IikoClientOptions,
} from "./types/index.js";

/**
 * Default configuration values
 */
const DEFAULT_BASE_URL = "https://api-ru.iiko.services";
const DEFAULT_TIMEOUT = 30000;

/**
 * iiko API Client
 *
 * A TypeScript wrapper for the iiko API that handles authentication
 * and provides typed methods for API endpoints.
 *
 * @example
 * ```typescript
 * const client = new IikoClient("your-api-key");
 * await client.authenticate();
 * // Now you can use other API methods
 * ```
 */
export class IikoClient {
  private readonly apiKey: string;
  private readonly httpClient: AxiosInstance;
  private accessToken: string | null = null;

  /**
   * Creates a new IikoClient instance
   *
   * @param apiKey - Your iiko API key
   * @param options - Optional configuration options
   */
  constructor(apiKey: string, options: IikoClientOptions = {}) {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key is required");
    }

    this.apiKey = apiKey;

    this.httpClient = axios.create({
      baseURL: options.baseUrl ?? DEFAULT_BASE_URL,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => this.handleError(error)
    );
  }

  /**
   * Authenticate with the iiko API and obtain an access token
   *
   * @returns The authentication response containing the token
   * @throws {IikoAuthError} If authentication fails
   */
  public async authenticate(): Promise<AuthResponse> {
    const response = await this.httpClient.post<string>("/api/1/access_token", {
      apiLogin: this.apiKey,
    });

    // iiko API returns the token as a plain string
    this.accessToken = response.data;

    return { token: this.accessToken };
  }

  /**
   * Check if the client is currently authenticated
   *
   * @returns True if an access token is available
   */
  public isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Get the current access token
   *
   * @returns The current access token or null if not authenticated
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Make an authenticated GET request to the API
   *
   * @param endpoint - The API endpoint path
   * @returns The response data
   */
  protected async get<T>(endpoint: string): Promise<T> {
    this.ensureAuthenticated();
    const response = await this.httpClient.get<T>(endpoint, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Make an authenticated POST request to the API
   *
   * @param endpoint - The API endpoint path
   * @param data - The request body
   * @returns The response data
   */
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    this.ensureAuthenticated();
    const response = await this.httpClient.post<T>(endpoint, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Ensure the client is authenticated before making API calls
   *
   * @throws {IikoAuthError} If not authenticated
   */
  private ensureAuthenticated(): void {
    if (!this.accessToken) {
      throw new IikoAuthError("Not authenticated. Call authenticate() first.");
    }
  }

  /**
   * Get authorization headers for authenticated requests
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  // ==========================================================================
  // Organizations API
  // ==========================================================================

  /**
   * Get list of organizations available for the API key
   *
   * @param request - Optional request parameters
   * @returns List of organizations
   *
   * @example
   * ```typescript
   * // Get all organizations
   * const { organizations } = await client.getOrganizations();
   *
   * // Get specific organizations with additional info
   * const { organizations } = await client.getOrganizations({
   *   organizationIds: ['uuid-1', 'uuid-2'],
   *   returnAdditionalInfo: true,
   * });
   * ```
   */
  public async getOrganizations(
    request: GetOrganizationsRequest = {}
  ): Promise<GetOrganizationsResponse> {
    return this.post<GetOrganizationsResponse>("/api/1/organizations", request);
  }

  /**
   * Handle API errors and convert them to typed errors
   */
  private handleError(error: AxiosError<ApiErrorResponse>): never {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message =
      data?.message ?? error.message ?? "An unknown error occurred";

    if (status === 401) {
      throw new IikoAuthError(message, data);
    }

    if (status === 429) {
      const retryAfter = error.response?.headers["retry-after"];
      throw new IikoRateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        data
      );
    }

    throw new IikoApiError(message, status, data?.errorCode, data);
  }
}
