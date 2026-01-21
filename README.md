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

// Authenticate to get an access token
await client.authenticate();

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
  await client.authenticate();
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

## API Reference

### IikoClient

#### Constructor

```typescript
new IikoClient(apiKey: string, options?: IikoClientOptions)
```

#### Methods

- `authenticate(): Promise<AuthResponse>` - Authenticate and obtain access token
- `isAuthenticated(): boolean` - Check if client has a valid token
- `getAccessToken(): string | null` - Get the current access token

### Error Classes

- `IikoApiError` - Base error class for API errors
- `IikoAuthError` - Authentication errors (401)
- `IikoRateLimitError` - Rate limiting errors (429)

## Development

See [docs/Development.md](docs/Development.md) for development setup, testing, and contribution guidelines.

## License

MIT
