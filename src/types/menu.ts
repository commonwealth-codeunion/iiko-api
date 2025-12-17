/**
 * Request parameters for getting external menus
 */
export interface GetMenuRequest {
  /**
   * List of organization IDs to get menus for
   */
  organizationIds: string[];
}

/**
 * External menu information
 */
export interface ExternalMenu {
  /**
   * Menu ID
   */
  id: string;

  /**
   * Menu name
   */
  name: string;
}

/**
 * Price category information
 */
export interface PriceCategory {
  /**
   * Price category ID
   */
  id: string;

  /**
   * Price category name
   */
  name: string;
}

/**
 * Response from the menu endpoint
 */
export interface GetMenuResponse {
  /**
   * Correlation ID for the request
   */
  correlationId: string;

  /**
   * List of external menus
   */
  externalMenus: ExternalMenu[];

  /**
   * List of price categories
   */
  priceCategories: PriceCategory[];
}

// ==========================================================================
// Get Menu By ID Types
// ==========================================================================

/**
 * Request parameters for getting menu by ID
 */
export interface GetMenuByIdRequest {
  /**
   * External menu ID
   */
  externalMenuId: string;

  /**
   * List of organization IDs
   */
  organizationIds: string[];
}

/**
 * Product category information
 */
export interface ProductCategory {
  id: string;
  name: string;
  isDeleted: boolean;
}

/**
 * Customer tag group
 */
export interface CustomerTagGroup {
  id: string;
  name: string;
}

/**
 * Menu interval/schedule
 */
export interface MenuInterval {
  id: string;
  name: string;
}

/**
 * Nutrition information
 */
export interface Nutrition {
  fats: number;
  proteins: number;
  carbs: number;
  energy: number;
  organizations: string[];
  saturatedFattyAcid: number | null;
  salt: number | null;
  sugar: number | null;
}

/**
 * Item price for a specific organization
 */
export interface ItemPrice {
  organizationId: string;
  price: number;
}

/**
 * Item modifier group
 */
export interface ItemModifierGroup {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  items: MenuItem[];
}

/**
 * Item size variant
 */
export interface ItemSize {
  sku: string;
  sizeCode: string | null;
  sizeName: string;
  isDefault: boolean;
  portionWeightGrams: number;
  itemModifierGroups: ItemModifierGroup[];
  sizeId: string | null;
  nutritionPerHundredGrams: Nutrition;
  prices: ItemPrice[];
  nutritions: Nutrition[];
  isHidden: boolean;
  measureUnitType: string;
  buttonImageUrl: string | null;
}

/**
 * Menu item (dish, product, modifier)
 */
export interface MenuItem {
  sku: string;
  name: string;
  description: string;
  allergens: string[];
  tags: string[];
  labels: string[];
  itemSizes: ItemSize[];
  itemId: string;
  modifierSchemaId: string | null;
  taxCategory: string | null;
  modifierSchemaName: string;
  type: "DISH" | "MODIFIER" | "PRODUCT" | string;
  canBeDivided: boolean;
  canSetOpenPrice: boolean;
  useBalanceForSell: boolean;
  measureUnit: string;
  productCategoryId: string | null;
  customerTagGroups: CustomerTagGroup[];
  paymentSubject: string | null;
  paymentSubjectCode: string | null;
  outerEanCode: string | null;
  isMarked: boolean;
  isHidden: boolean;
  barcodes: string[];
  orderItemType: "Product" | "Compound" | string;
}

/**
 * Schedule information
 */
export interface Schedule {
  id: string;
  name: string;
}

/**
 * Item category in a menu
 */
export interface ItemCategory {
  id: string;
  name: string;
  description: string;
  buttonImageUrl: string | null;
  headerImageUrl: string | null;
  iikoGroupId: string;
  items: MenuItem[];
  scheduleId: string | null;
  scheduleName: string | null;
  schedules: Schedule[];
  isHidden: boolean;
  tags: string[];
  labels: string[];
}

/**
 * Combo category
 */
export interface ComboCategory {
  id: string;
  name: string;
}

/**
 * Response from get menu by ID endpoint
 */
export interface GetMenuByIdResponse {
  productCategories: ProductCategory[];
  customerTagGroups: CustomerTagGroup[];
  revision: number;
  formatVersion: number;
  id: number;
  name: string;
  description: string;
  buttonImageUrl: string | null;
  intervals: MenuInterval[];
  itemCategories: ItemCategory[];
  comboCategories: ComboCategory[];
}
