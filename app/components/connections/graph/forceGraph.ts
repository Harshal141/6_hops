"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ForceGraphMethods, ForceGraphProps, LinkObject, NodeObject } from "react-force-graph-3d";

// `next/dynamic` erases the imported component's generics (it falls back to
// the library's default `{}` node type), so each graph recasts the loaded
// component to its real, concretely-typed signature via `forceGraph3DFor`.
export type ForceGraph3DComponent<Node extends object> = (
  props: ForceGraphProps<NodeObject<Node>, LinkObject<Node>> & {
    ref?: React.MutableRefObject<ForceGraphMethods<NodeObject<Node>, LinkObject<Node>> | undefined>;
  }
) => React.ReactElement;

// force-graph touches `window` on import, so it must never run during SSR
const DynamicForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export function forceGraph3DFor<Node extends object>() {
  return DynamicForceGraph3D as unknown as ForceGraph3DComponent<Node>;
}

/**
 * A `key` for `<ForceGraph3D>` that changes when the graph must be rebuilt.
 *
 * Known upstream issue (vasturiano/react-force-graph#596): Next's
 * client-side router cache can revive a whole page via React's
 * "fiber reuse" (Activity) instead of a real unmount+remount. Refs
 * survive that revival, but react-kapsule's own internal mount guard
 * (`effectCalled.current`) also survives it and is never reset — so the
 * underlying kapsule's mount effect sees "already mounted" and skips
 * re-attaching to the (new) DOM node, even though its destructor already
 * ran and tore the instance down. Result: a dead instance that either sits
 * inert or, if a stray tick was still in flight, throws "Cannot read
 * properties of undefined (reading 'tick')" from deep inside three-forcegraph.
 *
 * `hasMountedRef` is set exactly once per *real* mount (a genuine remount
 * creates a fresh ref, starting back at `false`) — if the empty-deps effect
 * runs again with it already `true`, that's the telltale sign of a
 * fiber-reuse revival, not a fresh mount. Bumping the key makes React
 * discard the zombie fiber and give the graph a genuinely new one.
 */
export function useForceGraphInstanceKey(): number {
  const [instanceKey, setInstanceKey] = useState(0);
  const hasMountedRef = useRef(false);

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

  return instanceKey;
}
