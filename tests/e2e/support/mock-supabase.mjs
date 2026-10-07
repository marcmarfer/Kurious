// In-memory stand-in for Supabase Auth with only what the app calls.
// GET /__mock/email?to=<address> returns the token_hash of the last confirmation email.

import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_SUPABASE_PORT ?? 54390);
const SECRET = "kurious-e2e-only";

const users = new Map();
const sessions = new Map();

const b64 = (value) => Buffer.from(value).toString("base64url");

function jwt(user) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64(
    JSON.stringify({
      sub: user.id,
      aud: "authenticated",
      role: "authenticated",
      email: user.email,
      user_metadata: user.user_metadata,
      iat: now,
      exp: now + 3600,
    }),
  );
  const sig = createHmac("sha256", SECRET)
    .update(`${head}.${body}`)
    .digest("base64url");
  return `${head}.${body}.${sig}`;
}

function verify(token) {
  const [head, body, sig] = (token ?? "").split(".");
  if (!sig) return null;
  const expected = createHmac("sha256", SECRET)
    .update(`${head}.${body}`)
    .digest("base64url");
  if (sig !== expected) return null;
  const claims = JSON.parse(Buffer.from(body, "base64url").toString());
  return claims.exp > Date.now() / 1000 ? claims : null;
}

function publicUser(user) {
  return {
    id: user.id,
    aud: "authenticated",
    role: "authenticated",
    email: user.email,
    email_confirmed_at: user.confirmedAt,
    user_metadata: user.user_metadata,
    app_metadata: { provider: "email", providers: ["email"] },
    identities: [],
    created_at: user.createdAt,
    updated_at: user.createdAt,
  };
}

function session(user) {
  const refresh = randomBytes(16).toString("hex");
  sessions.set(refresh, user.email);
  return {
    access_token: jwt(user),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: refresh,
    user: publicUser(user),
  };
}

const fail = (status, code, msg) => [
  status,
  { code: status, error_code: code, msg },
];

const routes = {
  "GET /__mock/health": () => [200, { ok: true }],
  "GET /__mock/email": (_body, url) => {
    const user = users.get(url.searchParams.get("to"));
    return user?.tokenHash
      ? [200, { token_hash: user.tokenHash }]
      : [404, { error: "no email" }];
  },
  "POST /auth/v1/signup": (body) => {
    if (users.has(body.email)) {
      return [200, publicUser(users.get(body.email))];
    }
    const user = {
      id: randomUUID(),
      email: body.email,
      password: body.password,
      user_metadata: body.data ?? {},
      confirmedAt: null,
      createdAt: new Date().toISOString(),
      tokenHash: randomBytes(20).toString("hex"),
    };
    users.set(user.email, user);
    return [200, publicUser(user)];
  },
  "POST /auth/v1/verify": (body) => {
    const user = [...users.values()].find(
      (u) => u.tokenHash && u.tokenHash === body.token_hash,
    );
    if (!user)
      return fail(403, "otp_expired", "Email link is invalid or has expired");
    user.tokenHash = null;
    user.confirmedAt = new Date().toISOString();
    return [200, session(user)];
  },
  "POST /auth/v1/token": (body, url) => {
    const grant = url.searchParams.get("grant_type");
    if (grant === "refresh_token") {
      const email = sessions.get(body.refresh_token);
      sessions.delete(body.refresh_token);
      return email
        ? [200, session(users.get(email))]
        : fail(400, "refresh_token_not_found", "Invalid Refresh Token");
    }
    const user = users.get(body.email);
    if (!user || user.password !== body.password) {
      return fail(400, "invalid_credentials", "Invalid login credentials");
    }
    if (!user.confirmedAt) {
      return fail(400, "email_not_confirmed", "Email not confirmed");
    }
    return [200, session(user)];
  },
  "GET /auth/v1/user": (_body, _url, headers) => {
    const claims = verify(headers.authorization?.replace(/^Bearer /, ""));
    const user = claims && [...users.values()].find((u) => u.id === claims.sub);
    return user ? [200, publicUser(user)] : fail(403, "bad_jwt", "invalid JWT");
  },
  "POST /auth/v1/logout": () => [204, null],
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const route = routes[`${req.method} ${url.pathname}`];
  const [status, payload] = route
    ? route(raw ? JSON.parse(raw) : {}, url, req.headers)
    : [404, { error: `mock has no ${req.method} ${url.pathname}` }];
  res.writeHead(status, { "content-type": "application/json" });
  res.end(payload === null ? "" : JSON.stringify(payload));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock Supabase Auth on http://127.0.0.1:${PORT}`);
});
