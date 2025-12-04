import nock from "nock";
import { IikoClient } from "./client.js";
import { IikoApiError, IikoAuthError, IikoRateLimitError } from "./errors.js";

const BASE_URL = "https://api-ru.iiko.services";
const TEST_API_KEY = "test-api-key-12345";
const TEST_TOKEN = "test-access-token-67890";

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
      const client = new IikoClient(TEST_API_KEY);
      expect(client).toBeInstanceOf(IikoClient);
    });

    it("should throw error when API key is empty", () => {
      expect(() => new IikoClient("")).toThrow("API key is required");
    });

    it("should throw error when API key is whitespace only", () => {
      expect(() => new IikoClient("   ")).toThrow("API key is required");
    });

    it("should accept custom base URL", () => {
      const client = new IikoClient(TEST_API_KEY, {
        baseUrl: "https://custom-api.example.com",
      });
      expect(client).toBeInstanceOf(IikoClient);
    });

    it("should accept custom timeout", () => {
      const client = new IikoClient(TEST_API_KEY, {
        timeout: 60000,
      });
      expect(client).toBeInstanceOf(IikoClient);
    });
  });

  describe("authentication", () => {
    it("should authenticate successfully and store token", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token", { apiLogin: TEST_API_KEY })
        .reply(200, TEST_TOKEN);

      const client = new IikoClient(TEST_API_KEY);

      expect(client.isAuthenticated()).toBe(false);

      const result = await client.authenticate();

      expect(result.token).toBe(TEST_TOKEN);
      expect(client.isAuthenticated()).toBe(true);
      expect(client.getAccessToken()).toBe(TEST_TOKEN);
    });

    it("should throw IikoAuthError on 401 response", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(401, { message: "Invalid API key" });

      const client = new IikoClient(TEST_API_KEY);

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

      const client = new IikoClient(TEST_API_KEY);

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

      const client = new IikoClient(TEST_API_KEY);

      await expect(client.authenticate()).rejects.toThrow(IikoApiError);
    });
  });

  describe("isAuthenticated", () => {
    it("should return false before authentication", () => {
      const client = new IikoClient(TEST_API_KEY);
      expect(client.isAuthenticated()).toBe(false);
    });

    it("should return true after successful authentication", async () => {
      nock(BASE_URL).post("/api/1/access_token").reply(200, TEST_TOKEN);

      const client = new IikoClient(TEST_API_KEY);
      await client.authenticate();

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe("getAccessToken", () => {
    it("should return null before authentication", () => {
      const client = new IikoClient(TEST_API_KEY);
      expect(client.getAccessToken()).toBeNull();
    });

    it("should return token after authentication", async () => {
      nock(BASE_URL).post("/api/1/access_token").reply(200, TEST_TOKEN);

      const client = new IikoClient(TEST_API_KEY);
      await client.authenticate();

      expect(client.getAccessToken()).toBe(TEST_TOKEN);
    });
  });
});
