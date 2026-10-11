/**
 * A made-up network for the public landing page. No real user is ever in it:
 * the landing graph only has to *look* like a living 6 hops network, so it is
 * generated, not fetched.
 *
 * Shape: a few larger clusters grown by preferential attachment (so hubs
 * emerge the way they do in real networks), a tail of small groups, the odd
 * bridge between clusters, and some people with no connections at all.
 */

export interface SampleNode {
  id: string;
  /** Which avatar variant to draw, 0..LOOK_COUNT-1. */
  look: number;
  /** Number of edges touching this node. */
  links: number;
}

export interface SampleEdge {
  source: string;
  target: string;
}

export interface SampleNetwork {
  nodes: SampleNode[];
  edges: SampleEdge[];
  stats: { people: number; connections: number; isolated: number };
}

export interface SampleNetworkOptions {
  /** Total number of people, connected and isolated. */
  size: number;
  /** Same seed, same network. */
  seed?: number;
  /** Share of people with no connections, 0..1. */
  isolatedShare?: number;
}

/** Matches the number of sample faces (lib/utils/sampleAvatars). */
export const LOOK_COUNT = 24;

/** mulberry32: tiny, fast, and good enough for picking layouts. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cluster sizes for `connected` people: a couple of big ones, then a tail of
 * small groups. Every cluster has at least two people (a lone person is an
 * isolated node, not a cluster).
 */
function clusterSizes(connected: number, random: () => number): number[] {
  const sizes: number[] = [];
  let left = connected;
  const big = [0.3, 0.2, 0.12];

  for (const share of big) {
    const size = Math.round(connected * share * (0.8 + random() * 0.4));
    if (size < 2 || size > left) break;
    sizes.push(size);
    left -= size;
  }
  while (left >= 2) {
    const size = Math.min(left, 2 + Math.floor(random() * 5));
    sizes.push(size);
    left -= size;
  }
  // a remainder of one joins the last cluster rather than becoming a fake single
  if (left === 1 && sizes.length > 0) sizes[sizes.length - 1] += 1;
  return sizes;
}

export function generateSampleNetwork({ size, seed = 6, isolatedShare = 0.2 }: SampleNetworkOptions): SampleNetwork {
  const random = createRandom(seed);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];

  const isolatedCount = size < 2 ? size : Math.round(size * Math.min(Math.max(isolatedShare, 0), 1));
  const connectedCount = size - isolatedCount;

  const nodes: SampleNode[] = Array.from({ length: size }, (_, i) => ({
    id: `n${i}`,
    look: Math.floor(random() * LOOK_COUNT),
    links: 0,
  }));

  const edges: SampleEdge[] = [];
  const seen = new Set<string>();
  const connect = (a: number, b: number) => {
    if (a === b) return false;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return false;
    seen.add(key);
    edges.push({ source: nodes[a].id, target: nodes[b].id });
    nodes[a].links++;
    nodes[b].links++;
    return true;
  };

  const clusters: number[][] = [];
  let next = 0;
  for (const clusterSize of clusterSizes(connectedCount, random)) {
    const members = Array.from({ length: clusterSize }, (_, i) => next + i);
    next += clusterSize;
    clusters.push(members);

    // Preferential attachment: each newcomer links to someone already in,
    // weighted by how connected they are. `pool` lists a member once per edge
    // end (plus once on joining), so popular people get picked more often.
    const pool = [members[0]];
    for (const member of members.slice(1)) {
      const target = pick(pool);
      connect(member, target);
      pool.push(member, target);
    }

    // a few extra edges inside bigger clusters, so they are not pure trees
    const extra = Math.floor(clusterSize * 0.3);
    for (let i = 0; i < extra; i++) connect(pick(members), pick(pool));
  }

  // occasional bridges, so some clusters are a hop or two from each other
  for (let i = 1; i < clusters.length; i++) {
    if (random() < 0.5) connect(pick(clusters[i]), pick(pick(clusters.slice(0, i))));
  }

  return {
    nodes,
    edges,
    stats: { people: size, connections: edges.length, isolated: isolatedCount },
  };
}
