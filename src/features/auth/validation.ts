// Must match minimum_password_length in supabase/config.toml and in the Supabase project.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 60;

export type FieldErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordTooShort";

export type FieldErrors = Partial<
  Record<"name" | "email" | "password", FieldErrorKey>
>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(input: {
  email: string;
  password: string;
}): FieldErrors | null {
  const errors: FieldErrors = {};
  if (!EMAIL.test(input.email)) errors.email = "emailInvalid";
  if (!input.password) errors.password = "passwordRequired";
  return Object.keys(errors).length ? errors : null;
}

export function validateSignup(input: {
  name: string;
  email: string;
  password: string;
}): FieldErrors | null {
  const errors: FieldErrors = {};
  if (!input.name) errors.name = "nameRequired";
  else if (input.name.length > MAX_NAME_LENGTH) errors.name = "nameTooLong";
  if (!EMAIL.test(input.email)) errors.email = "emailInvalid";
  if (input.password.length < MIN_PASSWORD_LENGTH)
    errors.password = "passwordTooShort";
  return Object.keys(errors).length ? errors : null;
}

const LOCALE_PREFIX = /^\/(pt|en)(?=[/?#]|$)/;
const AUTH_PAGE = /^\/(login|signup)(?=[/?#]|$)/;

export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.includes("\\") || /[\u0000-\u001f]/.test(next)) return "/";
  const path = next.replace(LOCALE_PREFIX, "");
  if (!path || path.startsWith("?") || path.startsWith("#")) return `/${path}`;
  if (path.startsWith("//")) return "/";
  return AUTH_PAGE.test(path) ? "/" : path;
}
