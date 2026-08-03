"use client";

import { useEffect, useRef, useState } from "react";
import { HIGHLIGHT_VIEWS, type HighlightView, useHighlight } from "./context";

export function HighlightControl() {
  const { view, label, setView } = useHighlight();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);
  const choose = (next: HighlightView, nextLabel: string) => {
    setStatus(`Highlighting ${nextLabel}…`);
    setView(next);
    setOpen(false);
    window.setTimeout(
      () =>
        setStatus(
          next === "all"
            ? "Highlighting cleared"
            : `${nextLabel} content highlighted`,
        ),
      180,
    );
    window.setTimeout(() => setStatus(""), 2600);
  };
  return (
    <div className="highlight-control" ref={root}>
      {!open && (
        <div className="highlight-tooltip" role="tooltip">
          Choose a view to highlight the most relevant parts of the site.
        </div>
      )}
      <button
        className="highlight-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Tailor this CV for:</span>
        <code>{label}</code>
      </button>
      {open && (
        <div
          className="highlight-menu"
          role="menu"
          aria-label="Highlight relevant view"
        >
          {HIGHLIGHT_VIEWS.map(([id, optionLabel]) => (
            <button
              key={id}
              role="menuitemradio"
              aria-checked={view === id}
              onClick={() => choose(id, optionLabel)}
            >
              {optionLabel}
              <span>{view === id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      )}
      <span className="highlight-status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
