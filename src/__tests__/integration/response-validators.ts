/**
 * Runtime validators for API responses.
 * Compares real API responses with our TypeScript interfaces.
 */

import type {
  GetNomenclatureResponse,
  GetOrganizationsResponse,
  GetMenuResponse,
  GetMenuByIdResponse,
  GetTerminalGroupsResponse,
  NomenclatureProductType,
} from "../../types/index.js";

function expectString(value: unknown, path: string): void {
  if (typeof value !== "string") {
    throw new Error(`Expected string at ${path}, got ${typeof value}`);
  }
}

function expectNumber(value: unknown, path: string): void {
  if (typeof value !== "number") {
    throw new Error(`Expected number at ${path}, got ${typeof value}`);
  }
}

function expectBoolean(value: unknown, path: string): void {
  if (typeof value !== "boolean") {
    throw new Error(`Expected boolean at ${path}, got ${typeof value}`);
  }
}

function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array at ${path}, got ${typeof value}`);
  }
  return value;
}

function expectObject(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected object at ${path}, got ${typeof value}`);
  }
  return value as Record<string, unknown>;
}

function expectOptionalString(value: unknown, path: string): void {
  if (value !== null && value !== undefined && typeof value !== "string") {
    throw new Error(`Expected string | null at ${path}, got ${typeof value}`);
  }
}

const NOMENCLATURE_PRODUCT_TYPES: NomenclatureProductType[] = [
  "Dish",
  "Good",
  "Modifier",
];

function validateNomenclatureProduct(
  obj: Record<string, unknown>,
  path: string
): void {
  expectString(obj.id, `${path}.id`);
  expectOptionalString(obj.code, `${path}.code`);
  expectString(obj.name, `${path}.name`);
  expectOptionalString(obj.description, `${path}.description`);
  // API may return tags as array, object, or null
  if (
    obj.tags !== null &&
    obj.tags !== undefined &&
    !Array.isArray(obj.tags) &&
    typeof obj.tags !== "object"
  ) {
    throw new Error(`Expected array/object/null at ${path}.tags, got ${typeof obj.tags}`);
  }
  expectBoolean(obj.isDeleted, `${path}.isDeleted`);
  expectOptionalString(obj.parentGroup, `${path}.parentGroup`);
  expectNumber(obj.order, `${path}.order`);

  const type = obj.type;
  if (typeof type !== "string") {
    throw new Error(`Expected string at ${path}.type, got ${typeof type}`);
  }
  // API may return "Dish"/"Good"/"Modifier" or "dish"/"good"/"modifier"
  const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (!NOMENCLATURE_PRODUCT_TYPES.includes(normalized as NomenclatureProductType)) {
    throw new Error(
      `Expected type Dish|Good|Modifier at ${path}.type, got ${JSON.stringify(type)}`
    );
  }

  expectOptionalString(obj.groupId, `${path}.groupId`);
  expectOptionalString(obj.productCategoryId, `${path}.productCategoryId`);
  expectOptionalString(obj.modifierSchemaId, `${path}.modifierSchemaId`);
  expectOptionalString(obj.modifierSchemaName, `${path}.modifierSchemaName`);
  expectBoolean(obj.splittable, `${path}.splittable`);
  expectString(obj.measureUnit, `${path}.measureUnit`);
  expectArray(obj.sizePrices, `${path}.sizePrices`);
  expectArray(obj.modifiers, `${path}.modifiers`);
  expectArray(obj.groupModifiers, `${path}.groupModifiers`);
  expectArray(obj.imageLinks, `${path}.imageLinks`);
  expectBoolean(obj.doNotPrintInCheque, `${path}.doNotPrintInCheque`);
  expectNumber(obj.fatAmount, `${path}.fatAmount`);
  expectNumber(obj.proteinsAmount, `${path}.proteinsAmount`);
  expectNumber(obj.carbohydratesAmount, `${path}.carbohydratesAmount`);
  expectNumber(obj.energyAmount, `${path}.energyAmount`);
  expectNumber(obj.weight, `${path}.weight`);
}

export function validateGetOrganizationsResponse(
  data: unknown
): asserts data is GetOrganizationsResponse {
  const obj = expectObject(data, "response");
  expectString(obj.correlationId, "correlationId");
  const orgs = expectArray(obj.organizations, "organizations");
  for (let i = 0; i < orgs.length; i++) {
    const o = expectObject(orgs[i], `organizations[${i}]`);
    expectString(o.id, `organizations[${i}].id`);
    expectString(o.name, `organizations[${i}].name`);
  }
}

export function validateGetMenuResponse(
  data: unknown
): asserts data is GetMenuResponse {
  const obj = expectObject(data, "response");
  expectString(obj.correlationId, "correlationId");
  const menus = expectArray(obj.externalMenus, "externalMenus");
  for (let i = 0; i < menus.length; i++) {
    const m = expectObject(menus[i], `externalMenus[${i}]`);
    expectString(m.id, `externalMenus[${i}].id`);
    expectString(m.name, `externalMenus[${i}].name`);
  }
  expectArray(obj.priceCategories, "priceCategories");
}

export function validateGetMenuByIdResponse(
  data: unknown
): asserts data is GetMenuByIdResponse {
  const obj = expectObject(data, "response");
  expectArray(obj.productCategories, "productCategories");
  expectArray(obj.customerTagGroups, "customerTagGroups");
  expectNumber(obj.revision, "revision");
  expectNumber(obj.formatVersion, "formatVersion");
  expectNumber(obj.id, "id");
  expectString(obj.name, "name");
  expectArray(obj.itemCategories, "itemCategories");
  expectArray(obj.comboCategories, "comboCategories");
}

export function validateGetNomenclatureResponse(
  data: unknown
): asserts data is GetNomenclatureResponse {
  const obj = expectObject(data, "response");
  expectString(obj.correlationId, "correlationId");
  const groups = expectArray(obj.groups, "groups");
  for (let i = 0; i < groups.length; i++) {
    const g = expectObject(groups[i], `groups[${i}]`);
    expectString(g.id, `groups[${i}].id`);
    expectString(g.name, `groups[${i}].name`);
    expectNumber(g.order, `groups[${i}].order`);
    expectBoolean(g.isDeleted, `groups[${i}].isDeleted`);
  }
  const categories = expectArray(obj.productCategories, "productCategories");
  for (let i = 0; i < categories.length; i++) {
    const c = expectObject(categories[i], `productCategories[${i}]`);
    expectString(c.id, `productCategories[${i}].id`);
    expectString(c.name, `productCategories[${i}].name`);
    expectBoolean(c.isDeleted, `productCategories[${i}].isDeleted`);
  }
  const products = expectArray(obj.products, "products");
  for (let i = 0; i < products.length; i++) {
    validateNomenclatureProduct(
      expectObject(products[i], `products[${i}]`),
      `products[${i}]`
    );
  }
  const sizes = expectArray(obj.sizes, "sizes");
  for (let i = 0; i < sizes.length; i++) {
    const s = expectObject(sizes[i], `sizes[${i}]`);
    expectString(s.id, `sizes[${i}].id`);
    expectString(s.name, `sizes[${i}].name`);
    expectNumber(s.priority, `sizes[${i}].priority`);
    expectBoolean(s.isDefault, `sizes[${i}].isDefault`);
  }
  expectNumber(obj.revision, "revision");
}

export function validateGetTerminalGroupsResponse(
  data: unknown
): asserts data is GetTerminalGroupsResponse {
  const obj = expectObject(data, "response");
  expectString(obj.correlationId, "correlationId");
  const tg = expectArray(obj.terminalGroups, "terminalGroups");
  for (let i = 0; i < tg.length; i++) {
    const g = expectObject(tg[i], `terminalGroups[${i}]`);
    expectString(g.organizationId, `terminalGroups[${i}].organizationId`);
    expectArray(g.items, `terminalGroups[${i}].items`);
  }
  expectArray(obj.terminalGroupsInSleep, "terminalGroupsInSleep");
}
