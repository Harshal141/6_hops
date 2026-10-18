"use client";

import { useId, useState } from "react";
import { ConnectRequestModal, ConnectionStatusAction } from "../connections";
import { EmptyState, Input, LineIcon, Spinner } from "../ui";
import { useSearchUsers } from "@/lib/hooks/connection";
import {
  keepRequested, suggestionStatus, useSuggestions, type PinnedSuggestion, type Suggestion,
} from "@/lib/hooks/suggestions";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { countLabel, firstName } from "@/lib/utils/onboarding";
import { PeopleList, type PersonItem } from "./PeopleList";
import { ReferrerCard } from "./ReferrerCard";
import { SectionLabel } from "./SectionLabel";
import { StepHeading } from "./StepHeading";

/** A request sent during this visit. `pin` keeps a suggested person in place after the refetch drops them. */
export interface SentRequest {
  id: string;
  name: string;
  pin?: PinnedSuggestion;
}

interface ConnectStepProps {
  /** Requests sent during this visit, oldest first. */
  sent: readonly SentRequest[];
  /** A request went out: marks the task done. */
  onSent: (request: SentRequest) => void;
}

const SUGGESTION_LIMIT = 3;
const SEARCH_LIMIT = 6;

/** "214 connections", or nothing for someone with none yet ("0 connections" reads as a warning). */
const connectionsLabel = (count: number) => (count > 0 ? countLabel(count, "connection") : undefined);

function suggestionItem(person: Suggestion, sentIds: ReadonlySet<string>): PersonItem {
  return {
    id: person.id,
    name: person.name,
    icon: person.icon,
    subtitle: person.headline,
    meta: connectionsLabel(person.connection_count),
    status: suggestionStatus(person.relation, sentIds.has(person.id)),
  };
}

/** Step 2: the referrer first if there is one, then suggestions, plus a search by name. */
export function ConnectStep({ sent, onSent }: ConnectStepProps) {
  const labelId = useId();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim());
  const suggestions = useSuggestions(SUGGESTION_LIMIT);
  const search = useSearchUsers(debounced);
  const [target, setTarget] = useState<SentRequest | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const sentIds = new Set(sent.map((request) => request.id));
  const pinned = sent.flatMap((request) => (request.pin ? [request.pin] : []));
  const referrer = suggestions.data?.find((person) => person.reason === "referrer");
  const popular = keepRequested(
    (suggestions.data ?? []).filter((person) => person !== referrer),
    pinned,
    SUGGESTION_LIMIT,
  );
  const others = popular.map((person) => suggestionItem(person, sentIds));
  const results: PersonItem[] = (search.data ?? []).slice(0, SEARCH_LIMIT).map((user) => ({
    id: user.id,
    name: user.name,
    icon: user.icon,
    subtitle: user.title,
    status: user.is_connected
      ? "connected"
      : sentIds.has(user.id)
        ? "outgoing"
        : (user.pending_direction ?? "none"),
  }));

  const searching = debounced.length > 0;
  const loading = searching ? search.isLoading : suggestions.isLoading;
  const failed = searching ? search.isError : suggestions.isError;
  const people = searching ? results : others;

  // From the suggested list, remember where the person sat so they stay there once requested.
  const connectFrom = ({ id, name }: PersonItem) => {
    const index = searching ? -1 : popular.findIndex((person) => person.id === id);
    setTarget({ id, name, pin: index >= 0 ? { person: popular[index], index } : undefined });
  };
  const requestSent = (request: SentRequest) => {
    setAnnouncement(`Request sent to ${request.name}`);
    onSent(request);
  };

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px]">
      <StepHeading title="Add your first connection" lead="Pick someone you know. You'll add a line on how." />

      {referrer && !searching && (
        <ReferrerCard
          name={referrer.name}
          icon={referrer.icon}
          detail={[referrer.headline, connectionsLabel(referrer.connection_count)].filter(Boolean).join(" · ")}
          action={
            <ConnectionStatusAction
              status={suggestionStatus(referrer.relation, sentIds.has(referrer.id))}
              targetName={referrer.name}
              connectLabel={`Connect with ${firstName(referrer.name) || referrer.name}`}
              size="lg"
              fullWidth="mobile"
              sentLabel="✓ Request sent"
              onConnect={() => setTarget({ id: referrer.id, name: referrer.name })}
            />
          }
        />
      )}

      <section aria-labelledby={labelId} className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionLabel id={labelId}>{searching ? "Search results" : "Suggested for you"}</SectionLabel>
          <div className="sm:w-[260px]">
            <Input
              value={query}
              onChange={setQuery}
              placeholder="Search by name"
              ariaLabel="Search people by name"
              adornment={<LineIcon name="search" size={14} strokeWidth={2} />}
            />
          </div>
        </div>

        {/* The one live region for this step: list changes, and each request sent (the rows'
            "✓ Request sent" labels are deliberately not live regions of their own). */}
        <div aria-live="polite" aria-busy={loading || undefined} className="min-w-0">
          <p className="sr-only">{announcement}</p>
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : failed ? (
            <EmptyState
              message={searching ? "Search isn't working right now." : "Couldn't load suggestions."}
              hint="Try again in a moment."
            />
          ) : people.length > 0 ? (
            <PeopleList people={people} onConnect={connectFrom} />
          ) : !searching && referrer ? null : (
            <EmptyState
              message={searching ? `No one found for "${debounced}"` : "No suggestions yet"}
              hint={searching ? "Check the spelling, or invite them in the next step." : "Search by name to find someone you know."}
            />
          )}
        </div>
      </section>

      {target && (
        <ConnectRequestModal
          targetId={target.id}
          targetName={target.name}
          onSent={() => requestSent(target)}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
