import {
  IikoApiError,
  IikoAuthError,
  IikoClient,
  IikoRateLimitError,
} from "../index.js";

describe("Package exports", () => {
  it("should export IikoClient", () => {
    expect(IikoClient).toBeDefined();
    expect(typeof IikoClient).toBe("function");
  });

  it("should export IikoApiError", () => {
    expect(IikoApiError).toBeDefined();
    const error = new IikoApiError("Test error", 500);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("IikoApiError");
  });

  it("should export IikoAuthError", () => {
    expect(IikoAuthError).toBeDefined();
    const error = new IikoAuthError("Auth error");
    expect(error).toBeInstanceOf(IikoApiError);
    expect(error.name).toBe("IikoAuthError");
    expect(error.statusCode).toBe(401);
  });

  it("should export IikoRateLimitError", () => {
    expect(IikoRateLimitError).toBeDefined();
    const error = new IikoRateLimitError("Rate limit", 60);
    expect(error).toBeInstanceOf(IikoApiError);
    expect(error.name).toBe("IikoRateLimitError");
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBe(60);
  });

  it("should be able to instantiate IikoClient", () => {
    const client = new IikoClient("test-api-key");
    expect(client).toBeInstanceOf(IikoClient);
  });
});
