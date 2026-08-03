"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useLily } from "@/lily/context";
import { useCapabilities } from "@/capabilities/context";
import { LilyConversation } from "./LilyConversation";
import { NaviVoiceSurface } from "@/components/navi/NaviVoiceSurface";
import { useNaviVoice } from "@/navi/voice/use-navi-voice";
import type { LilyBubblePosition } from "@/lily/types";
import { clampBubblePosition, didDrag } from "@/lily/bubble-position";
import {
  shouldOpenLilyPanel,
  shouldShowLilyCompanion,
} from "@/lily/presentation";
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
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const visible = shouldShowLilyCompanion(pathname);
  const panelOpen = shouldOpenLilyPanel(
    pathname,
    lily.session.presentation,
    lily.session.activeRequestId,
  );
  const voice = useNaviVoice(async (request) => {
    const result = await lily.submit(request, { maxCapabilitySteps: 3 });
    return (
      result ?? {
        text: "I’m ready for another request.",
        trace: [],
        failed: false,
      }
    );
  });
  const voiceMode = voice.state !== "inactive";
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
  useLayoutEffect(() => {
    if (!panelOpen) return;
    document
      .querySelector<HTMLInputElement>("#lily-panel-input")
      ?.focus({ preventScroll: true });
  }, [panelOpen, pathname]);
  useEffect(() => {
    if (!panelOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        lily.close();
        window.setTimeout(() => bubble.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [lily.close, panelOpen]);
  useEffect(() => {
    if (!panelOpen && voice.active) voice.stop("panel-close");
  }, [panelOpen, voice.active, voice.stop]);
  useEffect(() => {
    const control = (raw: Event) => {
      const action = (raw as CustomEvent<{ action: "start" | "stop" }>).detail
        .action;
      if (action === "start") void voice.start();
      if (action === "stop") voice.stop();
    };
    window.addEventListener("navi-voice-control", control);
    return () => window.removeEventListener("navi-voice-control", control);
  }, [voice.start, voice.stop]);
  const style: CSSProperties = dragPreview
    ? {
        left: Math.max(
          EDGE,
          Math.min(window.innerWidth - SIZE - EDGE, dragPreview.x - SIZE / 2),
        ),
        top: Math.max(
          EDGE,
          Math.min(window.innerHeight - SIZE - EDGE, dragPreview.y - SIZE / 2),
        ),
      }
    : {
        [position.edge]: EDGE,
        top: `clamp(${EDGE}px, calc(${position.yRatio} * (100vh - ${SIZE}px)), calc(100vh - ${SIZE + EDGE}px))`,
      };
  const move = (edge: LilyBubblePosition["edge"] = position.edge, amount = 0) =>
    save({ edge, yRatio: position.yRatio + amount });
  if (!visible || runtime.surface.open) return null;
  return (
    <div
      className={`lily-companion ${position.yRatio > 0.5 ? "upper" : "lower"} ${lily.session.presentation === "morphing-to-bubble" ? "confirm" : ""} navi-voice-host-${voice.state}`}
      style={style}
    >
      {!panelOpen && (
        <button
          ref={bubble}
          className="lily-bubble"
          aria-label="Open Navi"
          aria-expanded={false}
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
            ) {
              drag.current.moved = true;
              setDragPreview({ x: event.clientX, y: event.clientY });
            }
          }}
          onPointerUp={(event) => {
            const state = drag.current;
            drag.current = null;
            setDragPreview(null);
            if (state?.moved) {
              save({
                edge: event.clientX < window.innerWidth / 2 ? "left" : "right",
                yRatio: event.clientY / window.innerHeight,
              });
              return;
            }
            void runtime.execute("navi.open");
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragPreview(null);
          }}
        >
          <span aria-hidden="true">🎙</span>
        </button>
      )}
      {panelOpen && (
        <section className="lily-panel" aria-label="Navi Panel">
          <header>
            <b>
              <i /> Navi
            </b>
            <div>
              {voice.enabled && (
                <button
                  className="navi-microphone"
                  aria-label={voiceMode ? "End Navi voice mode" : "Start Navi voice mode"}
                  aria-pressed={voiceMode}
                  title="Voice mode"
                  onClick={async () => {
                    await runtime.execute(
                      voiceMode ? "navi.endVoice" : "navi.startVoice",
                    );
                  }}
                >
                  {voiceMode ? "End voice" : "Voice mode"}
                </button>
              )}
              <button
                className="lily-position-trigger"
                aria-haspopup="menu"
                aria-expanded={menu}
                onClick={() => setMenu((value) => !value)}
              >
                Position
              </button>
              <button
                aria-label="Minimise Navi"
                onClick={() => {
                  lily.close();
                  window.setTimeout(() => bubble.current?.focus(), 0);
                }}
              >
                —
              </button>
              <button
                aria-label="Close Navi"
                onClick={() => {
                  void runtime.execute("navi.close");
                  window.setTimeout(() => bubble.current?.focus(), 0);
                }}
              >
                ×
              </button>
            </div>
          </header>
          {menu && (
            <div className="lily-position-menu" role="menu">
              <button role="menuitem" onClick={() => move("left")}>
                Move Navi to left
              </button>
              <button role="menuitem" onClick={() => move("right")}>
                Move Navi to right
              </button>
              <button role="menuitem" onClick={() => move(position.edge, -0.1)}>
                Move Navi higher
              </button>
              <button role="menuitem" onClick={() => move(position.edge, 0.1)}>
                Move Navi lower
              </button>
              <button
                role="menuitem"
                onClick={() => runtime.execute("navi.resetPosition")}
              >
                Reset Navi position
              </button>
            </div>
          )}
          {voiceMode ? <NaviVoiceSurface voice={voice} /> : <LilyConversation compact />}
          {!voiceMode && <footer>
            <button onClick={() => runtime.execute("navi.clearConversation")}>
              Clear Navi conversation
            </button>
            <button onClick={() => runtime.execute("navi.openConsole")}>
              Open full Agent Console
            </button>
            <button onClick={() => runtime.execute("system.openActionKeyMode")}>
              Open Action Key Mode
            </button>
          </footer>}
        </section>
      )}
    </div>
  );
}
