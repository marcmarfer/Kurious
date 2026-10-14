import { describe, expect, it } from "vitest";
import { authErrorKey } from "./errors";
import {
  safeNextPath,
  tripReturnPath,
  validateEmail,
  validateLogin,
  validateNewPassword,
  validateSignup,
} from "./validation";

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

describe("password recovery", () => {
  it("asks for a real email before sending the link", () => {
    expect(validateEmail("ana@example.com")).toBeNull();
    expect(validateEmail("ana@")).toEqual({ email: "emailInvalid" });
  });

  it("holds the new password to the sign-up minimum", () => {
    expect(validateNewPassword("12345678")).toBeNull();
    expect(validateNewPassword("1234567")).toEqual({
      password: "passwordTooShort",
    });
  });

  it("never returns to the recovery pages after logging in", () => {
    expect(safeNextPath("/forgot-password")).toBe("/");
    expect(safeNextPath("/en/reset-password")).toBe("/");
  });

  it("names the reused password and the dead link", () => {
    expect(authErrorKey("same_password")).toBe("samePassword");
    expect(authErrorKey("session_not_found")).toBe("resetLinkInvalid");
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

describe("tripReturnPath", () => {
  const trip = "d0000000-0000-4000-8000-0000000000aa";

  it.each([
    [`/trips/${trip}/ideas/x`, `/trips/${trip}/ideas/x`],
    [`/en/trips/${trip}/plant?stage=s`, `/trips/${trip}/plant?stage=s`],
    [`/trips/${trip}?idea=x`, `/trips/${trip}?idea=x`],
    [`/trips/${trip}`, `/trips/${trip}`],
    [`/trips/${trip}x/plan`, `/trips/${trip}`],
    ["/trips/other", `/trips/${trip}`],
    ["//evil.example", `/trips/${trip}`],
    [null, `/trips/${trip}`],
  ])("keeps %s inside the trip", (requested, expected) => {
    expect(tripReturnPath(requested, trip)).toBe(expected);
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
