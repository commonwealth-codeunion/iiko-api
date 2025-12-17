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
    it("should authenticate with real API key", async () => {
      const result = await client.authenticate();

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.correlationId).toBeDefined();
      expect(typeof result.correlationId).toBe("string");
      expect(client.isAuthenticated).toBe(true);
    });
  });

  describe("organizations", () => {
    beforeAll(async () => {
      if (!client.isAuthenticated) {
        await client.authenticate();
      }
    });

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

  describe("menu", () => {
    let organizationId: string;

    beforeAll(async () => {
      if (!client.isAuthenticated) {
        await client.authenticate();
      }

      // Get an organization ID to use for menu requests
      const orgsResult = await client.getOrganizations();
      if (orgsResult.organizations.length > 0) {
        organizationId = orgsResult.organizations[0]!.id;
      }
    });

    it("should fetch menus from real API", async () => {
      if (!organizationId) {
        console.log("Skipping menu test: no organizations available");
        return;
      }

      const result = await client.getMenu({
        organizationIds: [organizationId],
      });

      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.externalMenus)).toBe(true);
      expect(Array.isArray(result.priceCategories)).toBe(true);

      // Log for visibility
      if (result.externalMenus.length > 0) {
        console.log(
          `Fetched ${result.externalMenus.length} menu(s) from real API.`
        );
      }
    });

    it("should fetch menu by ID from real API", async () => {
      if (!organizationId) {
        console.log("Skipping menu by ID test: no organizations available");
        return;
      }

      // First get the list of menus to find a valid menu ID
      const menusResult = await client.getMenu({
        organizationIds: [organizationId],
      });

      if (menusResult.externalMenus.length === 0) {
        console.log("Skipping menu by ID test: no menus available");
        return;
      }

      const menuId = menusResult.externalMenus[0]!.id;

      const result = await client.getMenuById({
        externalMenuId: menuId,
        organizationIds: [organizationId],
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(Array.isArray(result.itemCategories)).toBe(true);
      expect(Array.isArray(result.productCategories)).toBe(true);

      // Log for visibility
      const totalItems = result.itemCategories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
      );
      console.log(
        `Fetched menu "${result.name}" with ${result.itemCategories.length} categories and ${totalItems} items.`
      );
    });
  });
});
