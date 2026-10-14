export const INVITE_COOKIE = "kurious_invite";

export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function invitePath(token: string) {
  return `/join/${token}`;
}
