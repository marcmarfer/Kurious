export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userExists"
  | "weakPassword"
  | "rateLimit"
  | "signupDisabled"
  | "linkInvalid"
  | "resetLinkInvalid"
  | "samePassword"
  | "notConfigured"
  | "generic";

const BY_CODE: Record<string, AuthErrorKey> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "userExists",
  email_exists: "userExists",
  weak_password: "weakPassword",
  over_request_rate_limit: "rateLimit",
  over_email_send_rate_limit: "rateLimit",
  signup_disabled: "signupDisabled",
  email_provider_disabled: "signupDisabled",
  otp_expired: "linkInvalid",
  same_password: "samePassword",
  session_not_found: "resetLinkInvalid",
};

export function authErrorKey(code: string | undefined): AuthErrorKey {
  return (code && BY_CODE[code]) || "generic";
}
