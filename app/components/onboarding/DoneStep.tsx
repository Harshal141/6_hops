"use client";

import { useConnectionRequests, useConnections } from "@/lib/hooks/connection";
import { useProfile } from "@/lib/hooks/profile";
import type { OnboardingFlow } from "@/lib/hooks/flags";
import { countLabel, joinNames } from "@/lib/utils/onboarding";
import { NetworkSketch, type SketchPerson } from "./NetworkSketch";
import { StepChecklist, type ChecklistItem } from "./StepChecklist";
import { StepHeading } from "./StepHeading";

const LATER = "It's on your dashboard";

interface DoneStepProps {
  steps: OnboardingFlow["steps"];
  /** People sent a request during this visit, in case the request list is still loading. */
  sent: readonly { id: string; name: string }[];
}

/** The finish screen: what setup did, and a first look at your network. */
export function DoneStep({ steps, sent }: DoneStepProps) {
  const { data: profile } = useProfile();
  const { data: requests } = useConnectionRequests();
  const { data: connections } = useConnections();

  const outgoing = (requests ?? []).filter((request) => request.direction === "outgoing");
  const people: SketchPerson[] = [
    ...outgoing.map((r) => ({ id: r.other_id, name: r.other_name, icon: r.other_icon, pending: true })),
    ...(connections ?? []).map((c) => ({ id: c.other_id, name: c.other_name, icon: c.other_icon, pending: false })),
  ];
  // Each person once, by id: this visit's sends usually also appear in the request list, and
  // two different people can share a name.
  const requestedById = new Map<string, string>();
  for (const { id, name } of sent) requestedById.set(id, name);
  for (const request of outgoing) requestedById.set(request.other_id, request.other_name);
  const requested = joinNames([...requestedById.values()]);
  const requestWord = requestedById.size === 1 ? "Request" : "Requests";

  const roles = profile?.experience.length ?? 0;
  const schools = profile?.education.length ?? 0;
  const profileNote = [roles && countLabel(roles, "role"), schools && countLabel(schools, "school")]
    .filter(Boolean)
    .join(" · ");

  const items: ChecklistItem[] = [
    steps.profile === "done"
      ? { key: "profile", done: true, label: "Profile filled in", note: profileNote || undefined }
      : { key: "profile", done: false, label: "Profile skipped", note: LATER },
    steps.connect === "done"
      ? { key: "connect", done: true, label: requested ? `${requestWord} sent to ${requested}` : "Connection request sent", note: "Pending" }
      : { key: "connect", done: false, label: "First connection skipped", note: LATER },
    steps.invite === "done"
      ? { key: "invite", done: true, label: "Invite link shared" }
      : { key: "invite", done: false, label: "Invite skipped", note: LATER },
  ];

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-[minmax(0,1fr)_340px] sm:items-center sm:gap-8">
      <div className="flex flex-col gap-[18px] sm:gap-6">
        <StepHeading title="You're on the map" lead="Search anyone and see how many hops away they are." />
        <StepChecklist items={items} />
      </div>
      <div className="order-first sm:order-none">
        <NetworkSketch me={{ name: profile?.name ?? "", icon: profile?.icon || null }} people={people} />
      </div>
    </div>
  );
}
