import { describe, it, expect } from "vitest";
import { keepRequested, normalizeSuggestion, normalizeSuggestions, suggestionStatus, type Suggestion } from "./suggestions";

const ravi = {
  id: "u-ravi",
  user_id: "ravi-iyer",
  name: "Ravi Iyer",
  icon: null,
  headline: "Engineering manager",
  connection_count: 48,
  reason: "referrer",
  relation: "none",
};
const arjun = { ...ravi, id: "u-arjun", user_id: "arjun", name: "Arjun Rao", reason: "popular", connection_count: 214 };

describe("normalizeSuggestion", () => {
  it("defaults every optional field", () => {
    expect(normalizeSuggestion({ id: "u1" })).toEqual({
      id: "u1",
      user_id: "",
      name: "",
      icon: null,
      headline: null,
      connection_count: 0,
      reason: "popular",
      relation: "none",
    });
  });

  it("drops rows without an id and coerces bad values", () => {
    expect(normalizeSuggestion({ name: "No id" })).toBeNull();
    expect(normalizeSuggestion(null)).toBeNull();
    const row = normalizeSuggestion({ id: "u1", connection_count: "12", relation: "bogus", headline: "  " });
    expect(row?.connection_count).toBe(12);
    expect(row?.relation).toBe("none");
    expect(row?.headline).toBeNull();
  });
});

describe("normalizeSuggestions", () => {
  it("returns [] for anything but an array", () => {
    expect(normalizeSuggestions(null)).toEqual([]);
    expect(normalizeSuggestions({ error: "x" })).toEqual([]);
  });

  it("puts the referrer first and lists each person once", () => {
    const rows = normalizeSuggestions([arjun, ravi, { ...ravi, reason: "popular" }]);
    expect(rows.map((row) => row.id)).toEqual(["u-ravi", "u-arjun"]);
    expect(rows[0].reason).toBe("referrer");
  });

  it("keeps at most one referrer", () => {
    const rows = normalizeSuggestions([ravi, { ...arjun, reason: "referrer" }]);
    expect(rows.filter((row) => row.reason === "referrer")).toHaveLength(1);
  });
});

describe("suggestionStatus", () => {
  it("maps the BE relation onto the shared connection status", () => {
    expect(suggestionStatus("none", false)).toBe("none");
    expect(suggestionStatus("request_sent", false)).toBe("outgoing");
    expect(suggestionStatus("request_received", false)).toBe("incoming");
    expect(suggestionStatus("connected", true)).toBe("connected");
  });

  it("counts a request sent this session before the list refetches", () => {
    expect(suggestionStatus("none", true)).toBe("outgoing");
  });
});

describe("keepRequested", () => {
  const person = (id: string): Suggestion => ({
    id, user_id: id, name: id, icon: null, headline: null, connection_count: 3, reason: "popular", relation: "none",
  });
  const [a, b, c, d, e, f] = ["a", "b", "c", "d", "e", "f"].map(person);
  const ids = (rows: Suggestion[]) => rows.map((row) => row.id);

  it("is the fresh list when nothing was requested", () => {
    expect(ids(keepRequested([a, b, c], [], 3))).toEqual(["a", "b", "c"]);
  });

  it("keeps a requested person where they were after the refetch drops them", () => {
    // b was requested from the middle; the BE now returns the next popular person instead
    expect(ids(keepRequested([a, c, d], [{ person: b, index: 1 }], 3))).toEqual(["a", "b", "c"]);
  });

  it("does not show a person twice before the refetch lands", () => {
    expect(ids(keepRequested([a, b, c], [{ person: b, index: 1 }], 3))).toEqual(["a", "b", "c"]);
  });

  it("keeps everyone requested, even past the limit", () => {
    const pinned = [a, b, c].map((p, index) => ({ person: p, index }));
    expect(ids(keepRequested([d, e, f], pinned, 3))).toEqual(["a", "b", "c"]);
    expect(ids(keepRequested([d, e, f], [...pinned, { person: d, index: 3 }], 3))).toEqual(["a", "b", "c", "d"]);
  });

  it("clamps an index past the end", () => {
    expect(ids(keepRequested([a], [{ person: b, index: 9 }], 3))).toEqual(["a", "b"]);
  });
});
