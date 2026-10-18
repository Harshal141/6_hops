import type { ChildProcess } from "node:child_process";
import type { TestProject } from "vitest/node";
import { deleteRunUsers, loadConfig, startServers, stopProcess } from "./harness";

declare module "vitest" {
  export interface ProvidedContext {
    /** Unique per run; every user the run creates lives on `e2e-<runId>.invalid`. */
    e2eRunId: string;
  }
}

/** Starts both servers once for the whole suite, and removes the run's users afterwards. */
export default async function setup(project: TestProject) {
  loadConfig(); // fail fast, before spawning anything, if the DB target is unsafe
  const runId = process.env.E2E_RUN_ID ?? Date.now().toString(36);
  project.provide("e2eRunId", runId);

  let children: ChildProcess[] = [];
  children = await startServers();

  return async () => {
    try {
      if (process.env.E2E_KEEP_USERS !== "1") {
        const removed = await deleteRunUsers(runId);
        console.log(`[e2e] cleanup: deleted ${removed} test user(s) on e2e-${runId}.invalid`);
      }
    } finally {
      for (const child of children.reverse()) stopProcess(child);
    }
  };
}
