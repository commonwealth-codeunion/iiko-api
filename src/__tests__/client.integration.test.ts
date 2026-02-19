/**
 * Integration tests for IikoClient
 *
 * These tests run against the real iiko API.
 * Skip if IIKO_API_KEY environment variable is not set.
 *
 * Run with: IIKO_API_KEY=your-key npm run test:integration
 * Or create a .env file with IIKO_API_KEY=your-key
 */

import "dotenv/config";
import { IikoClient } from "../client.js";

const API_KEY = process.env.IIKO_API_KEY;
const BASE_URL = process.env.IIKO_BASE_URL ?? "https://api-ru.iiko.services";

const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration("IikoClient Integration Tests", () => {
  let client: IikoClient;

  beforeAll(() => {
    client = new IikoClient(API_KEY!, {
      baseUrl: BASE_URL,
    });
  });

  describe("authentication", () => {
    it("should request and cache token on first API call", async () => {
      const result = await client.getOrganizations();

      expect(result.correlationId).toBeDefined();
      expect(client.isAuthenticated).toBe(true);
      expect(client.getAccessToken()).toBeDefined();
      expect(typeof client.getAccessToken()).toBe("string");
      expect(client.getAccessToken()!.length).toBeGreaterThan(0);
    });
  });

  describe("organizations", () => {
    it("should fetch organizations from real API", async () => {
      const result = await client.getOrganizations();

      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.organizations)).toBe(true);
    });

    it("should fetch organizations with additional info", async () => {
      const result = await client.getOrganizations({
        returnAdditionalInfo: true,
      });

      expect(result.organizations).toBeDefined();

      // If there are organizations, check for additional fields
      if (result.organizations.length > 0) {
        const org = result.organizations[0];
        expect(org?.id).toBeDefined();
        expect(org?.name).toBeDefined();
      }
    });
  });
});
