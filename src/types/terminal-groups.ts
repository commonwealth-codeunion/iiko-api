/**
 * Request body for getting terminal groups
 * @see https://api-ru.iiko.services/docs#tag/Terminal-groups/paths/~1api~11~1terminal_groups/post
 */
export interface GetTerminalGroupsRequest {
  /**
   * Organizations IDs for which information is requested.
   * Can be obtained by /api/1/organizations operation.
   */
  organizationIds: string[];

  /**
   * Attribute that shows that response contains disabled terminal groups.
   */
  includeDisabled?: boolean | null;

  /**
   * External data keys that have to be returned.
   */
  returnExternalData?: string[] | null;
}

/**
 * External data key-value pair
 */
export interface TerminalGroupExternalDataItem {
  key: string;
  value: string;
}

/**
 * Single terminal group item
 */
export interface TerminalGroupItem {
  /** Terminal group ID (UUID) */
  id: string;
  /** Organization ID (UUID) */
  organizationId: string;
  /** Terminal group name */
  name: string;
  /** Time zone */
  timeZone: string;
  /** External data (present when requested via returnExternalData) */
  externalData?: TerminalGroupExternalDataItem[];
  /** POS version */
  posVersion?: string;
}

/**
 * Terminal groups for one organization
 */
export interface TerminalGroupOrganizationGroup {
  organizationId: string;
  items: TerminalGroupItem[];
}

/**
 * Response from the terminal groups endpoint
 */
export interface GetTerminalGroupsResponse {
  /** Correlation ID for request tracing */
  correlationId: string;
  /** Terminal groups by organization */
  terminalGroups: TerminalGroupOrganizationGroup[];
  /** Terminal groups in sleep mode by organization */
  terminalGroupsInSleep: TerminalGroupOrganizationGroup[];
}
