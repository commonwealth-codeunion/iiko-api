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
      nock(BASE_URL).post("/api/1/access_token").reply(200, {
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

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
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

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
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

  describe("getMenu", () => {
    it("should throw if not authenticated", async () => {
      const client = new IikoClient(MOCK_API_KEY);

      await expect(
        client.getMenu({ organizationIds: ["org-1"] })
      ).rejects.toThrow("Not authenticated");
    });

    it("should fetch menus successfully", async () => {
      const mockResponse = {
        correlationId: "test-correlation-id",
        externalMenus: [
          { id: "67964", name: "ZazaGo" },
          { id: "67965", name: "Menu 2" },
        ],
        priceCategories: [],
      };

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
        correlationId: MOCK_CORRELATION_ID,
        token: MOCK_ACCESS_TOKEN,
      });

      nock(BASE_URL)
        .post("/api/2/menu", {
          organizationIds: ["9b87a04a-5e2d-43d0-9206-ccac3ecd59b0"],
        })
        .matchHeader("Authorization", `Bearer ${MOCK_ACCESS_TOKEN}`)
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getMenu({
        organizationIds: ["9b87a04a-5e2d-43d0-9206-ccac3ecd59b0"],
      });

      expect(result.correlationId).toBe("test-correlation-id");
      expect(result.externalMenus).toHaveLength(2);
      expect(result.externalMenus[0]?.name).toBe("ZazaGo");
      expect(result.priceCategories).toHaveLength(0);
    });

    it("should return price categories when available", async () => {
      const mockResponse = {
        correlationId: "test-id",
        externalMenus: [{ id: "123", name: "Main Menu" }],
        priceCategories: [
          { id: "cat-1", name: "Standard" },
          { id: "cat-2", name: "Premium" },
        ],
      };

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
        correlationId: MOCK_CORRELATION_ID,
        token: MOCK_ACCESS_TOKEN,
      });

      nock(BASE_URL)
        .post("/api/2/menu", { organizationIds: ["org-1"] })
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getMenu({ organizationIds: ["org-1"] });

      expect(result.priceCategories).toHaveLength(2);
      expect(result.priceCategories[0]?.name).toBe("Standard");
    });
  });

  describe("getMenuById", () => {
    it("should throw if not authenticated", async () => {
      const client = new IikoClient(MOCK_API_KEY);

      await expect(
        client.getMenuById({
          externalMenuId: "67964",
          organizationIds: ["org-1"],
        })
      ).rejects.toThrow("Not authenticated");
    });

    it("should fetch menu by ID successfully", async () => {
      const mockResponse = {
        productCategories: [
          { id: "cat-1", name: "Итальянская", isDeleted: false },
        ],
        customerTagGroups: [],
        revision: 1765870575,
        formatVersion: 2,
        id: 67964,
        name: "ZazaGo",
        description: "",
        buttonImageUrl: null,
        intervals: [],
        itemCategories: [
          {
            id: "8b25dd45-2ccd-416c-be7f-145905b4f594",
            name: "Основные блюда",
            description: "",
            buttonImageUrl: null,
            headerImageUrl: null,
            iikoGroupId: "b6f0a8cb-778e-1a3b-019b-13514b40a3c4",
            items: [
              {
                sku: "00007",
                name: "Спагетти Карбонара",
                description: "",
                allergens: [],
                tags: [],
                labels: [],
                itemSizes: [
                  {
                    sku: "00007",
                    sizeCode: null,
                    sizeName: "",
                    isDefault: true,
                    portionWeightGrams: 1000.0,
                    itemModifierGroups: [],
                    sizeId: null,
                    nutritionPerHundredGrams: {
                      fats: 0.0,
                      proteins: 0.0,
                      carbs: 0.0,
                      energy: 0.0,
                      organizations: [],
                      saturatedFattyAcid: null,
                      salt: null,
                      sugar: null,
                    },
                    prices: [
                      {
                        organizationId: "9b87a04a-5e2d-43d0-9206-ccac3ecd59b0",
                        price: 3000.0,
                      },
                    ],
                    nutritions: [],
                    isHidden: false,
                    measureUnitType: "GRAM",
                    buttonImageUrl: null,
                  },
                ],
                itemId: "54b328bc-e693-4959-89da-69bdf95f92ec",
                modifierSchemaId: null,
                taxCategory: null,
                modifierSchemaName: "",
                type: "DISH",
                canBeDivided: false,
                canSetOpenPrice: false,
                useBalanceForSell: false,
                measureUnit: "",
                productCategoryId: "cat-1",
                customerTagGroups: [],
                paymentSubject: null,
                paymentSubjectCode: null,
                outerEanCode: null,
                isMarked: false,
                isHidden: false,
                barcodes: [],
                orderItemType: "Product",
              },
            ],
            scheduleId: null,
            scheduleName: null,
            schedules: [],
            isHidden: false,
            tags: [],
            labels: [],
          },
        ],
        comboCategories: [],
      };

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
        correlationId: MOCK_CORRELATION_ID,
        token: MOCK_ACCESS_TOKEN,
      });

      nock(BASE_URL)
        .post("/api/2/menu/by_id", {
          externalMenuId: "67964",
          organizationIds: ["9b87a04a-5e2d-43d0-9206-ccac3ecd59b0"],
        })
        .matchHeader("Authorization", `Bearer ${MOCK_ACCESS_TOKEN}`)
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getMenuById({
        externalMenuId: "67964",
        organizationIds: ["9b87a04a-5e2d-43d0-9206-ccac3ecd59b0"],
      });

      expect(result.id).toBe(67964);
      expect(result.name).toBe("ZazaGo");
      expect(result.productCategories).toHaveLength(1);
      expect(result.itemCategories).toHaveLength(1);
      expect(result.itemCategories[0]?.name).toBe("Основные блюда");
      expect(result.itemCategories[0]?.items).toHaveLength(1);
      expect(result.itemCategories[0]?.items[0]?.name).toBe(
        "Спагетти Карбонара"
      );
      expect(
        result.itemCategories[0]?.items[0]?.itemSizes[0]?.prices[0]?.price
      ).toBe(3000.0);
    });

    it("should return menu with multiple categories", async () => {
      const mockResponse = {
        productCategories: [],
        customerTagGroups: [],
        revision: 123,
        formatVersion: 2,
        id: 12345,
        name: "Test Menu",
        description: "Test description",
        buttonImageUrl: null,
        intervals: [],
        itemCategories: [
          {
            id: "cat-1",
            name: "Category 1",
            description: "",
            buttonImageUrl: null,
            headerImageUrl: null,
            iikoGroupId: "",
            items: [],
            scheduleId: null,
            scheduleName: null,
            schedules: [],
            isHidden: false,
            tags: [],
            labels: [],
          },
          {
            id: "cat-2",
            name: "Category 2",
            description: "",
            buttonImageUrl: null,
            headerImageUrl: null,
            iikoGroupId: "",
            items: [],
            scheduleId: null,
            scheduleName: null,
            schedules: [],
            isHidden: false,
            tags: [],
            labels: [],
          },
        ],
        comboCategories: [],
      };

      nock(BASE_URL).post("/api/1/access_token").reply(200, {
        correlationId: MOCK_CORRELATION_ID,
        token: MOCK_ACCESS_TOKEN,
      });

      nock(BASE_URL)
        .post("/api/2/menu/by_id", {
          externalMenuId: "12345",
          organizationIds: ["org-1"],
        })
        .reply(200, mockResponse);

      const client = new IikoClient(MOCK_API_KEY);
      await client.authenticate();

      const result = await client.getMenuById({
        externalMenuId: "12345",
        organizationIds: ["org-1"],
      });

      expect(result.itemCategories).toHaveLength(2);
      expect(result.description).toBe("Test description");
    });
  });
});
