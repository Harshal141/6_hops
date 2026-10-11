import { describe, expect, it } from "vitest";
import { generateSampleNetwork, LOOK_COUNT } from "./sampleNetwork";

describe("generateSampleNetwork", () => {
  it("is deterministic for a seed", () => {
    expect(generateSampleNetwork({ size: 80, seed: 3 })).toEqual(generateSampleNetwork({ size: 80, seed: 3 }));
  });

  it("varies with the seed", () => {
    const a = generateSampleNetwork({ size: 80, seed: 1 });
    const b = generateSampleNetwork({ size: 80, seed: 2 });
    expect(a.edges).not.toEqual(b.edges);
  });

  it("creates exactly `size` people", () => {
    for (const size of [0, 1, 2, 7, 60, 140]) {
      expect(generateSampleNetwork({ size }).nodes).toHaveLength(size);
    }
  });

  it("leaves the requested share of people unconnected", () => {
    const { nodes, stats } = generateSampleNetwork({ size: 100, isolatedShare: 0.25 });
    expect(stats.isolated).toBe(25);
    expect(nodes.filter((n) => n.links === 0)).toHaveLength(25);
  });

  it("only creates valid, unique edges", () => {
    const { nodes, edges, stats } = generateSampleNetwork({ size: 140, seed: 42 });
    const ids = new Set(nodes.map((n) => n.id));
    const pairs = new Set<string>();

    for (const { source, target } of edges) {
      expect(source).not.toBe(target);
      expect(ids.has(source) && ids.has(target)).toBe(true);
      const key = [source, target].sort().join("|");
      expect(pairs.has(key)).toBe(false);
      pairs.add(key);
    }
    expect(stats.connections).toBe(edges.length);
  });

  it("keeps link counts consistent with the edges", () => {
    const { nodes, edges } = generateSampleNetwork({ size: 90, seed: 9 });
    const total = nodes.reduce((sum, n) => sum + n.links, 0);
    expect(total).toBe(edges.length * 2);
  });

  it("grows at least one hub", () => {
    const { nodes } = generateSampleNetwork({ size: 120 });
    expect(Math.max(...nodes.map((n) => n.links))).toBeGreaterThanOrEqual(5);
  });

  it("assigns looks within range", () => {
    const { nodes } = generateSampleNetwork({ size: 120 });
    expect(nodes.every((n) => n.look >= 0 && n.look < LOOK_COUNT)).toBe(true);
  });
});
