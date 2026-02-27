// Main client
export { IikoClient } from "./client.js";

// Types
export type {
  ApiErrorResponse,
  AuthResponse,
  // Organizations
  GetOrganizationsRequest,
  GetOrganizationsResponse,
  IikoClientOptions,
  Organization,
  // Terminal groups
  GetTerminalGroupsRequest,
  GetTerminalGroupsResponse,
  TerminalGroupExternalDataItem,
  TerminalGroupItem,
  TerminalGroupOrganizationGroup,
  // Nomenclature
  GetNomenclatureRequest,
  GetNomenclatureResponse,
  NomenclatureGroup,
  NomenclatureProduct,
  NomenclatureProductCategory,
  NomenclatureProductType,
  NomenclatureSize,
} from "./types/index.js";

// Errors
export { IikoApiError, IikoAuthError, IikoRateLimitError } from "./errors.js";
