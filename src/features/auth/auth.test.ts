import { describe, expect, it } from "vitest";
import { authErrorKey } from "./errors";
import { safeNextPath, validateLogin, validateSignup } from "./validation";

describe("validateLogin", () => {
  it("accepts a valid email and any password", () => {
    expect(validateLogin({ email: "ana@kurious.earth", password: "x" })).toBe(
      null,
    );
  });

  it("flags a bad email and an empty password", () => {
    expect(validateLogin({ email: "ana@", password: "" })).toEqual({
      email: "emailInvalid",
      password: "passwordRequired",
    });
  });
});

describe("validateSignup", () => {
  const ok = { name: "Ana", email: "ana@kurious.earth", password: "12345678" };

  it("accepts a complete form", () => {
    expect(validateSignup(ok)).toBe(null);
  });

  it("needs a name of at most 60 characters", () => {
    expect(validateSignup({ ...ok, name: "" })).toEqual({
      name: "nameRequired",
    });
    expect(validateSignup({ ...ok, name: "a".repeat(61) })).toEqual({
      name: "nameTooLong",
    });
  });

  it("needs a password of at least 8 characters", () => {
    expect(validateSignup({ ...ok, password: "1234567" })).toEqual({
      password: "passwordTooShort",
    });
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/trips/1", "/trips/1"],
    [null, "/"],
    ["https://evil.example", "/"],
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
    ["/pt/trips/1", "/trips/1"],
    ["/en", "/"],
    ["/en?tab=map", "/?tab=map"],
    ["/pt//evil.example", "/"],
    ["/ptolemy", "/ptolemy"],
    ["/login", "/"],
    ["/en/signup?step=2", "/"],
    ["/login-help", "/login-help"],
  ])("%s -> %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });
});

describe("authErrorKey", () => {
  it("maps known Supabase codes and falls back to generic", () => {
    expect(authErrorKey("invalid_credentials")).toBe("invalidCredentials");
    expect(authErrorKey("over_email_send_rate_limit")).toBe("rateLimit");
    expect(authErrorKey("something_new")).toBe("generic");
    expect(authErrorKey(undefined)).toBe("generic");
  });
});
