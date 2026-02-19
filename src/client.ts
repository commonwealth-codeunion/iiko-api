import axios, { type AxiosError, type AxiosInstance } from "axios";
import { IikoApiError, IikoAuthError, IikoRateLimitError } from "./errors.js";
import type {
  ApiErrorResponse,
  AuthResponse,
  GetMenuByIdRequest,
  GetMenuByIdResponse,
  GetMenuRequest,
  GetMenuResponse,
  GetOrganizationsRequest,
  GetOrganizationsResponse,
  GetTerminalGroupsRequest,
  GetTerminalGroupsResponse,
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
 * // Token is requested and cached on first get/post
 * const { organizations } = await client.getOrganizations();
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
      (error: AxiosError<ApiErrorResponse>) => this.handleError(error),
    );
  }

  /**
   * Request access token from the iiko API and cache it
   *
   * @returns The authentication response containing the token
   * @throws {IikoAuthError} If authentication fails
   */
  private async authenticate(): Promise<AuthResponse> {
    const response = await this.httpClient.post<AuthResponse>(
      "/api/1/access_token",
      {
        apiLogin: this.apiKey,
      },
    );

    this.accessToken = response.data.token;

    return response.data;
  }

  /**
   * Check if the client is currently authenticated
   *
   * @returns True if an access token is available
   */
  public get isAuthenticated(): boolean {
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
   * Make an authenticated GET request to the API.
   * On 401, refreshes the token once and retries; if it fails again, throws.
   *
   * @param endpoint - The API endpoint path
   * @returns The response data
   */
  protected async get<T>(endpoint: string): Promise<T> {
    await this.ensureTokenCached();
    return this.executeWithAuthRetry(async () => {
      const response = await this.httpClient.get<T>(endpoint, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    });
  }

  /**
   * Make an authenticated POST request to the API.
   * On 401, refreshes the token once and retries; if it fails again, throws.
   *
   * @param endpoint - The API endpoint path
   * @param data - The request body
   * @returns The response data
   */
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    await this.ensureTokenCached();
    return this.executeWithAuthRetry(async () => {
      const response = await this.httpClient.post<T>(endpoint, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    });
  }

  /**
   * Executes a request; on IikoAuthError, re-authenticates once and retries.
   * If the retry also fails with auth error, the error is rethrown.
   */
  private async executeWithAuthRetry<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof IikoAuthError)) {
        throw error;
      }
      await this.authenticate();
      return await request();
    }
  }

  /**
   * Ensure access token is present; request and cache it if missing
   */
  private async ensureTokenCached(): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
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

  /**
   * Handle API errors and convert them to typed errors
   */
  private handleError(error: AxiosError<ApiErrorResponse>): never {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message =
      data?.message ?? error.message ?? "An unknown error occurred";
    const url = error.config?.url;

    if (status === 401) {
      throw new IikoAuthError(message, data, url);
    }

    if (status === 429) {
      const retryAfter = error.response?.headers["retry-after"];
      throw new IikoRateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        data,
        url,
      );
    }

    throw new IikoApiError(message, status, data?.errorCode, data, url);
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
    request: GetOrganizationsRequest = {},
  ): Promise<GetOrganizationsResponse> {
    return this.post<GetOrganizationsResponse>("/api/1/organizations", request);
  }

  // ==========================================================================
  // Menu API
  // ==========================================================================

  /**
   * Get list of external menus for organizations
   *
   * @param request - Request parameters with organization IDs
   * @returns List of external menus and price categories
   *
   * @example
   * ```typescript
   * const { externalMenus } = await client.getMenu({
   *   organizationIds: ['9b87a04a-5e2d-43d0-9206-ccac3ecd59b0'],
   * });
   * ```
   */
  public async getMenu(request: GetMenuRequest): Promise<GetMenuResponse> {
    return this.post<GetMenuResponse>("/api/2/menu", request);
  }

  /**
   * Get detailed menu information by ID
   *
   * @param request - Request parameters with external menu ID and organization IDs
   * @returns Detailed menu with categories, items, prices, and nutritional information
   *
   * @example
   * ```typescript
   * const menu = await client.getMenuById({
   *   externalMenuId: '67964',
   *   organizationIds: ['9b87a04a-5e2d-43d0-9206-ccac3ecd59b0'],
   * });
   *
   * // Access menu categories and items
   * menu.itemCategories.forEach(category => {
   *   console.log(category.name, category.items.length);
   * });
   * ```
   */
  public async getMenuById(
    request: GetMenuByIdRequest
  ): Promise<GetMenuByIdResponse> {
    return this.post<GetMenuByIdResponse>("/api/2/menu/by_id", request);
  }

  /**
   * Get terminal groups for the given organizations
   *
   * @param request - Request with organization IDs (required) and optional filters
   * @returns Terminal groups and terminal groups in sleep
   */
  public async getTerminalGroups(
    request: GetTerminalGroupsRequest,
  ): Promise<GetTerminalGroupsResponse> {
    return this.post<GetTerminalGroupsResponse>(
      "/api/1/terminal_groups",
      request,
    );
  }
}
