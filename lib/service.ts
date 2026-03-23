const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";

export async function beClient(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-Env", ENV);
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
