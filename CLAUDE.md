# 6_hops — Frontend

Next.js 16 (App Router) · React 19 · Tailwind 4 · TanStack Query · NextAuth.

Root `../CLAUDE.md` covers project-wide conventions. This file is the frontend contract and
takes precedence for anything under `6_hops/`.

---

## 1. The component rule

**Before writing a `<button>`, `<input>`, `<textarea>`, modal, card, chip, or avatar, use the
primitive in `app/components/ui/`. If it does not exist, build it there first.**

A feature component (`profile/`, `connections/`, `discover/`, `home/`) must not contain a raw
interactive element. Not "should not" — must not. This is the single rule that keeps the
design consistent, because consistency cannot be maintained by remembering class strings.

Where the codebase stands today, and why this rule exists:

- **30 raw `<button>` elements across 13 feature files.** Only two files import the shared
  `Button`.
- **19 raw `<input>` elements.** There is no shared `Input` at all — the same eight-class
  string is pasted across `ExperienceSection`, `EducationSection`, `LinksSection`, and
  `ProfileHeader`.
- `Button` itself is unusable for most cases: no `variant`, no `size`, no `disabled`, no
  `loading`. It only renders the hero CTA, which is why everyone bypassed it.

**A primitive that cannot express the second use case is not a primitive.** When you reach
for one and it does not fit, *extend it with a prop* — do not fork it, and do not drop back
to a raw element.

### Required `ui/` inventory

Build these as they are needed. Each is generic, presentational, and has no knowledge of
profiles, connections, or any domain concept.

| Component | Props it must support |
|---|---|
| `Button` | `variant` (`primary` / `secondary` / `ghost` / `danger`), `size` (`sm` / `md` / `lg`), `disabled`, `loading`, `onClick`, `href`, `type` |
| `Input` | `label`, `value`, `onChange`, `placeholder`, `type`, `error`, `disabled` |
| `Textarea` | same as `Input` plus `rows` |
| `Modal` | `isOpen`, `onClose`, `title`, `children`, `footer` — owns the overlay, escape-to-close, and scroll lock |
| `Card` | `children`, optional `header` / `footer` — the `bg-white/90 backdrop-blur-sm border border-neutral-200` surface used on every panel |
| `Chip` | `label`, `onRemove?`, `variant` — skill chips, status pills |
| `Avatar` | `src`, `name`, `size` — including the initials fallback when `icon` is null |
| `EmptyState` | `message` — the `"No experience added"` / `"No links added"` pattern, currently written out 5× |
| `Spinner` / `PageState` | the loading and error blocks repeated verbatim in every page |

`ConnectRequestModal` is a bespoke modal; it should become a domain component that *uses*
`Modal`. That is the shape every feature component should have: domain logic and copy on the
outside, primitives on the inside.

### Naming and structure

- One component per file. Components use **named** exports (`export function Button`) and the
  file name matches the component — all 24 current components follow this. Only `page.tsx`
  and `layout.tsx` use default exports, because Next.js requires it.
- Every folder has an `index.ts` barrel. Import from the barrel, not the file path.
- `ui/` is generic. If a component knows what a "connection" is, it does not belong there.

---

## 2. Design tokens

**`globals.css` is the single source of truth for the design. Feature components must not
invent colours.**

Today `globals.css` defines only `--background` and `--foreground`, while the app contains
363 hardcoded `neutral-*` occurrences and `font-mono` on nearly every element. There is
nothing stopping two panels from drifting apart, and nothing that lets the palette change in
one place.

- Define semantic tokens in `@theme` — surface, border, text-primary, text-muted,
  text-placeholder, accent, danger, success — and reference those.
- `ui/` primitives own the raw Tailwind colour scales. Feature components use the primitives.
- The app is monospace-first by design. That belongs in a token or a base style, not repeated
  on every element.
- Spacing and radii follow one scale. Do not mix `rounded` and `rounded-md` for the same kind
  of surface.

When you need a colour that is not in the tokens, that is a design decision — add the token,
then use it.

---

## 3. `lib/utils/` — shared logic

**There is no `lib/utils/` directory yet. Create it.** The rule from the root config applies
literally: shared logic goes in `lib/utils/`, and the same logic never lives in two files.

Currently duplicated and needing extraction:

| What | Where it is duplicated |
|---|---|
| `apiFetch<T>()` | verbatim in `lib/hooks/profile.ts` **and** `lib/hooks/connection.ts` |
| `json(body)` request helper | same two files |
| `ApiError` | defined in `connection.ts` only — `profile.ts` throws a bare `Error`, so error handling differs by feature |
| Date formatting | `new Date(x).getFullYear()` inline across `ExperienceSection` and elsewhere |
| Profile save diffing | the add/update/delete diff in `profile/page.tsx` `handleSave`, written out three times (links, experience, education) |

Suggested homes: `lib/utils/api.ts` (fetch + `ApiError` + envelope handling),
`lib/utils/date.ts`, `lib/utils/diff.ts`.

**Do not create a util for a single caller.** Extract on the second use, not the first.

---

## 4. Hooks

- Custom hooks live in `lib/hooks/`, one responsibility each. Do not bundle unrelated queries.
- Query keys are declared as constants at the top of the hook file, never inline strings.
- Mutations invalidate the queries they affect. Optimistic updates need an `onError` rollback
  — `useAddSkill` / `useRemoveSkill` are the reference implementation.
- Types are exported from the hook file that owns them, colocated with the queries.
- **No `any`.** The codebase currently has zero — keep it that way.

---

## 5. API routes (`app/api/`)

**Every route handler goes through `proxyAuthed` from `lib/proxy.ts`.**

12 of the 24 route files currently hand-roll the session check, `beClient` call, and
response. Those hand-rolled handlers have a real bug: `NextResponse.json(await res.json())`
**drops the backend status**, so a BE 400 or 403 arrives at the client as a 200 carrying an
`{ error }` body. `proxyAuthed` forwards the status and turns an unreachable BE into a
structured 503.

```ts
// The whole handler.
import { proxyAuthed, jsonInit } from "@/lib/proxy";

export async function GET() {
  return proxyAuthed("/connection/list");
}

export async function POST(request: Request) {
  return proxyAuthed("/profile/experience", jsonInit("POST", await request.json()));
}
```

- All backend calls go through `lib/service.ts` → `beClient()`, which attaches `X-Env` and
  the session token. Never `fetch` the BE URL directly from a component or a route handler.
- Identity is never sent as a parameter — it travels in the verified session token.
- Route handlers are transport. No business logic, no data reshaping.
- **The one case that may compose its own logic** is a handler needing more than one BE call
  — `GET /api/profile` falls back to `/users/:id` on a 404 to build a profile skeleton. Such
  a handler still owes the two guarantees `proxyAuthed` provides: reject when there is no
  session, and **forward the BE status** rather than flattening it to 200.

---

## 6. Pages are thin coordinators

A page owns three things: **data fetching, state, and handlers.** Everything visual is a
component.

- **No JSX logic in pages** — no inline `<button>`, no layout branching beyond composing
  components.
- **Trigger for extraction: a page over ~150 lines, or any `handleX` over ~30 lines.**
  `app/profile/page.tsx` is 248 lines and its `handleSave` contains a repeated diff algorithm
  — that logic belongs in `lib/utils/`, and the edit-mode toolbar belongs in a component.
- Loading and error states use the shared `PageState` / `Spinner`, not a hand-written block
  per page.
- Avoid single-letter aliases for state (`const e = edited`). Names must survive a search.

Local UI state lives in the leaf that owns it — `SkillsSection` owning its search input is
correct. State that two siblings need is lifted to the page, not duplicated.

---

## 7. Server vs client components

- Default to server components. Add `"use client"` only when the file needs state, effects,
  or event handlers.
- Keep the `"use client"` boundary as low in the tree as possible — do not mark a page client
  just because one child needs interactivity.
- `auth()` and `cookies()` are server-only. They never appear in a client component.

---

## 8. API contract (shared with the backend)

The backend guarantees these — see `service_hops/CLAUDE.md` §8.

- **Error envelope:** `{ "error": "<message>" }`. Handle it in one place (`lib/utils/api.ts`),
  not per hook.
- **Status codes:** 401 unauthenticated · 403 forbidden · 404 missing · 409 conflict ·
  400 bad input · 503 backend unreachable. The UI should distinguish at least
  unauthenticated, forbidden, not-found, and unavailable — they are different screens.
- Responses use `snake_case`. Normalise at the boundary — `normalizeProfile` in
  `lib/hooks/profile.ts` is the pattern: every optional field gets a defined default so
  components never guard against `undefined`.
- 204 responses have no body. `apiFetch` must not call `.json()` on them.

---

## 9. Environment

- `NEXT_PUBLIC_BE_URL` — single backend URL for all environments.
- `NEXT_PUBLIC_APP_ENV` — `stage` | `prod`, drives the `X-Env` header. **Fallback is always
  `stage`**, never prod.
- New env vars are added to `.env.example` in the same change.

---

## 10. Definition of done

Before a frontend change is finished:

- [ ] No raw `<button>` / `<input>` / `<textarea>` in a feature component — primitives used.
- [ ] Any new primitive lives in `ui/`, is domain-free, and is exported from the barrel.
- [ ] No hardcoded colour that should be a token.
- [ ] Nothing copy-pasted between two files — shared logic is in `lib/utils/`.
- [ ] New API routes use `proxyAuthed`.
- [ ] The page did not grow past ~150 lines; new UI went into a component.
- [ ] No `any`. `npm run lint` and `npm run build` both pass.
- [ ] `LOG.md` (or the current log file) has an entry if this is a feature or refactor.
