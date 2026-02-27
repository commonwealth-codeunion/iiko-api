/**
 * Nomenclature API types (POST /api/1/nomenclature)
 * @see https://api-ru.iiko.services/docs#tag/Menu/paths/~1api~11~1nomenclature/post
 */

/**
 * Product type in nomenclature
 */
export type NomenclatureProductType = "Dish" | "Good" | "Modifier";

/**
 * Order item type
 */
export type NomenclatureOrderItemType = "Product" | "Compound";

/**
 * Request parameters for nomenclature endpoint
 */
export interface GetNomenclatureRequest {
  /**
   * Organization ID. Can be obtained by /api/1/organizations operation.
   */
  organizationId: string;

  /**
   * The revision (version) of the menu saved on the integration side.
   * Use 0 for the first request for each organization.
   * In every subsequent request, pass the revision value from the previous response.
   */
  startRevision?: number | null;
}

/**
 * Stock list group
 */
export interface NomenclatureGroup {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  /** API may return array, object, or null */
  tags: string[] | Record<string, unknown> | null;
  isDeleted: boolean;
  /** Parent group ID. Null for root groups. */
  parentGroup: string | null;
  order: number;
  isIncludedInMenu: boolean;
  isGroupModifier: boolean;
  imageLinks: string[];
  seoDescription: string | null;
  seoText: string | null;
  seoKeywords: string | null;
  seoTitle: string | null;
}

/**
 * Menu item category in nomenclature
 */
export interface NomenclatureProductCategory {
  id: string;
  name: string;
  isDeleted: boolean;
}

/**
 * Price information for a size
 */
export interface NomenclatureSizePriceInfo {
  currentPrice: number;
  isIncludedInMenu: boolean;
  nextPrice: number | null;
  nextIncludedInMenu: boolean;
  /** Date-time in format yyyy-MM-dd HH:mm:ss.fff */
  nextDatePrice: string | null;
}

/**
 * Size price entry
 */
export interface NomenclatureSizePrice {
  /** Null for products without size (single-size items) */
  sizeId: string | null;
  price: NomenclatureSizePriceInfo;
}

/**
 * Simple modifier in product
 */
export interface NomenclatureModifier {
  id: string;
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
  required: boolean;
  hideIfDefaultAmount: boolean;
  splittable: boolean;
  freeOfChargeAmount: number;
}

/**
 * Child modifier in group modifier
 */
export interface NomenclatureChildModifier {
  id: string;
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
  required: boolean;
  hideIfDefaultAmount: boolean;
  splittable: boolean;
  freeOfChargeAmount: number;
}

/**
 * Group modifier in product
 */
export interface NomenclatureGroupModifier {
  id: string;
  minAmount: number;
  maxAmount: number;
  required: boolean;
  childModifiersHaveMinMaxRestrictions: boolean;
  childModifiers: NomenclatureChildModifier[];
  hideIfDefaultAmount: boolean;
  defaultAmount: number;
  splittable: boolean;
  freeOfChargeAmount: number;
}

/**
 * Menu item or modifier in nomenclature
 */
export interface NomenclatureProduct {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  /** API may return array, object, or null */
  tags: string[] | Record<string, unknown> | null;
  isDeleted: boolean;
  /** Parent group ID. Null for root items. */
  parentGroup: string | null;
  order: number;
  /** Product type: Dish, Good, or Modifier */
  type: NomenclatureProductType;
  orderItemType: NomenclatureOrderItemType;
  groupId: string | null;
  productCategoryId: string | null;
  modifierSchemaId: string | null;
  modifierSchemaName: string | null;
  splittable: boolean;
  measureUnit: string;
  sizePrices: NomenclatureSizePrice[];
  modifiers: NomenclatureModifier[];
  groupModifiers: NomenclatureGroupModifier[];
  imageLinks: string[];
  doNotPrintInCheque: boolean;
  fullNameEnglish: string | null;
  useBalanceForSell: boolean;
  canSetOpenPrice: boolean;
  paymentSubject: string | null;
  /** Nutrition per 100g */
  fatAmount: number;
  proteinsAmount: number;
  carbohydratesAmount: number;
  energyAmount: number;
  /** Full portion nutrition */
  fatFullAmount: number;
  proteinsFullAmount: number;
  carbohydratesFullAmount: number;
  energyFullAmount: number;
  weight: number;
  seoDescription: string | null;
  seoText: string | null;
  seoKeywords: string | null;
  seoTitle: string | null;
}

/**
 * Item size in nomenclature
 */
export interface NomenclatureSize {
  id: string;
  name: string;
  priority: number;
  isDefault: boolean;
}

/**
 * Response from nomenclature endpoint
 */
export interface GetNomenclatureResponse {
  correlationId: string;
  groups: NomenclatureGroup[];
  productCategories: NomenclatureProductCategory[];
  products: NomenclatureProduct[];
  sizes: NomenclatureSize[];
  /** Menu revision. Save and pass in startRevision for next request. */
  revision: number;
}
