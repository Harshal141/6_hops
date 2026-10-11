/** Landing page copy, shared by every section. Sentence case, no dash-asides (CLAUDE.md §10). */

export const HERO = {
  // non-breaking space: the name never splits across lines
  title: "Welcome to 6 hops",
  lead: "Everyone you want to meet is a few people away. Map who you know, and see the path to anyone.",
  cta: "[ Start discovery ]",
  ctaHref: "/dashboard",
  secondary: "How it works",
  secondaryHref: "#how-it-works",
};

export type FeatureId = "path" | "strong" | "graph" | "discover" | "resume" | "invite";

export interface Feature {
  title: string;
  body: string;
}

export const FEATURES: Record<FeatureId, Feature> = {
  path: {
    title: "The path to anyone",
    body: "Look someone up and see the chain of people between you and them, up to six hops.",
  },
  strong: {
    title: "Only strong connections",
    body: "Every connection comes with a short note on how you know each other.",
  },
  graph: {
    title: "Your network in 3D",
    body: "Your connections and theirs, as a graph you can spin, zoom and click through.",
  },
  discover: {
    title: "Discover people",
    body: "Search for anyone on 6 hops by name and see how many hops away they are.",
  },
  resume: {
    title: "A profile from your resume",
    body: "Upload a PDF, then review what it found before anything is saved.",
  },
  invite: {
    title: "Invite with a link",
    body: "Share your link. Friends who join through it land straight on your profile.",
  },
};

export const STEPS: Feature[] = [
  {
    title: "Sign in",
    body: "Use LinkedIn or Google. Your name and photo come with you, so there are no forms to fill in.",
  },
  {
    title: "Add your people",
    body: "Send a request with a line on why you know them. Once they accept, you are connected.",
  },
  {
    title: "Follow the hops",
    body: "Search for the person you want to reach and see who can introduce you.",
  },
];

export const CLOSING = {
  title: "How many hops away is the person you want to meet?",
  body: "It takes a minute to find out.",
};

/** Made-up people for the demos. `face` indexes lib/utils/sampleAvatars. */
export interface DemoPerson {
  name: string;
  title: string;
  face: number;
}

export const PEOPLE = {
  maya: { name: "Maya Chen", title: "Product designer", face: 3 },
  arjun: { name: "Arjun Rao", title: "Backend engineer", face: 8 },
  priya: { name: "Priya Shah", title: "Founder", face: 14 },
  leo: { name: "Leo Fischer", title: "Design lead", face: 5 },
  sofia: { name: "Sofia Nguyen", title: "Marketing lead", face: 19 },
  noah: { name: "Noah Williams", title: "Investor", face: 11 },
  ava: { name: "Ava Martinez", title: "Data scientist", face: 22 },
  omar: { name: "Omar Haddad", title: "Product manager", face: 1 },
  kai: { name: "Kai Tanaka", title: "Recruiter", face: 16 },
} satisfies Record<string, DemoPerson>;
