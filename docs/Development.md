# Development Guide

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
# Install dependencies
npm install
```

## Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build
npm run build
```

## Local Development with npm link

To test the package locally in another project before publishing:

```bash
# In this package directory: build and create global symlink
npm run build
npm link

# In your other project: link to this package
npm link iiko-api
```

Now you can import and use the package as if it were installed from npm.

To unlink when done:

```bash
# In your other project
npm unlink iiko-api

# In this package directory
npm unlink
```

## Alternative: Using npm pack

For a more realistic installation test:

```bash
# In this package directory
npm pack
# Creates iiko-api-<version>.tgz

# In your other project
npm install ../path/to/iiko-api-<version>.tgz
```

## Project Structure

```
src/
  __tests__/          # Test files
    client.test.ts
    index.test.ts
  types/              # Type definitions
    common.ts
    index.ts
    organizations.ts
  client.ts           # Main IikoClient class
  errors.ts           # Error classes
  index.ts            # Public exports
```

## Adding New API Endpoints

1. **Add types** in `src/types/<domain>.ts`:

   ```typescript
   export interface GetSomethingRequest { ... }
   export interface GetSomethingResponse { ... }
   ```

2. **Export types** in `src/types/index.ts`:

   ```typescript
   export type { ... } from "./<domain>.js";
   ```

3. **Add method** in `src/client.ts`:

   ```typescript
   public async getSomething(request: GetSomethingRequest = {}): Promise<GetSomethingResponse> {
     return this.post<GetSomethingResponse>("/api/1/something", request);
   }
   ```

4. **Export types** in `src/index.ts` (if needed for public API)

5. **Add tests** in `src/__tests__/client.test.ts`

## Release Process

1. Make your changes and commit
2. Bump version:
   ```bash
   npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
   npm version minor   # 1.0.0 → 1.1.0 (new features)
   npm version major   # 1.0.0 → 2.0.0 (breaking changes)
   ```
3. Push with tags:
   ```bash
   git push --follow-tags
   ```
4. GitHub Actions will automatically publish to npm
