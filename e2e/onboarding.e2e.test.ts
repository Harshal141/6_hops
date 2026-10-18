/**
 * The new-user onboarding flow, end to end in Chromium against local dev servers.
 *
 * Run: `npm run test:e2e` (see README.md, "End-to-end tests" for the env it needs). The
 * global setup starts the backend on :8081 and the frontend on :3001 against a throwaway
 * Neon branch, and deletes every user the run created afterwards.
 *
 * Users are created through the real POST /auth/identity and signed in with a minted Auth.js
 * session cookie (e2e/harness.ts); there is no OAuth. Everything is driven by role and
 * accessible name.
 */
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { chromium, type Browser, type BrowserContext, type Locator, type Page } from "playwright";
import {
  FE_URL, callAs, createUser, hasHorizontalScroll, sessionCookie, shot, testDb, type TestUser,
} from "./harness";

const runId = inject("e2eRunId");
const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 360, height: 780 };
const UI_TIMEOUT = 60_000;
const NOTE = "We worked together on the e2e test suite.";

interface OnboardingFlag {
  status: string;
  current_step: number;
  steps: Record<string, string>;
  reminder_dismissed: boolean;
}

let browser: Browser;
const contexts: BrowserContext[] = [];

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  for (const context of contexts) await context.close().catch(() => {});
  await browser?.close();
});

/** A signed-in browser tab for `user`, with clipboard access for the invite step. */
async function openAs(user: TestUser, viewport = DESKTOP): Promise<Page> {
  const context = await browser.newContext({ viewport, baseURL: FE_URL });
  contexts.push(context);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: FE_URL });
  await context.addCookies([await sessionCookie(user)]);
  const page = await context.newPage();
  page.setDefaultTimeout(UI_TIMEOUT);
  page.setDefaultNavigationTimeout(120_000);
  return page;
}

const visible = (locator: Locator) => locator.waitFor({ state: "visible", timeout: UI_TIMEOUT });
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

/** The stepper item marked as the current step, or null on welcome and done. */
async function currentStepLabel(page: Page): Promise<string | null> {
  const current = page.getByRole("list", { name: "Setup progress" }).locator('li[aria-current="step"]');
  return (await current.count()) ? (await current.textContent())?.trim() ?? null : null;
}

/** Loads a dashboard URL and waits until the flags it renders from have arrived. */
async function gotoDashboard(page: Page, path = "/dashboard") {
  const flags = page.waitForResponse((res) => res.url().endsWith("/api/flag") && res.request().method() === "GET");
  await page.goto(path);
  await page.waitForURL(/\/dashboard/);
  await flags;
  await page.waitForTimeout(500); // one render after the flags land
}

/** The onboarding PATCH bodies the page sends, in order. */
function recordFlagWrites(page: Page): unknown[] {
  const writes: unknown[] = [];
  page.on("request", (req) => {
    if (req.method() === "PATCH" && req.url().endsWith("/api/flag/onboarding")) writes.push(req.postDataJSON());
  });
  return writes;
}

const reminder = (page: Page) => page.getByRole("region", { name: "Setup reminder" });

/** The onboarding marker cookie (lib/utils/onboardingMarker.ts) this browser holds, if any. */
async function markerCookie(page: Page): Promise<string | undefined> {
  return (await page.context().cookies()).find((cookie) => cookie.name === "hops_onb")?.value;
}

async function onboardingFlag(user: TestUser): Promise<OnboardingFlag | undefined> {
  const res = await callAs<{ onboarding?: OnboardingFlag }>(user, "GET", "/flag");
  expect(res.status).toBe(200);
  return res.body.onboarding;
}

async function sentRequests(user: TestUser) {
  const res = await callAs<{ addressee_id: string; name: string; requester_note: string }[]>(user, "GET", "/connection/request/sent");
  expect(res.status).toBe(200);
  return res.body;
}

/** Opens the connect modal from `trigger`, writes the required note and sends it. */
async function sendRequestVia(page: Page, trigger: Locator): Promise<string> {
  const label = (await trigger.getAttribute("aria-label")) ?? "";
  const targetName = label.replace(/^Connect with /, "");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: `Connect with ${targetName}` });
  await visible(dialog);
  const send = dialog.getByRole("button", { name: "Send request" });
  expect(await send.isDisabled()).toBe(true); // a note is required
  await dialog.getByRole("textbox", { name: "Why they are a strong connection" }).fill(NOTE);
  await send.click();
  await dialog.waitFor({ state: "hidden" });
  return targetName;
}

const SEED_TITLE = "Backend engineer at Keychain";

/** Gives `user` a filled profile through the BE, standing in for a saved resume import. */
async function seedProfile(user: TestUser, skillCount = 0): Promise<void> {
  const saved = await callAs(user, "PATCH", "/profile", {
    title: SEED_TITLE,
    experience: [
      { company: "Tamara", role: "Intern", started_at: "2019-01-01", ended_at: "2020-01-01", currently_working: false, description: "" },
      { company: "Keychain", role: "Backend engineer", started_at: "2021-06-01", ended_at: null, currently_working: true, description: "" },
      { company: "Hack4TKM", role: "Volunteer", started_at: "2017-01-01", ended_at: "2017-06-01", currently_working: false, description: "" },
    ],
    education: [{ institution: "IIT Bombay", degree: "B.Tech", year: "2015-2019" }],
  });
  expect(saved.status, JSON.stringify(saved.body)).toBe(200);
  if (!skillCount) return;
  const search = await callAs<{ id: number; level: number }[]>(user, "GET", "/skill/search");
  const skills = search.body.filter((skill) => skill.level === 3).slice(0, skillCount);
  expect(skills.length).toBe(skillCount);
  for (const skill of skills) {
    const added = await callAs(user, "POST", "/profile/skill", { skill_id: skill.id });
    expect(added.status, JSON.stringify(added.body)).toBe(201);
  }
}

/** Waits for the BE to record the profile task's result (the write follows the UI). */
async function profileResult(user: TestUser, expected: string | undefined): Promise<void> {
  const deadline = Date.now() + 15_000;
  let last: string | undefined;
  while (Date.now() < deadline) {
    last = (await onboardingFlag(user))?.steps.profile;
    if (last === expected) return;
    await new Promise((done) => setTimeout(done, 300));
  }
  expect(last).toBe(expected);
}

const filledPanel = (page: Page) => page.getByRole("region", { name: "What we filled in" });

/** Opens the profile step and waits until the profile has loaded into it. */
async function openProfileStep(page: Page) {
  const loaded = page.waitForResponse((res) => res.url().endsWith("/api/profile") && res.request().method() === "GET");
  await page.goto("/onboarding?step=profile");
  await loaded;
  await visible(page.getByRole("heading", { level: 1, name: /^(Build your profile in one drop|Your profile is ready)$/ }));
}

/**
 * Opens the skill search in the edit modal and its default suggestions. Returns the search
 * box and the first suggestion, once it is in view inside the modal's scrolling body.
 */
async function openSkillSearch(page: Page, dialog: Locator) {
  await dialog.getByRole("button", { name: "+ Add skill", exact: true }).click();
  const search = dialog.getByPlaceholder("Search skills...");
  await search.click(); // a click opens the default suggestions
  const option = search.locator("xpath=following-sibling::div[1]").getByRole("button").first();
  await visible(option);
  // the list is not clipped by the modal body: the option is inside the scroller's box
  const optionBox = await option.boundingBox();
  const bodyBox = await dialog.evaluate((el) => {
    // the modal's scrolling body is its first overflow-y: auto descendant
    const body = Array.from(el.querySelectorAll<HTMLElement>("*")).find((node) => getComputedStyle(node).overflowY === "auto");
    const rect = (body ?? el).getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  });
  const clipped =
    !optionBox ||
    optionBox.y < bodyBox.top || optionBox.y + optionBox.height > bodyBox.bottom ||
    optionBox.x < bodyBox.left || optionBox.x + optionBox.width > bodyBox.right;
  expect(clipped, "skill suggestion clipped by the modal body").toBe(false);
  return { search, option };
}

describe("onboarding", () => {
  it("1. a new unreferred user goes through every step and lands on the dashboard", async () => {
    const user = await createUser(runId, "fresh", "Casey Freshstart");
    const page = await openAs(user);

    // the dashboard gate sends a brand-new signup to setup
    await page.goto("/dashboard");
    await page.waitForURL(/\/onboarding$/);

    // welcome
    await visible(button(page, "Let's start"));
    await visible(button(page, "I'll explore on my own"));
    await visible(button(page, "Skip setup"));
    expect(await currentStepLabel(page)).toBeNull();
    await shot(page, "s1-desktop-01-welcome");
    // a double click lands its second click on the next screen's "Continue" (same spot): it
    // must be ignored while the first move is still saving, not skip profile unseen
    await button(page, "Let's start").dblclick();

    // profile
    await visible(button(page, "Skip this step"));
    expect(await currentStepLabel(page)).toContain("Profile");
    await shot(page, "s1-desktop-02-profile");
    await button(page, "Skip this step").click();

    // connect: popular people, no referrer
    await visible(page.getByRole("heading", { name: "Add your first connection" }));
    expect(await currentStepLabel(page)).toContain("Connect");
    const suggested = page.getByRole("region", { name: "Suggested for you" });
    const connectButtons = suggested.getByRole("button", { name: /^Connect with / });
    await visible(connectButtons.first());
    expect(await connectButtons.count()).toBeGreaterThan(0);
    await visible(page.getByRole("textbox", { name: "Search people by name" }));
    expect(await page.getByText("Invited you").count()).toBe(0);
    await shot(page, "s1-desktop-03-connect");

    // sending refetches the suggestions (the BE then leaves the person out); they stay put here
    const refetched = page.waitForResponse((res) => res.url().includes("/api/onboarding/suggestions") && res.ok());
    const targetName = await sendRequestVia(page, connectButtons.first());
    await refetched;
    const targetItem = suggested.getByRole("listitem").filter({ hasText: targetName });
    await visible(targetItem.getByText("✓ Request sent", { exact: true }));
    expect(await targetItem.getByRole("button").count()).toBe(0);
    await shot(page, "s1-desktop-04-connect-sent");
    await button(page, "Continue").click();

    // invite
    await visible(button(page, "Copy link"));
    expect(await currentStepLabel(page)).toContain("Invite");
    for (const target of ["WhatsApp", "LinkedIn", "Email"]) {
      await visible(page.getByRole("link", { name: `Share on ${target}` })); // links once the profile handle loads
    }
    await shot(page, "s1-desktop-05-invite");
    await button(page, "Copy link").click();
    await visible(button(page, "✓ Copied"));
    await shot(page, "s1-desktop-06-invite-copied");
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(`${FE_URL}/invite/${user.handle}`);
    await button(page, "Finish").click();

    // done
    await visible(page.getByRole("heading", { name: "You're on the map" }));
    await visible(page.getByText(`Request sent to ${targetName}`));
    await shot(page, "s1-desktop-07-done");
    await button(page, "Go to dashboard").click();

    // dashboard: no loop back into setup, and since profile was skipped the (dismissible)
    // reminder is there even though the flow is completed
    await page.waitForURL(/\/dashboard$/);
    await gotoDashboard(page);
    expect(new URL(page.url()).pathname).toBe("/dashboard");
    await visible(reminder(page));
    await visible(reminder(page).getByText("Finish setup"));
    await visible(reminder(page).getByRole("button", { name: "Hide setup reminder" }));
    await shot(page, "s1-desktop-08-dashboard");
    // the dashboard gate's marker is now set for this user, so later loads skip the BE check
    expect(await markerCookie(page)).toBe(user.id);

    const flag = await onboardingFlag(user);
    expect(flag).toMatchObject({ status: "completed", current_step: 4, steps: { profile: "skipped", connect: "done", invite: "done" } });
    const sent = await sentRequests(user);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ name: targetName, requester_note: NOTE });
  });

  it("2. a referred user finds the referrer first, connects, and the state survives a reload", async () => {
    const referrer = await createUser(runId, "referrer", "Robin Referrer");
    const user = await createUser(runId, "referred", "Riley Referred", referrer.handle);
    const page = await openAs(user);

    // the invite link a referred user lands on after sign-in goes to setup first
    await page.goto(`/invite/${referrer.handle}`);
    await page.waitForURL(/\/onboarding$/);
    await visible(button(page, "Let's start"));
    await shot(page, "s2-desktop-01-welcome");
    await button(page, "Let's start").click();
    await button(page, "Skip this step").click();

    await visible(page.getByRole("heading", { name: "Add your first connection" }));
    const referrerButton = page.getByRole("button", { name: `Connect with ${referrer.name}`, exact: true });
    await visible(referrerButton);
    await visible(page.getByText("Invited you"));
    // the referrer card comes before the suggestions
    const invitedBox = await page.getByText("Invited you").boundingBox();
    const suggestedBox = await page.getByRole("region", { name: "Suggested for you" }).boundingBox();
    expect(invitedBox && suggestedBox && invitedBox.y < suggestedBox.y).toBe(true);
    expect(await page.getByRole("region", { name: "Suggested for you" }).getByText(referrer.name).count()).toBe(0);
    await shot(page, "s2-desktop-02-connect-referrer");

    expect(await sendRequestVia(page, referrerButton)).toBe(referrer.name);
    await visible(page.getByText("✓ Request sent", { exact: true }).first());
    expect(await referrerButton.count()).toBe(0);
    await shot(page, "s2-desktop-03-connect-sent");

    // reload: resumes on connect, and the request still shows as sent (from the BE relation)
    await page.reload();
    await visible(page.getByRole("heading", { name: "Add your first connection" }));
    expect(await currentStepLabel(page)).toContain("Connect");
    await visible(page.getByText("Invited you"));
    await visible(page.getByText("✓ Request sent", { exact: true }).first());
    expect(await referrerButton.count()).toBe(0);
    await shot(page, "s2-desktop-04-connect-after-reload");

    const sent = await sentRequests(user);
    expect(sent.map((row) => row.addressee_id)).toEqual([referrer.id]);
    expect(await onboardingFlag(user)).toMatchObject({ status: "in_progress", current_step: 2, steps: { profile: "skipped", connect: "done" } });

    // the referrer sees it as an incoming request
    const pending = await callAs<{ requester_id: string }[]>(referrer, "GET", "/connection/request/pending");
    expect(pending.body.map((row) => row.requester_id)).toContain(user.id);
  });

  it("3. skipping setup shows the reminder; resume and hide both work", async () => {
    const user = await createUser(runId, "skipper", "Sam Skipper");
    const page = await openAs(user);
    const writes = recordFlagWrites(page);

    // "Skip setup" is in the header from first paint, before the flags have loaded
    await page.goto("/onboarding");
    await visible(button(page, "Skip setup"));
    await button(page, "Skip setup").click();
    await page.waitForURL(/\/dashboard$/);
    await gotoDashboard(page);
    await visible(reminder(page));
    await visible(reminder(page).getByText("Finish setup"));
    await shot(page, "s3-desktop-01-dashboard-reminder");
    expect(await onboardingFlag(user), `PATCHes sent: ${JSON.stringify(writes)}`).toMatchObject({ status: "skipped" });

    // Resume opens setup at the first task not done: profile
    await reminder(page).getByRole("link", { name: /Resume/ }).click();
    await page.waitForURL(/\/onboarding/);
    await visible(button(page, "Skip this step"));
    expect(await currentStepLabel(page)).toContain("Profile");
    await page.waitForURL(/\/onboarding$/); // ?step= is dropped once the flow opens
    await shot(page, "s3-desktop-02-resumed-profile");

    // back on the dashboard (no redirect: the flow is in progress, not new) the reminder is still there
    await gotoDashboard(page);
    expect(new URL(page.url()).pathname).toBe("/dashboard");
    await visible(reminder(page));
    await reminder(page).getByRole("button", { name: "Hide setup reminder" }).click();
    await reminder(page).waitFor({ state: "detached" });
    await shot(page, "s3-desktop-03-reminder-hidden");

    await gotoDashboard(page);
    expect(await reminder(page).count()).toBe(0);
    expect(await onboardingFlag(user)).toMatchObject({ reminder_dismissed: true });
  });

  it("4. an existing user without an onboarding flow is not redirected and sees no reminder", async () => {
    const user = await createUser(runId, "existing", "Erin Existing");
    // a pre-onboarding account: no user_flag row at all
    await testDb()`DELETE FROM user_flag WHERE user_id = ${user.id}::uuid`;
    expect(await onboardingFlag(user)).toBeUndefined();

    const page = await openAs(user);
    await gotoDashboard(page);
    await page.waitForTimeout(1000);
    expect(new URL(page.url()).pathname).toBe("/dashboard");
    expect(await reminder(page).count()).toBe(0);
    await shot(page, "s4-desktop-01-dashboard");
    // no flow at all is settled too: the marker is set, and the gate stops asking the BE
    await page.waitForFunction(() => document.cookie.includes("hops_onb="));
    expect(await markerCookie(page)).toBe(user.id);
  });

  it("5. mobile (360x780): no step scrolls sideways, nor does the dashboard", async () => {
    const user = await createUser(runId, "mobile", "Morgan Mobile");
    const page = await openAs(user, MOBILE);
    const overflows: string[] = [];
    const check = async (name: string) => {
      await page.waitForTimeout(300);
      const result = await hasHorizontalScroll(page);
      if (result.overflow) overflows.push(`${name}: scrollWidth ${result.scrollWidth} > ${result.innerWidth}`);
      await shot(page, `s5-mobile-${name}`);
    };

    await page.goto("/dashboard");
    await page.waitForURL(/\/onboarding$/);
    await visible(button(page, "Let's start"));
    await check("01-welcome");
    await button(page, "Let's start").click();

    await visible(button(page, "Skip this step"));
    await check("02-profile");
    await button(page, "Skip this step").click();

    await visible(page.getByRole("heading", { name: "Add your first connection" }));
    const connectButtons = page.getByRole("region", { name: "Suggested for you" }).getByRole("button", { name: /^Connect with / });
    await visible(connectButtons.first());
    await check("03-connect");
    await sendRequestVia(page, connectButtons.first());
    await visible(page.getByText("✓ Request sent", { exact: true }).first());
    await check("04-connect-sent");
    await button(page, "Continue").click();

    await visible(button(page, "Copy link"));
    await check("05-invite");
    await button(page, "Copy link").click();
    await visible(button(page, "✓ Copied"));
    await button(page, "Finish").click();

    await visible(page.getByRole("heading", { name: "You're on the map" }));
    await check("06-done");
    await button(page, "Go to dashboard").click();
    await page.waitForURL(/\/dashboard$/);
    await gotoDashboard(page);
    await check("07-dashboard");
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const footer = await hasHorizontalScroll(page);
    if (footer.overflow) overflows.push(`08-dashboard-footer: scrollWidth ${footer.scrollWidth} > ${footer.innerWidth}`);
    await shot(page, "s5-mobile-08-dashboard-footer", { fullPage: false });

    expect(overflows).toEqual([]);
  });

  it("6. mobile (360x780): a search result with a very long headline doesn't scroll sideways", async () => {
    const tag = `Longline${runId}`.replace(/[^a-z0-9]/gi, "");
    const target = await createUser(runId, "longline", `Lenny ${tag}`);
    const headline =
      "Backend engineer @ Tamara | MLH top 50 | Ex-engineering @ Keychain | Hack4TKM 2024 winner | Open source maintainer";
    const saved = await callAs(target, "PATCH", "/profile", { title: headline });
    expect(saved.status, JSON.stringify(saved.body)).toBe(200);

    const user = await createUser(runId, "searcher", "Sky Searcher");
    const page = await openAs(user, MOBILE);
    await page.goto("/onboarding?step=connect");
    await visible(page.getByRole("heading", { name: "Add your first connection" }));
    await page.getByRole("textbox", { name: "Search people by name" }).fill(tag);

    const results = page.getByRole("region", { name: "Search results" });
    const row = results.getByRole("listitem").filter({ hasText: target.name });
    await visible(row);
    await visible(row.getByText(headline));
    await visible(row.getByRole("button", { name: `Connect with ${target.name}` }));
    await page.waitForTimeout(300);

    const scroll = await hasHorizontalScroll(page);
    await shot(page, "s6-mobile-01-search-long-headline");
    expect(scroll, `scrollWidth ${scroll.scrollWidth} > ${scroll.innerWidth}`).toMatchObject({ overflow: false });
    // the row itself fits the screen, and the headline is cut rather than wrapped or spilled
    const box = await row.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= MOBILE.width).toBe(true);
    const connect = await row.getByRole("button", { name: `Connect with ${target.name}` }).boundingBox();
    expect(connect && connect.x + connect.width <= MOBILE.width).toBe(true);
  });

  it("7. a filled profile shows what was filled in, and edits in a modal without leaving setup", async () => {
    const user = await createUser(runId, "filled", "Fiona Filled");
    await seedProfile(user, 8);
    const page = await openAs(user);
    await openProfileStep(page);

    // the real profile, latest roles first, capped, with no placeholder sketch
    const panel = filledPanel(page);
    await visible(panel);
    await visible(panel.getByText(SEED_TITLE));
    await visible(panel.getByText("Backend engineer · Keychain"));
    await visible(panel.getByText("Intern · Tamara"));
    expect(await panel.getByText("Volunteer · Hack4TKM").count()).toBe(0); // only the 2 latest
    await visible(panel.getByText("IIT Bombay · B.Tech"));
    await visible(panel.getByText("+2 more"));
    expect(await panel.getByText("Nothing yet").count()).toBe(0);
    expect(await page.getByText("What we fill in", { exact: true }).count()).toBe(0);
    // the name is read once: the avatar beside it is decorative
    expect(await panel.getByText(user.name, { exact: true }).count()).toBe(1);
    expect(await panel.getByRole("img").count()).toBe(0);
    await profileResult(user, "done"); // the profile already had details
    await visible(page.getByRole("heading", { level: 1, name: "Your profile is ready" }));
    await shot(page, "s7-desktop-01-filled-panel");

    // "Edit details" opens the profile editor in place
    expect(await page.getByRole("link", { name: "View profile" }).count()).toBe(0);
    await button(page, "Edit details").click();
    const dialog = page.getByRole("dialog", { name: "Edit your details" });
    await visible(dialog);
    const roles = dialog.getByRole("textbox", { name: "Role", exact: true });
    expect(await roles.count()).toBe(3);
    expect(await roles.nth(1).inputValue()).toBe("Backend engineer");
    await shot(page, "s7-desktop-02-edit-modal", { fullPage: false });

    // Escape discards
    await roles.nth(1).fill("Discarded title");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await visible(panel.getByText("Backend engineer · Keychain"));

    // Escape in the skill search closes only the search: the modal and its edits stay
    await button(page, "Edit details").click();
    await visible(dialog);
    const title = dialog.getByRole("textbox", { name: "Title", exact: true });
    await title.fill("Edited headline");
    await visible(dialog.getByText("Skills save as you add them."));
    const { search } = await openSkillSearch(page, dialog);
    await shot(page, "s7-desktop-03-skill-search", { fullPage: false });
    await page.keyboard.press("Escape");
    await search.waitFor({ state: "detached" });
    await page.waitForTimeout(300);
    expect(await dialog.isVisible()).toBe(true);
    expect(await title.inputValue()).toBe("Edited headline");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });

    // edit and save: the modal closes and the panel shows the saved role
    await button(page, "Edit details").click();
    await visible(dialog);
    expect(await roles.nth(1).inputValue()).toBe("Backend engineer");
    await roles.nth(1).fill("Principal engineer");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await visible(page.getByText("Profile updated"));
    await visible(panel.getByText("Principal engineer · Keychain"));
    expect(new URL(page.url()).pathname).toBe("/onboarding");
    await shot(page, "s7-desktop-04-after-save");

    const saved = await callAs<{ experience: { role: string; company: string }[] }>(user, "GET", `/profile/${user.handle}`);
    expect(saved.body.experience.map((row) => row.role)).toContain("Principal engineer");
  });

  it("8. \"Fill it in myself\" edits in a modal; saving an experience marks the step done", async () => {
    const user = await createUser(runId, "manual", "Max Manual");
    const page = await openAs(user);
    await openProfileStep(page);
    await visible(page.getByText("What we fill in", { exact: true }));
    expect(await button(page, "Fill it in myself").isEnabled()).toBe(true); // the profile has loaded

    // closing without saving leaves the step as it was
    await button(page, "Fill it in myself").click();
    const dialog = page.getByRole("dialog", { name: "Fill in your profile" });
    await visible(dialog);
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    expect(new URL(page.url()).pathname).toBe("/onboarding");
    expect((await onboardingFlag(user))?.steps.profile).toBeUndefined();

    await button(page, "Fill it in myself").click();
    await visible(dialog);
    const experience = dialog.locator("section").filter({ has: page.getByRole("heading", { name: "Experience", exact: true }) });
    // a brand-new profile has no email of its own yet: the sign-in one shows
    expect(await dialog.getByRole("textbox", { name: "Email (not editable)" }).inputValue()).toBe(user.email);
    // a skill saves at once (it may create the profile row) and must not make the save stale
    const { option } = await openSkillSearch(page, dialog);
    const skillName = ((await option.textContent()) ?? "").trim();
    await option.dispatchEvent("mousedown");
    await visible(dialog.getByRole("button", { name: `Remove ${skillName}` }));
    await page.keyboard.press("Escape"); // closes the search, not the modal
    await visible(dialog);
    await experience.getByRole("button", { name: "+ Add", exact: true }).click();
    await dialog.getByRole("textbox", { name: "Role", exact: true }).fill("Founder");
    await dialog.getByRole("textbox", { name: "Company", exact: true }).fill("Six Hops Labs");
    await shot(page, "s8-desktop-01-manual-modal", { fullPage: false });
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });

    const panel = filledPanel(page);
    await visible(panel.getByText("Founder · Six Hops Labs"));
    await visible(panel.getByText(skillName, { exact: true }));
    await visible(panel.getByText("Nothing yet").first()); // no education yet
    await visible(button(page, "Edit details"));
    // the button that opened the modal is gone; focus lands on its replacement, not the page
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Edit details");
    expect(new URL(page.url()).pathname).toBe("/onboarding");
    await profileResult(user, "done");
    await shot(page, "s8-desktop-02-manual-saved");
  });

  it("9. mobile (360x780): the filled summary shows, and the edit modal fits with Save in reach", async () => {
    const user = await createUser(runId, "mobilefill", "Mia Mobilefill");
    await seedProfile(user, 3);
    const page = await openAs(user, MOBILE);
    await openProfileStep(page);

    // the side panel is hidden on phones; the compact summary sits under the success message
    const summary = filledPanel(page);
    await visible(summary);
    expect(await summary.count()).toBe(1);
    await visible(summary.getByText("Backend engineer · Keychain"));
    await visible(summary.getByText(user.name, { exact: true }));
    await page.waitForTimeout(300);
    expect(await hasHorizontalScroll(page)).toMatchObject({ overflow: false });
    await shot(page, "s9-mobile-01-filled-summary");

    await button(page, "Edit details").click();
    const dialog = page.getByRole("dialog", { name: "Edit your details" });
    await visible(dialog);
    await page.waitForTimeout(300);
    expect(await hasHorizontalScroll(page)).toMatchObject({ overflow: false });
    const box = await dialog.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= MOBILE.width && box.y >= 0 && box.y + box.height <= MOBILE.height).toBe(true);
    // the body scrolls, not sideways
    const body = await dialog.evaluate((el) => {
      const scroller = Array.from(el.querySelectorAll<HTMLElement>("*")).find((node) => getComputedStyle(node).overflowY === "auto");
      return scroller ? { scrollWidth: scroller.scrollWidth, clientWidth: scroller.clientWidth } : null;
    });
    expect(body && body.scrollWidth <= body.clientWidth, JSON.stringify(body)).toBe(true);
    // Save sits in the footer, in view without scrolling
    const save = dialog.getByRole("button", { name: "Save", exact: true });
    const saveBox = await save.boundingBox();
    expect(saveBox && saveBox.y >= 0 && saveBox.y + saveBox.height <= MOBILE.height && saveBox.x + saveBox.width <= MOBILE.width).toBe(true);
    await shot(page, "s9-mobile-02-edit-modal", { fullPage: false });

    // the skill suggestions show inside the modal at this width, without sideways scroll
    await openSkillSearch(page, dialog);
    expect(await hasHorizontalScroll(page)).toMatchObject({ overflow: false });
    await shot(page, "s9-mobile-03-skill-search", { fullPage: false });
    await page.keyboard.press("Escape");
    await visible(dialog);

    // and it still works from the bottom of the form
    await dialog.getByRole("textbox", { name: "Role", exact: true }).nth(1).fill("Staff engineer");
    await save.click();
    await dialog.waitFor({ state: "hidden" });
    await visible(summary.getByText("Staff engineer · Keychain"));
    expect(new URL(page.url()).pathname).toBe("/onboarding");
    await shot(page, "s9-mobile-04-after-save");
  });
});
