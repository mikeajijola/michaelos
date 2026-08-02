import type { LilyBubblePosition } from "./types";
export const LILY_DRAG_THRESHOLD = 6;
export function clampBubblePosition(position: LilyBubblePosition): LilyBubblePosition { return { edge: position.edge === "left" ? "left" : "right", yRatio: Math.max(.12, Math.min(.86, Number.isFinite(position.yRatio) ? position.yRatio : .72)) }; }
export function didDrag(dx: number, dy: number) { return Math.hypot(dx, dy) >= LILY_DRAG_THRESHOLD; }
