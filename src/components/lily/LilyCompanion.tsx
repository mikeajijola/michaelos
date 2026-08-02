"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLily } from "@/lily/context";
import { useCapabilities } from "@/capabilities/context";
import { LilyConversation } from "./LilyConversation";
import type { LilyBubblePosition } from "@/lily/types";
import { clampBubblePosition, didDrag } from "@/lily/bubble-position";
const KEY = "michaelos:lily:bubble-position:v1",
  EDGE = 16,
  SIZE = 58;
function loadPosition(): LilyBubblePosition {
  try {
    return clampBubblePosition(
      JSON.parse(localStorage.getItem(KEY) ?? "null") ?? {
        edge: "right",
        yRatio: 0.72,
      },
    );
  } catch {
    return { edge: "right", yRatio: 0.72 };
  }
}
export function LilyCompanion() {
  const pathname = usePathname();
  const lily = useLily();
  const runtime = useCapabilities();
  const bubble = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [position, setPosition] = useState<LilyBubblePosition>({
    edge: "right",
    yRatio: 0.72,
  });
  const [menu, setMenu] = useState(false);
  const visible =
    pathname !== "/" || lily.session.presentation !== "landing-idle";
  const save = (next: LilyBubblePosition) => {
    const value = clampBubblePosition(next);
    setPosition(value);
    localStorage.setItem(KEY, JSON.stringify(value));
  };
  useEffect(() => setPosition(loadPosition()), []);
  useEffect(() => {
    const resize = () => setPosition((current) => clampBubblePosition(current));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    const control = (raw: Event) => {
      if (
        (raw as CustomEvent<{ action: string }>).detail.action ===
        "reset-position"
      )
        save({ edge: "right", yRatio: 0.72 });
    };
    window.addEventListener("lily-control", control);
    return () => window.removeEventListener("lily-control", control);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (lily.session.presentation !== "bubble-open") return;
    const timer = window.setTimeout(
      () =>
        document.querySelector<HTMLInputElement>("#lily-panel-input")?.focus(),
      30,
    );
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        lily.close();
        bubble.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", escape);
    };
  }, [lily]);
  const style = {
    [position.edge]: EDGE,
    top: `clamp(${EDGE}px, calc(${position.yRatio} * (100vh - ${SIZE}px)), calc(100vh - ${SIZE + EDGE}px))`,
  };
  const move = (edge: LilyBubblePosition["edge"] = position.edge, amount = 0) =>
    save({ edge, yRatio: position.yRatio + amount });
  if (!visible) return null;
  return (
    <div
      className={`lily-companion ${position.yRatio > 0.5 ? "upper" : "lower"} ${lily.session.presentation === "morphing-to-bubble" ? "confirm" : ""}`}
      style={style}
    >
      <button
        ref={bubble}
        className="lily-bubble"
        aria-label="Open Lily"
        aria-expanded={lily.session.presentation === "bubble-open"}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (
            drag.current &&
            didDrag(
              event.clientX - drag.current.x,
              event.clientY - drag.current.y,
            )
          )
            drag.current.moved = true;
        }}
        onPointerUp={(event) => {
          const state = drag.current;
          drag.current = null;
          if (state?.moved) {
            save({
              edge: event.clientX < window.innerWidth / 2 ? "left" : "right",
              yRatio: event.clientY / window.innerHeight,
            });
            return;
          }
          void runtime.execute("lily.open");
        }}
      >
        Lily
      </button>
      <button
        className="lily-menu-trigger"
        aria-label="Lily position menu"
        aria-expanded={menu}
        onClick={() => setMenu((value) => !value)}
      >
        •••
      </button>
      {menu && (
        <div className="lily-position-menu">
          <button onClick={() => move("left")}>Move Lily to left</button>
          <button onClick={() => move("right")}>Move Lily to right</button>
          <button onClick={() => move(position.edge, -0.1)}>
            Move Lily higher
          </button>
          <button onClick={() => move(position.edge, 0.1)}>
            Move Lily lower
          </button>
          <button onClick={() => runtime.execute("lily.resetPosition")}>
            Reset Lily position
          </button>
        </div>
      )}
      {lily.session.presentation === "bubble-open" && (
        <section className="lily-panel" aria-label="Lily Panel">
          <header>
            <b>
              <i /> Lily
            </b>
            <div>
              <button aria-label="Minimise Lily" onClick={lily.close}>
                —
              </button>
              <button
                aria-label="Close Lily"
                onClick={() => {
                  void runtime.execute("lily.close");
                  bubble.current?.focus();
                }}
              >
                ×
              </button>
            </div>
          </header>
          <LilyConversation compact />
          <footer>
            <button onClick={() => runtime.execute("lily.clearConversation")}>
              Clear Lily conversation
            </button>
            <button onClick={() => runtime.execute("lily.openConsole")}>
              Open full Agent Console
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
