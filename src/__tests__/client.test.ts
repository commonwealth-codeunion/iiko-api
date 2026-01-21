import nock from "nock";
import { IikoClient } from "../client.js";
import { IikoApiError, IikoAuthError, IikoRateLimitError } from "../errors.js";

const BASE_URL = process.env.IIKO_BASE_URL ?? "https://api-ru.iiko.services";
const MOCK_API_KEY = "mock-api-key-12345";
const MOCK_ACCESS_TOKEN = "mock-access-token-67890";
const MOCK_CORRELATION_ID = "mock-correlation-id-12345";

describe("IikoClient", () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("constructor", () => {
    it("should create a client instance with valid API key", () => {
      const client = new IikoClient(MOCK_API_KEY);
      expect(client).toBeInstanceOf(IikoClient);
    });

    it("should throw error when API key is empty", () => {
      expect(() => new IikoClient("")).toThrow("API key is required");
    });

    it("should throw error when API key is whitespace only", () => {
      expect(() => new IikoClient("   ")).toThrow("API key is required");
    });

    it("should accept custom base URL", () => {
      const client = new IikoClient(MOCK_API_KEY, {
        baseUrl: "https://custom-api.example.com",
      });
      expect(client).toBeInstanceOf(IikoClient);
    });

    it("should accept custom timeout", () => {
      const client = new IikoClient(MOCK_API_KEY, {
        timeout: 60000,
      });
      expect(client).toBeInstanceOf(IikoClient);
    });
  });

  describe("authentication", () => {
    it("should authenticate successfully and store token", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token", { apiLogin: MOCK_API_KEY })
        .reply(200, {
          correlationId: MOCK_CORRELATION_ID,
          token: MOCK_ACCESS_TOKEN,
        });

      const client = new IikoClient(MOCK_API_KEY);

      expect(client.isAuthenticated).toBe(false);

      const result = await client.authenticate();

      expect(result.token).toBe(MOCK_ACCESS_TOKEN);
      expect(result.correlationId).toBe(MOCK_CORRELATION_ID);
      expect(client.isAuthenticated).toBe(true);
      expect(client.getAccessToken()).toBe(MOCK_ACCESS_TOKEN);
    });

    it("should throw IikoAuthError on 401 response", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(401, { message: "Invalid API key" });

      const client = new IikoClient(MOCK_API_KEY);

      await expect(client.authenticate()).rejects.toThrow(IikoAuthError);
    });

    it("should throw IikoRateLimitError on 429 response", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(
          429,
          { message: "Rate limit exceeded" },
          { "retry-after": "60" }
        );

      const client = new IikoClient(MOCK_API_KEY);

      try {
        await client.authenticate();
        fail("Expected IikoRateLimitError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(IikoRateLimitError);
        expect((error as IikoRateLimitError).retryAfter).toBe(60);
      }
    });

    it("should throw IikoApiError on other errors", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(500, { message: "Internal server error" });

      const client = new IikoClient(MOCK_API_KEY);

      await expect(client.authenticate()).rejects.toThrow(IikoApiError);
    });
  });

  describe("isAuthenticated", () => {
    it("should return false before authentication", () => {
      const client = new IikoClient(MOCK_API_KEY);
      expect(client.isAuthenticated).toBe(false);
    });

    it("should return true after successful authentication", async () => {
      nock(BASE_URL).post("/api/1/access_token").reply(200, MOCK_ACCESS_TOKEN);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      expect(client.isAuthenticated).toBe(true);
    });
  });

  describe("getAccessToken", () => {
    it("should return null before authentication", () => {
      const client = new IikoClient(MOCK_API_KEY);
      expect(client.getAccessToken()).toBeNull();
    });

    it("should return token after authentication", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, {
          correlationId: MOCK_CORRELATION_ID,
          token: MOCK_ACCESS_TOKEN,
        });

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      expect(client.getAccessToken()).toBe(MOCK_ACCESS_TOKEN);
    });
  });

  describe("getOrganizations", () => {
    it("should throw if not authenticated", async () => {
      const client = new IikoClient(MOCK_API_KEY);

      await expect(client.getOrganizations()).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("should fetch organizations successfully", async () => {
      const mockResponse = {
        correlationId: "test-correlation-id",
        organizations: [
          { id: "org-1", name: "Restaurant 1" },
          { id: "org-2", name: "Restaurant 2" },
        ],
      };

      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, {
          correlationId: MOCK_CORRELATION_ID,
          token: MOCK_ACCESS_TOKEN,
        });

      nock(BASE_URL)
        .post("/api/1/organizations", {})
        .matchHeader("Authorization", `Bearer ${MOCK_ACCESS_TOKEN}`)
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getOrganizations();

      expect(result.correlationId).toBe("test-correlation-id");
      expect(result.organizations).toHaveLength(2);
      expect(result.organizations[0]?.name).toBe("Restaurant 1");
    });

    it("should pass request parameters", async () => {
      const mockResponse = {
        correlationId: "test-id",
        organizations: [{ id: "org-1", name: "Test Org" }],
      };

      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, {
          correlationId: MOCK_CORRELATION_ID,
          token: MOCK_ACCESS_TOKEN,
        });

      nock(BASE_URL)
        .post("/api/1/organizations", {
          organizationIds: ["org-1"],
          returnAdditionalInfo: true,
          includeDisabled: false,
        })
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getOrganizations({
        organizationIds: ["org-1"],
        returnAdditionalInfo: true,
        includeDisabled: false,
      });

      expect(result.organizations).toHaveLength(1);
    });
  });
});
