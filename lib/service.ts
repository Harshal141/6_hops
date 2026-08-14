import { cookies } from "next/headers";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";

// https deployments get the __Secure- prefix; http (local dev) does not.
const SESSION_COOKIE_NAMES = ["__Secure-authjs.session-token", "authjs.session-token"];

/**
 * The raw Auth.js session JWT, which the BE verifies with the shared AUTH_SECRET.
 * Auth.js splits oversized cookies into `<name>.0`, `<name>.1`, … so chunks are
 * reassembled in index order.
 */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();

  for (const base of SESSION_COOKIE_NAMES) {
    const whole = store.get(base)?.value;
    if (whole) return whole;

    const chunks = store
      .getAll()
      .filter((c) => c.name.startsWith(`${base}.`))
      .sort(
        (a, b) =>
          Number(a.name.slice(base.length + 1)) - Number(b.name.slice(base.length + 1)),
      );
    if (chunks.length > 0) return chunks.map((c) => c.value).join("");
  }

  return null;
}

/**
 * Server-side BE caller. Attaches the env tag and the session JWT — identity is
 * never asserted by the caller, it is carried by the verified token.
 */
export async function beClient(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-Env", ENV);

  const token = await getSessionToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${BE_URL}${path}`, { ...init, headers });
}

export async function checkBE() {
  try {
    const res = await fetch(`${BE_URL}/`);
    const data = await res.json();
    console.log(`[service] BE connected — env=${ENV} uptime=${data.uptime}s`);
  } catch {
    console.error(`[service] BE unreachable — ${BE_URL}`);
  }
}
