import type { EgoNetworkPerson } from "@/lib/hooks/connection";

/**
 * Palette for the 3D graph. Deliberately monochrome — degree is read from
 * ring weight/node size, not competing hues, so the avatar photos stay the
 * only color in the frame.
 */
export const RING_COLOR: Record<EgoNetworkPerson["degree"], string> = {
  0: "#171717", // neutral-900 — you
  1: "#404040", // neutral-700 — direct connection, kept clearly darker than 2nd degree
  2: "#a3a3a3", // neutral-400 — friend of a friend
};

export const LINK_COLOR: Record<EgoNetworkPerson["degree"], string> = {
  0: "#d4d4d4",
  1: "#d4d4d4", // neutral-300 — edges into a 1st-degree node
  2: "#e5e5e5", // neutral-200 — edges into a 2nd-degree node, one shade lighter
};

export const NODE_RADIUS: Record<EgoNetworkPerson["degree"], number> = { 0: 15, 1: 10, 2: 6.5 };

export const BACKGROUND = "#fafafa"; // matches the card surface, not force-graph's default near-black
