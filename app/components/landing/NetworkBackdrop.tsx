"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, NodeObject } from "react-force-graph-3d";
import {
  LINK_COLOR,
  RING_COLOR,
  createAvatarSprite,
  forceGraph3DFor,
  useContainerSize,
  useForceGraphInstanceKey,
} from "../connections/graph";
import { LOOK_COUNT, generateSampleNetwork, type SampleNetwork, type SampleNode } from "@/lib/utils/sampleNetwork";
import { sampleFaceUrl } from "@/lib/utils/sampleAvatars";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type GraphNode = NodeObject<SampleNode>;
type GraphLink = { source: string; target: string; message: boolean; speed: number };

const ForceGraph3D = forceGraph3DFor<SampleNode>();

/** Fewer people on a phone: smaller canvas, smaller GPU. */
const SIZE_DESKTOP = 150;
const SIZE_MOBILE = 70;
const MOBILE_BREAKPOINT = 640;

/** Seed picked by eye: a clear hub, a few mid clusters, singles around them. */
const SEED = 11;

const ORBIT_RAD_PER_MS = (2 * Math.PI) / 140_000; // one slow lap every ~2.3 minutes
const ORBIT_TILT = 0.28; // camera sits a little above the equator, looking down
const FIT_PADDING = 0.78;
/** The dashboard's node sizes, scaled down: this graph holds ~10x the people. */
const NODE_SCALE = 0.62; // a little tighter than the bounding box: the edges fade out under the mask anyway

// how far the cursor can swing the camera, and how quickly it follows
const CURSOR_SWING = 0.45; // radians of orbit at the screen edge
const CURSOR_LIFT = 0.3; // extra tilt at the top/bottom edge
const CURSOR_EASE = 0.04;

/**
 * Pulls every node gently toward the origin. Without it the people with no
 * connections are pushed out by repulsion alone and drift off-screen; with it
 * they settle "here and there" around the clusters.
 */
function gravity(strength: number) {
  let nodes: GraphNode[] = [];
  const force = (alpha: number) => {
    for (const node of nodes) {
      node.vx = (node.vx ?? 0) - (node.x ?? 0) * strength * alpha;
      node.vy = (node.vy ?? 0) - (node.y ?? 0) * strength * alpha;
      node.vz = (node.vz ?? 0) - (node.z ?? 0) * strength * alpha;
    }
  };
  force.initialize = (next: GraphNode[]) => {
    nodes = next;
  };
  return force;
}

/**
 * Dashboard sizing by role: a hub draws like "you" (largest, darkest ring), a
 * well-connected person like a first-degree connection, everyone else like a
 * second-degree one.
 */
function tierOf(links: number): 0 | 1 | 2 {
  if (links >= 5) return 0;
  if (links >= 2) return 1;
  return 2;
}

function toGraphData(network: SampleNetwork) {
  return {
    nodes: network.nodes.map((n) => ({ ...n })) as GraphNode[],
    links: network.edges.map((e, i): GraphLink => {
      const mix = (i * 2654435761) >>> 0; // cheap integer hash, stable per edge
      return {
        ...e,
        // about a third of the links have a message travelling along them
        message: mix % 3 === 0,
        speed: 0.0025 + ((mix >>> 8) % 100) / 100 * 0.004,
      };
    }),
  };
}

const EMPTY = { nodes: [] as GraphNode[], links: [] as GraphLink[] };

/** Loads every sample face once, so sprites can be drawn synchronously. */
function useSampleFaces() {
  const [faces, setFaces] = useState<Map<number, HTMLImageElement> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loaded = new Map<number, HTMLImageElement>();
    Promise.all(
      Array.from({ length: LOOK_COUNT }, (_, look) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded.set(look, img);
            resolve();
          };
          // a face that fails to load falls back to the initial-letter avatar
          img.onerror = () => resolve();
          img.src = sampleFaceUrl(look);
        })
      )
    ).then(() => {
      if (!cancelled) setFaces(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return faces;
}

interface NetworkBackdropProps {
  /** Reports the generated network's counts, for the stat tiles. */
  onStats?: (stats: SampleNetwork["stats"]) => void;
  /** Centre the network in the right part of the screen on wide layouts, clear of a left-hand panel. */
  offsetRight?: boolean;
}

/**
 * A made-up 6 hops network drifting behind the hero: clusters, hubs and a few
 * loners, slowly orbiting, with messages moving between people. The camera
 * leans toward the cursor. Decorative only, so it takes no pointer input of
 * its own and stops rendering while it is scrolled out of view.
 */
export function NetworkBackdrop({ onStats, offsetRight = false }: NetworkBackdropProps) {
  const { ref: containerRef, size } = useContainerSize<HTMLDivElement>();
  const fgRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  // where the camera is, and where it is easing to once the layout is measured
  const radiusRef = useRef({ current: 420, target: 420, fitted: false });
  // cursor position, -1..1 on each axis, and the eased value the camera uses
  const cursorRef = useRef({ x: 0, y: 0, easedX: 0, easedY: 0 });
  const [configuredFor, setConfiguredFor] = useState<string | null>(null);
  const instanceKey = useForceGraphInstanceKey();
  const reducedMotion = useReducedMotion();
  const faces = useSampleFaces();

  const isMobile = size.width > 0 && size.width < MOBILE_BREAKPOINT;
  const network = useMemo(
    () => generateSampleNetwork({ size: isMobile ? SIZE_MOBILE : SIZE_DESKTOP, seed: SEED, isolatedShare: 0.2 }),
    [isMobile]
  );
  const graphData = useMemo(() => toGraphData(network), [network]);
  const graphKey = `${instanceKey}-${isMobile}`;
  const ready = configuredFor === graphKey && faces !== null;

  useEffect(() => {
    onStats?.(network.stats);
  }, [network, onStats]);

  // Forces go in before the data does, so the warm-up layout already uses
  // them. Retried each frame until the lazily-loaded graph instance exists.
  useEffect(() => {
    if (!size.width) return;
    let raf: number;
    const configure = () => {
      const fg = fgRef.current;
      try {
        if (!fg) throw new Error("not mounted");
        fg.d3Force("charge")?.strength?.(-45);
        fg.d3Force("link")?.distance?.(28);
        fg.d3Force("gravity", gravity(0.06));
        radiusRef.current.fitted = false;
        setConfiguredFor(graphKey);
      } catch {
        raf = requestAnimationFrame(configure);
      }
    };
    raf = requestAnimationFrame(configure);
    return () => cancelAnimationFrame(raf);
  }, [graphKey, size.width]);

  // The backdrop ignores pointer events (the page above it stays usable), so
  // the cursor is read from the window instead.
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      cursorRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursorRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  // Slow orbit plus the cursor lean, easing toward the fitted distance. Under
  // reduced motion the camera still eases into frame, then the loop stops.
  useEffect(() => {
    if (!size.width) return;
    let raf: number;
    const start = performance.now();
    const place = (now: number) => {
      const fg = fgRef.current;
      const radius = radiusRef.current;
      const cursor = cursorRef.current;
      radius.current += (radius.target - radius.current) * 0.06;
      cursor.easedX += (cursor.x - cursor.easedX) * CURSOR_EASE;
      cursor.easedY += (cursor.y - cursor.easedY) * CURSOR_EASE;
      const settled = radius.fitted && Math.abs(radius.target - radius.current) < 0.5;
      if (fg) {
        try {
          const angle = 0.6 + (reducedMotion ? 0 : (now - start) * ORBIT_RAD_PER_MS + cursor.easedX * CURSOR_SWING);
          const tilt = ORBIT_TILT + (reducedMotion ? 0 : cursor.easedY * CURSOR_LIFT);
          const r = radius.current;
          fg.cameraPosition({ x: r * Math.sin(angle), y: r * tilt, z: r * Math.cos(angle) }, { x: 0, y: 0, z: 0 });
        } catch {
          // instance mid-(re)mount — try again next frame
        }
      }
      if (!reducedMotion || !fg || !settled) raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, graphKey, size.width]);

  // nothing to render while the hero is off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      const fg = fgRef.current;
      if (!fg) return;
      if (entry.isIntersecting) fg.resumeAnimation();
      else fg.pauseAnimation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  /** Frame the settled layout: the camera distance that fits its bounding box. */
  const fitToLayout = () => {
    const fg = fgRef.current;
    const box = fg?.getGraphBbox();
    if (!fg || !box) return;
    const extent = Math.max(box.x[1] - box.x[0], box.y[1] - box.y[0], box.z[1] - box.z[0]);
    if (!Number.isFinite(extent) || extent <= 0) return;
    const fov = (fg.camera() as { fov?: number }).fov ?? 40;
    // On a tall phone screen, fitting the full width would shrink the network to
    // a speck; it is background, so let the sides crop instead.
    const aspect = size.height ? Math.min(1, Math.max(0.8, size.width / size.height)) : 1;
    radiusRef.current.target = ((extent / 2) / Math.tan((fov * Math.PI) / 360) / aspect) * FIT_PADDING;
    radiusRef.current.fitted = true;
  };

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`absolute inset-0 pointer-events-none
                 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)]
                 ${offsetRight ? "lg:left-[35%]" : ""}`}
    >
      {size.width > 0 && (
        <ForceGraph3D
          key={graphKey}
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={ready ? graphData : EMPTY}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeLabel={() => ""}
          nodeThreeObject={(node) => createAvatarSprite(faces?.get(node.look), tierOf(node.links), "", NODE_SCALE)}
          nodeThreeObjectExtend={false}
          linkColor={() => LINK_COLOR[1]}
          linkOpacity={0.9}
          linkWidth={0.6}
          linkDirectionalParticles={(link) => (!reducedMotion && (link as GraphLink).message ? 1 : 0)}
          linkDirectionalParticleSpeed={(link) => (link as GraphLink).speed}
          linkDirectionalParticleWidth={2.2}
          linkDirectionalParticleColor={() => RING_COLOR[0]}
          warmupTicks={reducedMotion ? 300 : 80}
          cooldownTicks={reducedMotion ? 0 : 120}
          onEngineStop={fitToLayout}
          enableNodeDrag={false}
          enableNavigationControls={false}
          enablePointerInteraction={false}
          showNavInfo={false}
        />
      )}
    </div>
  );
}
