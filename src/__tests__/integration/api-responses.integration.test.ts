/**
 * Integration tests: validate real API responses against TypeScript interfaces.
 *
 * Run with: IIKO_API_KEY=your-key npm run test:integration
 */

import "dotenv/config";
import { IikoClient } from "../../client.js";
import {
  validateGetOrganizationsResponse,
  validateGetMenuResponse,
  validateGetMenuByIdResponse,
  validateGetNomenclatureResponse,
  validateGetTerminalGroupsResponse,
} from "./response-validators.js";

const API_KEY = process.env.IIKO_API_KEY;
const BASE_URL = process.env.IIKO_BASE_URL ?? "https://api-ru.iiko.services";

const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration("API Response Validation (real API)", () => {
  let client: IikoClient;
  let organizationId: string;

  beforeAll(async () => {
    client = new IikoClient(API_KEY!, { baseUrl: BASE_URL });
    const orgs = await client.getOrganizations();
    if (orgs.organizations.length === 0) {
      throw new Error("No organizations available for tests");
    }
    organizationId = orgs.organizations[0]!.id;
  });

  describe("getOrganizations", () => {
    it("response matches GetOrganizationsResponse interface", async () => {
      const result = await client.getOrganizations();
      expect(() => validateGetOrganizationsResponse(result)).not.toThrow();
      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.organizations)).toBe(true);
    });

    it("response with returnAdditionalInfo matches interface", async () => {
      const result = await client.getOrganizations({
        returnAdditionalInfo: true,
      });
      expect(() => validateGetOrganizationsResponse(result)).not.toThrow();
    });
  });

  describe("getMenu", () => {
    it("response matches GetMenuResponse interface", async () => {
      const result = await client.getMenu({
        organizationIds: [organizationId],
      });
      expect(() => validateGetMenuResponse(result)).not.toThrow();
      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.externalMenus)).toBe(true);
      expect(Array.isArray(result.priceCategories)).toBe(true);
    });
  });

  describe("getMenuById", () => {
    it("response matches GetMenuByIdResponse interface", async () => {
      const menus = await client.getMenu({ organizationIds: [organizationId] });
      if (menus.externalMenus.length === 0) {
        console.log("Skipping: no external menus");
        return;
      }
      const menuId = menus.externalMenus[0]!.id;
      const result = await client.getMenuById({
        externalMenuId: menuId,
        organizationIds: [organizationId],
      });
      expect(() => validateGetMenuByIdResponse(result)).not.toThrow();
      expect(result.id).toBeDefined();
      expect(result.itemCategories).toBeDefined();
      expect(result.productCategories).toBeDefined();
    });
  });

  describe("getNomenclature", () => {
    it("response matches GetNomenclatureResponse interface", async () => {
      const result = await client.getNomenclature({
        organizationId,
        startRevision: 0,
      });
      expect(() => validateGetNomenclatureResponse(result)).not.toThrow();
      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.groups)).toBe(true);
      expect(Array.isArray(result.productCategories)).toBe(true);
      expect(Array.isArray(result.products)).toBe(true);
      expect(Array.isArray(result.sizes)).toBe(true);
      expect(typeof result.revision).toBe("number");
    });

    it("product types are Dish, Good, or Modifier", async () => {
      const result = await client.getNomenclature({
        organizationId,
        startRevision: 0,
      });
      const validTypes = ["Dish", "Good", "Modifier"];
      for (const product of result.products) {
        const normalized =
          product.type.charAt(0).toUpperCase() +
          product.type.slice(1).toLowerCase();
        expect(validTypes).toContain(normalized);
      }
    });
  });

  describe("getTerminalGroups", () => {
    it("response matches GetTerminalGroupsResponse interface", async () => {
      const result = await client.getTerminalGroups({
        organizationIds: [organizationId],
      });
      expect(() => validateGetTerminalGroupsResponse(result)).not.toThrow();
      expect(result.correlationId).toBeDefined();
      expect(Array.isArray(result.terminalGroups)).toBe(true);
      expect(Array.isArray(result.terminalGroupsInSleep)).toBe(true);
    });
  });
});
