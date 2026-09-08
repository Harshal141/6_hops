import type { EgoNetwork, EgoNetworkPerson } from "@/lib/hooks/connection";

export const FALLBACK_ICON = "/user-fallback.jpg";

const FIRST_DEGREE = [
  { name: "Maya Chen", title: "Product Designer" },
  { name: "Ethan Brooks", title: "Software Engineer" },
  { name: "Priya Sharma", title: "Data Scientist" },
  { name: "Liam Carter", title: "Founder" },
  { name: "Sofia Nguyen", title: "Marketing Lead" },
  { name: "Noah Williams", title: "Investor" },
];

// how many second-degree connections branch off each of the six above, in
// order — an uneven spread so the demo graph reads like a real network
// rather than a uniform grid
const SECOND_DEGREE_COUNTS = [2, 4, 5, 10, 0, 0];

const SECOND_DEGREE_NAMES = [
  "Ava Martinez", "Lucas Bennett", "Zoe Anderson", "Mason Clark", "Isla Robinson",
  "Oliver James", "Grace Kim", "Henry Wright", "Chloe Bishop", "Leo Fischer",
  "Ruby Patel", "Jack Sullivan", "Nora Alvarez", "Felix Hoffman", "Ivy Morgan",
  "Owen Reilly", "Layla Novak", "Theo Bradley", "Willa Santos", "Miles Turner",
  "Aria Foster",
];

/**
 * A realistic-looking sample network for a brand-new user with no
 * connections yet: `me` at the center, six first-degree connections around
 * them, and a varied spread of second-degree connections branching off four
 * of those six — so the preview shows what a well-grown graph looks like.
 */
export function buildPreviewNetwork(me: EgoNetworkPerson): EgoNetwork {
  const people: EgoNetworkPerson[] = [me];
  const edges: { source: string; target: string }[] = [];

  let secondDegreeIndex = 0;
  FIRST_DEGREE.forEach((person, i) => {
    const id = `preview-1-${i}`;
    people.push({ id, name: person.name, title: person.title, icon: FALLBACK_ICON, degree: 1, viaId: null, handle: null });
    edges.push({ source: me.id, target: id });

    const count = SECOND_DEGREE_COUNTS[i] ?? 0;
    for (let j = 0; j < count; j++) {
      const secondId = `preview-2-${secondDegreeIndex}`;
      const name = SECOND_DEGREE_NAMES[secondDegreeIndex % SECOND_DEGREE_NAMES.length];
      people.push({ id: secondId, name, title: null, icon: FALLBACK_ICON, degree: 2, viaId: id, handle: null });
      edges.push({ source: id, target: secondId });
      secondDegreeIndex++;
    }
  });

  return { people, edges };
}
