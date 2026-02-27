# iiko-api

A TypeScript wrapper for the [iiko API](https://api-ru.iiko.services/).

## Installation

```bash
npm install iiko-api
```

## Usage

```typescript
import { IikoClient } from "iiko-api";

// Create a client instance with your API key
const client = new IikoClient("your-api-key");

// Token is requested and cached automatically on first API call
const { organizations } = await client.getOrganizations();

// Get nomenclature (menu) for organization
const { products, groups, revision } = await client.getNomenclature({
  organizationId: organizations[0]!.id,
  startRevision: 0, // use revision from response for incremental updates
});

// Check authentication status
console.log(client.isAuthenticated); // true

// Get the current access token if needed
const token = client.getAccessToken();
```

### Configuration Options

```typescript
const client = new IikoClient("your-api-key", {
  baseUrl: "https://api-ru.iiko.services", // Custom API base URL
  timeout: 30000, // Request timeout in milliseconds
});
```

### Error Handling

The library provides typed error classes for different error scenarios:

```typescript
import {
  IikoClient,
  IikoApiError,
  IikoAuthError,
  IikoRateLimitError,
} from "iiko-api";

try {
  await client.getOrganizations();
} catch (error) {
  if (error instanceof IikoAuthError) {
    console.error("Authentication failed:", error.message);
  } else if (error instanceof IikoRateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof IikoApiError) {
    console.error(`API error ${error.statusCode}:`, error.message);
  }
}
```

### Demo script

A small script that creates a client and calls `getOrganizations()`:

```bash
# Set API key (or add IIKO_API_KEY to .env)
export IIKO_API_KEY=your-api-key

# Build and run
npm run build
npm run run:organizations
```

Optional: `IIKO_BASE_URL` to override the API base URL.

## API Reference

### IikoClient

#### Constructor

```typescript
new IikoClient(apiKey: string, options?: IikoClientOptions)
```

#### Methods

- `isAuthenticated`: boolean - Whether the client has a cached token
- `getAccessToken(): string | null` - Get the current access token
- `getOrganizations(request?)` - Get list of organizations
- `getMenu(request)` - Get external menus with price categories
- `getMenuById(request)` - Get detailed menu by external menu ID
- `getNomenclature(request)` - Get nomenclature (groups, products, sizes) for organization
- `getTerminalGroups(request)` - Get terminal groups for organizations

### Error Classes

- `IikoApiError` - Base error class for API errors
- `IikoAuthError` - Authentication errors (401)
- `IikoRateLimitError` - Rate limiting errors (429)

## Development

See [docs/Development.md](docs/Development.md) for development setup, testing, and contribution guidelines.

## License

MIT
