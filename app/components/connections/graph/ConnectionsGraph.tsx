"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import type { ForceGraphMethods, NodeObject } from "react-force-graph-3d";
import { Button, EmptyState } from "../../ui";
import { NodeHoverCard } from "./NodeHoverCard";
import { useContainerSize } from "./useContainerSize";
import { useEgoNetwork, type EgoNetworkPerson } from "@/lib/hooks/connection";
import { useProfile } from "@/lib/hooks/profile";
import { useCopyInviteLink } from "@/lib/hooks/useCopyInviteLink";
import { describeError } from "@/lib/utils/api";
import { BACKGROUND, LINK_COLOR } from "./graphTheme";
import { buildPreviewNetwork } from "./previewNetwork";
import { createAvatarSprite } from "./avatarSprite";
import { forceGraph3DFor, useForceGraphInstanceKey } from "./forceGraph";

const LINK_DISTANCE = 150; // was the library default (~30) — longer lines
const INITIAL_CAMERA_Z = 260; // start a little zoomed in versus the library's auto-fit
const AVATAR_LOAD_TIMEOUT_MS = 5000;

// half of createAvatarSprite's worldSize per degree — used to project how
// big a node's photo actually looks on screen at the current zoom, so the
// hover label clears it instead of overlapping the circle
const NODE_WORLD_RADIUS: Record<EgoNetworkPerson["degree"], number> = { 0: 10.5, 1: 7, 2: 4.5 };
const HOVER_LABEL_GAP = 10; // extra px clearance beyond the projected circle edge

type GraphNode = NodeObject<EgoNetworkPerson>;

const ForceGraph3D = forceGraph3DFor<EgoNetworkPerson>();

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
  const instanceKey = useForceGraphInstanceKey();

  const { data: network, isLoading: networkLoading, isError: networkError, error } = useEgoNetwork();
  const { data: profile } = useProfile();
  const { copied: inviteCopied, copy: copyInviteLink } = useCopyInviteLink(profile?.user_id);

  // A brand-new user sees a sample network instead of an empty canvas, once
  // the real query has actually resolved to "nothing here" — never in place
  // of a genuine loading/error state.
  const isNewUser = !networkLoading && !networkError && !!network && network.people.length <= 1;

  // Only the center node is real — it's your own name and photo (`network`
  // always includes it once it resolves). Everyone else in the preview is a
  // sample person built by `buildPreviewNetwork`.
  const displayNetwork = useMemo(
    () => (isNewUser ? buildPreviewNetwork(network!.people.find((p) => p.degree === 0)!) : network),
    [isNewUser, network]
  );
  const effectiveLoading = !isNewUser && networkLoading;
  const effectiveError = !isNewUser && networkError;

  const graphData = useMemo(
    () =>
      displayNetwork
        ? {
            nodes: displayNetwork.people as GraphNode[],
            links: displayNetwork.edges.map((e) => ({ source: e.source, target: e.target })),
          }
        : null,
    [displayNetwork]
  );

  useEffect(() => {
    if (!displayNetwork) return;
    let cancelled = false;
    Promise.all(
      displayNetwork.people.map(
        (p) =>
          new Promise<void>((resolve) => {
            // Someone with no photo gets the initials fallback, so there is
            // nothing to fetch. Assigning `img.src = ""` would instead make the
            // browser re-request the current page URL as an image and, in some
            // browsers, fire neither `load` nor `error` — leaving this promise,
            // and the whole graph waiting behind `Promise.all`, pending forever.
            if (!p.icon) {
              resolve();
              return;
            }
            const img = new Image();
            img.crossOrigin = "anonymous";
            // One unreachable host must never strand the graph on its loading
            // state — fall back to the initials for that node instead.
            const timer = setTimeout(resolve, AVATAR_LOAD_TIMEOUT_MS);
            const settle = () => {
              clearTimeout(timer);
              resolve();
            };
            img.onload = () => {
              images.current.set(p.id, img);
              settle();
            };
            img.onerror = settle;
            img.src = p.icon;
          })
      )
    ).then(() => {
      if (!cancelled) setImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [displayNetwork]);

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
  const isReady = !effectiveLoading && !effectiveError && imagesReady && graphData;

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] min-h-[420px] bg-white/80 backdrop-blur-sm border border-neutral-200">
      {(effectiveLoading || (!effectiveError && !imagesReady)) && <EmptyState message="Loading your network..." />}

      {effectiveError && <EmptyState message={describeError(error)} />}

      {isReady && displayNetwork!.people.length > 1 && (
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
            return createAvatarSprite(images.current.get(person.id), person.degree, person.name);
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

      {isReady && isNewUser && (
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-white/90 backdrop-blur-sm border-t border-neutral-200 flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-neutral-400">Start adding connections to connect</span>
          <Button variant="secondary" size="sm" onClick={copyInviteLink}>
            {inviteCopied ? "Copied!" : "Invite friend"}
          </Button>
        </div>
      )}
    </div>
  );
}
