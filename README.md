Hosted: 6-hops.vercel.app

BE
Repo: https://github.com/Harshal141/service_hops
Hosted: service-hops.vercel.app

## End-to-end tests (onboarding)

A Chromium suite for the new-user onboarding flow lives in `e2e/` and runs on Vitest with the
`playwright` library (`vitest.e2e.config.ts`). `npm test` does not pick it up.

```sh
# from 6_hops/, with service_hops/ checked out next to it
E2E_DB_URL_FILE=/path/to/throwaway-branch-url.txt npm run test:e2e
```

What it does:

- Starts the backend (`service_hops`, port 8081) and the frontend (`next build` + `next start`,
  port 3001), and stops both at the end. All env is set on the child processes; no `.env`
  file is edited. The backend gets `NEON_STAGE_URL` and `NEON_PROD_URL` = the test DB URL;
  the frontend gets `NEXT_PUBLIC_BE_URL=http://localhost:8081`, `NEXT_PUBLIC_APP_ENV=stage`,
  `AUTH_URL=http://localhost:3001`, and `AUTH_SECRET` / `INTERNAL_API_SECRET` read from
  `service_hops/.env`. Sentry DSNs and `SENTRY_AUTH_TOKEN` are blanked.
- No OAuth: users are created through the real `POST /auth/identity` and signed in with a
  minted Auth.js session cookie (`e2e/harness.ts`).
- Every user gets an email on `e2e-<runId>.invalid`; they are deleted at the end (identities,
  flags and requests cascade). `E2E_KEEP_USERS=1` keeps them.

Env:

| Variable | Meaning |
|---|---|
| `E2E_DB_URL` or `E2E_DB_URL_FILE` | **Required.** A throwaway Neon branch. Refused if it is the prod (or, without `E2E_ALLOW_STAGE_DB=1`, the stage) DB from `service_hops/.env` |
| `E2E_SHOTS_DIR` | Screenshot folder (default `e2e/.shots`) |
| `E2E_FE_MODE=dev` | Use `next dev` instead of build + start (only when no other `next dev` runs in this checkout) |
| `E2E_SKIP_BUILD=1` | Reuse the last `next build` |
| `E2E_REUSE_SERVERS=1` | Don't start servers; use ones already on 8081 / 3001 with the env above |
| `E2E_BE_PORT`, `E2E_FE_PORT` | Override the ports |

Server logs go to `e2e/.logs/`. Note the build left in `.next/` points at `localhost:8081`.
