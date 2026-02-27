/**
 * Integration tests: error handling with real API and mocked error responses.
 *
 * Run with: IIKO_API_KEY=your-key npm run test:integration
 */

import "dotenv/config";
import nock from "nock";
import {
  IikoClient,
  IikoApiError,
  IikoAuthError,
  IikoRateLimitError,
} from "../../index.js";

const API_KEY = process.env.IIKO_API_KEY;
const BASE_URL = process.env.IIKO_BASE_URL ?? "https://api-ru.iiko.services";

const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration("Error Handling", () => {
  describe("real API errors", () => {
    it("throws IikoAuthError on invalid API key (401)", async () => {
      const client = new IikoClient("invalid-api-key-12345", {
        baseUrl: BASE_URL,
      });

      const error = await client.getOrganizations().catch((e) => e);

      expect(error).toBeInstanceOf(IikoAuthError);
      expect((error as IikoAuthError).message).toBeDefined();
      expect((error as IikoAuthError).response).toBeDefined();
    });

    it("throws IikoApiError on bad request (400)", async () => {
      const client = new IikoClient(API_KEY!, { baseUrl: BASE_URL });
      await client.getOrganizations();

      const error = await client
        .getNomenclature({
          organizationId: "not-a-valid-uuid",
          startRevision: 0,
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(IikoApiError);
      expect((error as IikoApiError).statusCode).toBe(400);
    });

    it("handles non-existent organization (may return empty or error)", async () => {
      const client = new IikoClient(API_KEY!, { baseUrl: BASE_URL });
      await client.getOrganizations();

      const fakeOrgId = "00000000-0000-0000-0000-000000000000";

      const result = await client
        .getMenu({ organizationIds: [fakeOrgId] })
        .catch((e) => e);

      // API may return 200 with empty data or 4xx error
      if (result instanceof Error) {
        expect(result).toBeInstanceOf(IikoApiError);
        expect((result as IikoApiError).statusCode).toBeGreaterThanOrEqual(400);
      } else {
        expect(result.correlationId).toBeDefined();
        expect(Array.isArray(result.externalMenus)).toBe(true);
      }
    });
  });

  describe("mocked error responses", () => {
    beforeAll(() => {
      nock.disableNetConnect();
    });

    afterAll(() => {
      nock.enableNetConnect();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it("throws IikoRateLimitError on 429", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, { correlationId: "x", token: "mock-token" });
      nock(BASE_URL)
        .post("/api/1/organizations", {})
        .reply(429, { message: "Rate limit exceeded" }, { "retry-after": "60" });

      const client = new IikoClient("any-key", { baseUrl: BASE_URL });

      const error = await client.getOrganizations().catch((e) => e);
      expect(error).toBeInstanceOf(IikoRateLimitError);
      expect((error as IikoRateLimitError).retryAfter).toBe(60);
    });

    it("throws IikoApiError on 500", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, { correlationId: "x", token: "mock-token" });
      nock(BASE_URL)
        .post("/api/1/organizations", {})
        .reply(500, { message: "Internal server error" });

      const client = new IikoClient("any-key", { baseUrl: BASE_URL });

      try {
        await client.getOrganizations();
      } catch (error) {
        expect(error).toBeInstanceOf(IikoApiError);
        expect((error as IikoApiError).statusCode).toBe(500);
      }
    });

    it("IikoApiError exposes errorCode and url", async () => {
      nock(BASE_URL)
        .post("/api/1/access_token")
        .reply(200, { correlationId: "x", token: "mock-token" });
      nock(BASE_URL)
        .post("/api/1/organizations", {})
        .reply(400, {
          message: "Bad request",
          errorCode: "VALIDATION_ERROR",
        });

      const client = new IikoClient("any-key", { baseUrl: BASE_URL });

      try {
        await client.getOrganizations();
      } catch (error) {
        expect(error).toBeInstanceOf(IikoApiError);
        expect((error as IikoApiError).errorCode).toBe("VALIDATION_ERROR");
        expect((error as IikoApiError).url).toBeDefined();
      }
    });
  });
});
