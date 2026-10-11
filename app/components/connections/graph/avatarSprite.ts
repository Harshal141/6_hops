"use client";

import * as THREE from "three";
import type { EgoNetworkPerson } from "@/lib/hooks/connection";
import { RING_COLOR } from "./graphTheme";

const CANVAS_SIZE = 128;

/** A 128px canvas with a filled circle, ready for a face to be drawn in. */
function circleCanvas(fill: string) {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  const center = CANVAS_SIZE / 2;
  const r = center - 6;

  ctx.beginPath();
  ctx.arc(center, center, r, 0, 2 * Math.PI);
  ctx.fillStyle = fill;
  ctx.fill();
  return { canvas, ctx, center, r };
}

function strokeRing(ctx: CanvasRenderingContext2D, center: number, r: number, width: number, color: string) {
  ctx.beginPath();
  ctx.arc(center, center, r, 0, 2 * Math.PI);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * A billboarded sprite that always faces the camera as it orbits. A link
 * passing directly between the camera and a node's face reads as "the line is
 * drawn over the photo", so depthTest is off and renderOrder is high: every
 * photo draws on top of every line, whichever is actually nearer.
 */
function toSprite(texture: THREE.Texture, worldSize: number) {
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 999;
  sprite.scale.set(worldSize, worldSize, 1);
  return sprite;
}

/** A circular avatar for a real person in the connections graph. */
export function createAvatarSprite(
  img: HTMLImageElement | undefined,
  degree: EgoNetworkPerson["degree"],
  name: string,
  /** Multiplier on the dashboard's node sizes, for denser graphs. */
  scale = 1
): THREE.Sprite {
  const { canvas, ctx, center, r } = circleCanvas("#e5e5e5");

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, r, 0, 2 * Math.PI);
  if (img) {
    ctx.clip();
    ctx.drawImage(img, center - r, center - r, r * 2, r * 2);
  } else {
    // no photo on file — same initial the Avatar primitive falls back to, so
    // the node reads as "no picture" rather than as a failed image
    ctx.fillStyle = "#737373";
    ctx.font = `600 ${Math.round(r)}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name?.charAt(0).toUpperCase() || "?", center, center);
  }
  ctx.restore();

  strokeRing(ctx, center, r, degree === 0 ? 8 : degree === 1 ? 6 : 4, RING_COLOR[degree]);

  const worldSize = degree === 0 ? 21 : degree === 1 ? 14 : 9;
  return toSprite(new THREE.CanvasTexture(canvas), worldSize * scale);
}
