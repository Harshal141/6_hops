"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import type { ForceGraphMethods, ForceGraphProps, LinkObject, NodeObject } from "react-force-graph-3d";
import { EmptyState } from "../../ui";
import { NodeHoverCard } from "./NodeHoverCard";
import { useContainerSize } from "./useContainerSize";
import { useEgoNetwork, type EgoNetworkPerson } from "@/lib/hooks/connection";
import { describeError } from "@/lib/utils/api";
import { BACKGROUND, LINK_COLOR, RING_COLOR } from "./graphTheme";

const LINK_DISTANCE = 150; // was the library default (~30) — longer lines
const INITIAL_CAMERA_Z = 260; // start a little zoomed in versus the library's auto-fit

// half of createAvatarSprite's worldSize per degree — used to project how
// big a node's photo actually looks on screen at the current zoom, so the
// hover label clears it instead of overlapping the circle
const NODE_WORLD_RADIUS: Record<EgoNetworkPerson["degree"], number> = { 0: 10.5, 1: 7, 2: 4.5 };
const HOVER_LABEL_GAP = 10; // extra px clearance beyond the projected circle edge

// `next/dynamic` erases the imported component's generics (it falls back to
// the library's default `{}` node type), so the loaded component is recast
// to its real, concretely-typed signature for this graph's node shape.
type ForceGraph3DComponent = (
  props: ForceGraphProps<NodeObject<EgoNetworkPerson>, LinkObject<EgoNetworkPerson>> & {
    ref?: React.MutableRefObject<ForceGraphMethods<NodeObject<EgoNetworkPerson>, LinkObject<EgoNetworkPerson>> | undefined>;
  }
) => React.ReactElement;

// force-graph touches `window` on import, so it must never run during SSR
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
}) as unknown as ForceGraph3DComponent;

type GraphNode = NodeObject<EgoNetworkPerson>;

/** A billboarded, circular avatar sprite — always faces the camera as it orbits. */
function createAvatarSprite(img: HTMLImageElement | undefined, degree: EgoNetworkPerson["degree"]): THREE.Sprite {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const center = size / 2;
  const r = center - 6;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, r, 0, 2 * Math.PI);
  ctx.fillStyle = "#e5e5e5";
  ctx.fill();
  if (img) {
    ctx.clip();
    ctx.drawImage(img, center - r, center - r, r * 2, r * 2);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(center, center, r, 0, 2 * Math.PI);
  ctx.lineWidth = degree === 0 ? 8 : degree === 1 ? 6 : 4;
  ctx.strokeStyle = RING_COLOR[degree];
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  // a link passing directly between the camera and a node's face reads as
  // "the line is drawn over the photo" — depthTest off + a high renderOrder
  // makes every photo draw on top of every line, regardless of which is
  // actually nearer the camera
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 999;
  const worldSize = degree === 0 ? 21 : degree === 1 ? 14 : 9;
  sprite.scale.set(worldSize, worldSize, 1);
  return sprite;
}

/**
 * Your 2-degree connections graph, in 3D: you at the center, direct
 * connections around you, and their connections beyond that. Orbit by
 * dragging, zoom with scroll/pinch, hover a node for its name, click through
 * to their profile.
 */
export function ConnectionsGraph() {
  const router = useRouter();
  const { ref: containerRef, size } = useContainerSize<HTMLDivElement>();
  const fgRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const images = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesReady, setImagesReady] = useState(false);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  // bump to force React to fully unmount+remount <ForceGraph3D> — see the
  // "reappear" note below
  const [instanceKey, setInstanceKey] = useState(0);
  const hasMountedRef = useRef(false);

  const { data: network, isLoading: networkLoading, isError: networkError, error } = useEgoNetwork();
  const graphData = useMemo(
    () =>
      network
        ? {
            nodes: network.people as GraphNode[],
            links: network.edges.map((e) => ({ source: e.source, target: e.target })),
          }
        : null,
    [network]
  );

  useEffect(() => {
    if (!network) return;
    let cancelled = false;
    Promise.all(
      network.people.map(
        (p) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              images.current.set(p.id, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = p.icon ?? "";
          })
      )
    ).then(() => {
      if (!cancelled) setImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [network]);

  // Known upstream issue (vasturiano/react-force-graph#596): Next's
  // client-side router cache can revive this whole page via React's
  // "fiber reuse" (Activity) instead of a real unmount+remount. `fgRef`
  // and our other refs survive that revival, but react-kapsule's own
  // internal mount guard (`effectCalled.current`) also survives it and
  // is never reset — so the underlying kapsule's mount effect sees
  // "already mounted" and skips re-attaching to the (new) DOM node,
  // even though its destructor already ran and tore the instance down.
  // Result: a dead instance that either sits inert or, if a stray tick
  // was still in flight, throws "Cannot read properties of undefined
  // (reading 'tick')" from deep inside three-forcegraph.
  //
  // `hasMountedRef` is set exactly once per *real* mount (a genuine
  // remount creates a fresh ref, starting back at `false`) — if this
  // effect's empty-deps body runs again with it already `true`, that's
  // the telltale sign of a fiber-reuse revival, not a fresh mount. Bump
  // `instanceKey` so React discards the zombie fiber and gives
  // `<ForceGraph3D>` a genuinely new one instead of trying to reuse it.
  useEffect(() => {
    if (hasMountedRef.current) {
      // deferred to a microtask (not called directly in the effect body) —
      // microtasks still drain before the browser's next animation frame,
      // so this still lands ahead of any stray tick from the zombie instance
      queueMicrotask(() => setInstanceKey((k) => k + 1));
      return;
    }
    hasMountedRef.current = true;
  }, []);

  // gentler repulsion + longer links than the library defaults, and a
  // closer starting camera. Retries every frame until `fgRef.current` is
  // actually set and the call succeeds: on a cold page load, the
  // react-force-graph-3d chunk (bundling three.js) can still be downloading
  // when `imagesReady` flips — a single deferred attempt would silently no-op
  // and leave the default zoomed-out framing. The try/catch covers the
  // instance existing but its own post-mount init not being finished yet.
  useEffect(() => {
    if (!imagesReady) return;
    let cancelled = false;
    let raf: number;

    const tryConfigure = () => {
      if (cancelled) return;
      const fg = fgRef.current;
      if (!fg) {
        raf = requestAnimationFrame(tryConfigure);
        return;
      }
      try {
        // deliberately no `d3ReheatSimulation()` — that call was never
        // exercised in the checkpoint sequence that isolated the crash fix,
        // and setting these params this early (before the simulation cools)
        // already takes effect on its own, so it stays untested surface area
        fg.d3Force("charge")?.strength?.(-70);
        fg.d3Force("link")?.distance?.(LINK_DISTANCE);
        fg.cameraPosition({ x: 0, y: 0, z: INITIAL_CAMERA_Z }, { x: 0, y: 0, z: 0 }, 0);
      } catch {
        raf = requestAnimationFrame(tryConfigure);
      }
    };

    raf = requestAnimationFrame(tryConfigure);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [imagesReady, instanceKey]);

  useEffect(() => {
    if (!hovered) return;
    const person = hovered as GraphNode & EgoNetworkPerson;
    let raf: number;
    const track = () => {
      const fg = fgRef.current;
      if (fg && hovered.x !== undefined && hovered.y !== undefined && hovered.z !== undefined) {
        try {
          const camera = fg.camera();
          const toScreen = (v: THREE.Vector3) => ({
            x: (v.x * 0.5 + 0.5) * size.width,
            y: (-v.y * 0.5 + 0.5) * size.height,
          });

          const center = new THREE.Vector3(hovered.x, hovered.y, hovered.z);
          // project the node's world-space edge (not just its center) so the
          // gap scales with how big the photo actually looks at the current
          // zoom, instead of a fixed offset that overlaps it up close
          const edge = center.clone().add(new THREE.Vector3(NODE_WORLD_RADIUS[person.degree], 0, 0));
          const centerScreen = toScreen(center.clone().project(camera));
          const edgeScreen = toScreen(edge.project(camera));
          const pixelRadius = Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y);

          setHoverPos({ x: centerScreen.x, y: centerScreen.y - pixelRadius - HOVER_LABEL_GAP });
        } catch {
          // camera briefly unavailable during (re)mount — skip this frame
        }
      }
      raf = requestAnimationFrame(track);
    };
    // computed synchronously on the first call (not deferred a frame) so the
    // very first paint already has the right spot — otherwise it briefly
    // renders at the previous node's position (or the {0,0} default) and
    // visibly jumps once the first animation frame corrects it
    track();
    return () => cancelAnimationFrame(raf);
  }, [hovered, size.width, size.height]);

  const hoveredPerson = hovered as (GraphNode & EgoNetworkPerson) | null;
  const isReady = !networkLoading && !networkError && imagesReady && graphData;

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] min-h-[420px] bg-white/80 backdrop-blur-sm border border-neutral-200">
      {(networkLoading || (!networkError && !imagesReady)) && <EmptyState message="loading your network..." />}

      {networkError && <EmptyState message={describeError(error)} />}

      {!networkError && network && network.people.length <= 1 && (
        <EmptyState
          message="no connections yet"
          hint="connect with someone first to see your network here"
        />
      )}

      {isReady && network!.people.length > 1 && (
        <ForceGraph3D
          key={instanceKey}
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={graphData!}
          backgroundColor={BACKGROUND}
          nodeId="id"
          nodeLabel={() => ""}
          nodeThreeObject={(node) => {
            const person = node as GraphNode & EgoNetworkPerson;
            return createAvatarSprite(images.current.get(person.id), person.degree);
          }}
          nodeThreeObjectExtend={false}
          linkColor={(link) => {
            const target = link.target as GraphNode;
            return LINK_COLOR[target?.degree ?? 2];
          }}
          linkOpacity={0.6}
          linkWidth={0.5}
          onNodeClick={(node) => {
            const person = node as GraphNode & EgoNetworkPerson;
            if (person.handle) router.push(`/profile/${person.handle}`);
          }}
          onNodeHover={(node) => setHovered(node)}
          showNavInfo={false}
        />
      )}

      {hoveredPerson && <NodeHoverCard person={hoveredPerson} x={hoverPos.x} y={hoverPos.y} />}
    </div>
  );
}
