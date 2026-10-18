/**
 * Local end-to-end harness for the onboarding flow: config, the two dev servers, test users,
 * session cookies, backend calls and cleanup. Used by e2e/globalSetup.ts and the e2e tests.
 *
 * No OAuth anywhere. A real sign-in is provider → auth.ts `signIn` → BE POST /auth/identity →
 * Auth.js JWT. The harness reproduces everything after the provider:
 *   1. createUser() posts to /auth/identity exactly like lib/auth/backendSignIn.ts does, so the
 *      BE's real resolveSignIn runs (handle, referral, onboarding flag seeding).
 *   2. sessionCookie() mints the Auth.js session cookie the jwt callback would have produced
 *      ({ id, handle, env, name, email, picture, sub }), the same way
 *      service_hops/scripts/lib/devSession.mjs mints tokens.
 *
 * Isolation. Both servers run as child processes with process-env overrides; no .env file is
 * edited. The backend's NEON_STAGE_URL and NEON_PROD_URL both point at E2E_DB_URL (a throwaway
 * Neon branch), and the harness refuses to run if that URL is the prod (or, unless allowed,
 * the stage) URL from service_hops/.env. Secrets are read from service_hops/.env at runtime and
 * never printed. See README.md, "End-to-end tests".
 */
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { hkdf } from "@panva/hkdf";
import { EncryptJWT, base64url, calculateJwkThumbprint } from "jose";
import type { Page } from "playwright";

export const FE_ROOT = resolve(__dirname, "..");
export const BE_ROOT = resolve(FE_ROOT, "../service_hops");

export const BE_PORT = Number(process.env.E2E_BE_PORT ?? 8081);
export const FE_PORT = Number(process.env.E2E_FE_PORT ?? 3001);
export const BE_URL = `http://localhost:${BE_PORT}`;
export const FE_URL = `http://localhost:${FE_PORT}`;
export const ENV = "stage";

export const SHOTS_DIR = resolve(process.env.E2E_SHOTS_DIR ?? resolve(FE_ROOT, "e2e/.shots"));
export const LOG_DIR = resolve(FE_ROOT, "e2e/.logs");

// ── Config ─────────────────────────────────────────────────

function readDotEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

export interface E2EConfig {
  dbUrl: string;
  authSecret: string;
  internalSecret: string;
}

let cachedConfig: E2EConfig | null = null;

/** Secrets from service_hops/.env and the test DB URL; throws (without echoing values) when unsafe. */
export function loadConfig(): E2EConfig {
  if (cachedConfig) return cachedConfig;
  const beEnv = readDotEnv(resolve(BE_ROOT, ".env"));
  const dbUrl = (
    process.env.E2E_DB_URL ??
    (process.env.E2E_DB_URL_FILE ? readFileSync(process.env.E2E_DB_URL_FILE, "utf8") : "")
  ).trim();

  if (!dbUrl) throw new Error("E2E_DB_URL (or E2E_DB_URL_FILE) must name a throwaway Neon branch");
  const sameHost = (other: string | undefined) => {
    if (!other) return false;
    try {
      return new URL(other).host === new URL(dbUrl).host;
    } catch {
      return other === dbUrl;
    }
  };
  if (sameHost(beEnv.NEON_PROD_URL)) throw new Error("refusing to run: E2E_DB_URL points at the prod database");
  if (sameHost(beEnv.NEON_STAGE_URL) && process.env.E2E_ALLOW_STAGE_DB !== "1") {
    throw new Error("refusing to run: E2E_DB_URL is the shared stage database (set E2E_ALLOW_STAGE_DB=1 to allow)");
  }
  if (!beEnv.AUTH_SECRET || !beEnv.INTERNAL_API_SECRET) {
    throw new Error("service_hops/.env must define AUTH_SECRET and INTERNAL_API_SECRET");
  }
  cachedConfig = { dbUrl, authSecret: beEnv.AUTH_SECRET, internalSecret: beEnv.INTERNAL_API_SECRET };
  return cachedConfig;
}

// ── Servers ────────────────────────────────────────────────

async function isUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(3000) });
    return res.status > 0;
  } catch {
    return false;
  }
}

async function waitFor(url: string, timeoutMs: number, child?: ChildProcess): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) throw new Error(`server for ${url} exited early (${child.exitCode}); see e2e/.logs`);
    if (await isUp(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`timed out waiting for ${url}`);
}

function startProcess(name: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): ChildProcess {
  mkdirSync(LOG_DIR, { recursive: true });
  const log = createWriteStream(resolve(LOG_DIR, `${name}.log`));
  const child = spawn(process.execPath, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  child.stdout?.pipe(log);
  child.stderr?.pipe(log);
  return child;
}

export function stopProcess(child: ChildProcess | undefined): void {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    // next dev forks workers; /T takes the whole tree down with it
    try {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
    } catch {
      // already gone
    }
  } else {
    child.kill("SIGTERM");
  }
}

function frontendEnv(config: E2EConfig, nodeEnv: "development" | "production"): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: nodeEnv,
    NEXT_PUBLIC_BE_URL: BE_URL,
    NEXT_PUBLIC_APP_ENV: ENV,
    AUTH_SECRET: config.authSecret,
    INTERNAL_API_SECRET: config.internalSecret,
    AUTH_URL: FE_URL,
    NEXTAUTH_URL: FE_URL,
    AUTH_TRUST_HOST: "true",
    // keep test runs out of Sentry, and never upload source maps from a test build
    NEXT_PUBLIC_SENTRY_DSN: "",
    SENTRY_AUTH_TOKEN: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
}

const NEXT_BIN = resolve(FE_ROOT, "node_modules/next/dist/bin/next");

/**
 * E2E_FE_MODE=start (default): `next build` with the test env, then `next start`. This never
 * touches `.next/dev`, so it runs alongside someone else's `next dev` in the same checkout
 * (which holds `.next/dev/lock`). E2E_SKIP_BUILD=1 reuses the last build. E2E_FE_MODE=dev runs
 * `next dev` instead, when no other dev server is running here.
 */
async function startFrontend(config: E2EConfig): Promise<ChildProcess> {
  if (process.env.E2E_FE_MODE === "dev") {
    return startProcess("frontend", [NEXT_BIN, "dev", "-p", String(FE_PORT)], FE_ROOT, frontendEnv(config, "development"));
  }
  if (process.env.E2E_SKIP_BUILD !== "1") {
    const build = startProcess("frontend-build", [NEXT_BIN, "build"], FE_ROOT, frontendEnv(config, "production"));
    const code = await new Promise<number | null>((done) => build.on("exit", done));
    if (code !== 0) throw new Error(`next build failed (${code}); see e2e/.logs/frontend-build.log`);
  }
  return startProcess("frontend", [NEXT_BIN, "start", "-p", String(FE_PORT)], FE_ROOT, frontendEnv(config, "production"));
}

/**
 * Starts the backend (8081) and frontend (3001) unless E2E_REUSE_SERVERS=1, in which case
 * they must already be running with the env this file would have given them.
 */
export async function startServers(): Promise<ChildProcess[]> {
  const config = loadConfig();
  if (process.env.E2E_REUSE_SERVERS === "1") {
    await waitFor(`${BE_URL}/`, 10_000);
    await waitFor(`${FE_URL}/login`, 10_000);
    return [];
  }
  for (const url of [`${BE_URL}/`, `${FE_URL}/login`]) {
    if (await isUp(url)) throw new Error(`${url} is already taken; stop it or set E2E_REUSE_SERVERS=1`);
  }

  const be = startProcess("backend", ["--no-network-family-autoselection", "server.js"], BE_ROOT, {
    ...process.env,
    PORT: String(BE_PORT),
    NEON_STAGE_URL: config.dbUrl,
    NEON_PROD_URL: config.dbUrl,
    SENTRY_DSN: "",
    NODE_ENV: "development",
  });
  let fe: ChildProcess;
  try {
    fe = await startFrontend(config);
  } catch (err) {
    stopProcess(be);
    throw err;
  }
  try {
    await waitFor(`${BE_URL}/`, 60_000, be);
    await waitFor(`${FE_URL}/login`, 180_000, fe);
  } catch (err) {
    stopProcess(fe);
    stopProcess(be);
    throw err;
  }
  return [be, fe];
}

// ── Users ──────────────────────────────────────────────────

export interface TestUser {
  id: string;
  handle: string;
  name: string;
  email: string;
}

/** Every user a run creates gets an email on this domain, which is how cleanup finds them. */
export const emailDomain = (runId: string) => `e2e-${runId}.invalid`;

/** Signs a new user in through POST /auth/identity, as lib/auth/backendSignIn.ts does. */
export async function createUser(
  runId: string,
  label: string,
  name: string,
  referredBy?: string,
): Promise<TestUser> {
  const { internalSecret } = loadConfig();
  const email = `${label}@${emailDomain(runId)}`;
  const res = await fetch(`${BE_URL}/auth/identity`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Env": ENV, "X-Internal-Secret": internalSecret },
    body: JSON.stringify({
      provider: "google",
      subject: `e2e-${runId}-${label}`,
      email,
      emailVerified: true,
      name,
      icon: null,
      ...(referredBy ? { referredBy } : {}),
    }),
  });
  const body = (await res.json()) as { id?: string; user_id?: string; error?: string };
  if (!res.ok || !body.id || !body.user_id) throw new Error(`/auth/identity failed: ${res.status} ${body.error ?? ""}`);
  return { id: body.id, handle: body.user_id, name, email };
}

// ── Session tokens ─────────────────────────────────────────

export const SESSION_COOKIE = "authjs.session-token"; // http localhost: no __Secure- prefix
const ENC = "A256CBC-HS512";

/** An Auth.js session JWE for `user`: what the jwt callback stores after a real sign-in. */
export async function mintSessionToken(user: TestUser, expiresInSec = 60 * 60): Promise<string> {
  const { authSecret } = loadConfig();
  const key = await hkdf("sha256", authSecret, SESSION_COOKIE, `Auth.js Generated Encryption Key (${SESSION_COOKIE})`, 64);
  const kid = await calculateJwkThumbprint({ kty: "oct", k: base64url.encode(key) }, "sha512");
  const now = Math.floor(Date.now() / 1000);
  return new EncryptJWT({
    id: user.id,
    handle: user.handle,
    env: ENV,
    name: user.name,
    email: user.email,
    picture: null,
    sub: user.id,
  })
    .setProtectedHeader({ alg: "dir", enc: ENC, kid })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSec)
    .setJti(crypto.randomUUID())
    .encrypt(key);
}

export async function sessionCookie(user: TestUser) {
  return {
    name: SESSION_COOKIE,
    value: await mintSessionToken(user),
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax" as const,
  };
}

/** Calls the BE as `user`, the way the FE's beClient does. */
export async function callAs<T = unknown>(user: TestUser, method: string, path: string, body?: unknown): Promise<{ status: number; body: T }> {
  const res = await fetch(`${BE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await mintSessionToken(user)}`,
      "X-Env": ENV,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    // keep the text
  }
  return { status: res.status, body: parsed as T };
}

// ── Direct DB access (test branch only) ────────────────────

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

/** The backend's own Neon driver, so the FE takes no DB dependency. Only ever the test branch. */
export function testDb(): Sql {
  const requireBe = createRequire(resolve(BE_ROOT, "package.json"));
  const { neon } = requireBe("@neondatabase/serverless") as { neon: (url: string) => Sql };
  return neon(loadConfig().dbUrl);
}

/** Deletes every user this run created; their identities, flags and requests cascade. */
export async function deleteRunUsers(runId: string): Promise<number> {
  const sql = testDb();
  const rows = await sql`DELETE FROM users WHERE email LIKE ${`%@${emailDomain(runId)}`} RETURNING id`;
  return rows.length;
}

// ── Page helpers ───────────────────────────────────────────

export async function shot(page: Page, name: string, { fullPage = true } = {}): Promise<void> {
  mkdirSync(SHOTS_DIR, { recursive: true });
  await page.screenshot({ path: resolve(SHOTS_DIR, `${name}.png`), fullPage });
}

/** True when the page scrolls sideways (the layout overflows the viewport). */
export async function hasHorizontalScroll(page: Page): Promise<{ overflow: boolean; scrollWidth: number; innerWidth: number }> {
  return page.evaluate(() => {
    const scrollWidth = (document.scrollingElement ?? document.documentElement).scrollWidth;
    return { overflow: scrollWidth > window.innerWidth, scrollWidth, innerWidth: window.innerWidth };
  });
}
