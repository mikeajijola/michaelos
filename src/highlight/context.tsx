"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  HIGHLIGHT_VIEWS,
  matchesHighlightView,
  type HighlightView,
} from "./lenses";
const STORAGE_KEY = "michaelos:highlight-view:v1";
export { HIGHLIGHT_VIEWS, type HighlightView } from "./lenses";

type HighlightRuntime = {
  view: HighlightView;
  label: string;
  setView: (view: HighlightView) => void;
  matches: (content: Array<string | undefined>) => boolean;
};
const HighlightContext = createContext<HighlightRuntime | null>(null);

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<HighlightView>("all");
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as HighlightView | null;
    if (saved && HIGHLIGHT_VIEWS.some(([id]) => id === saved))
      setViewState(saved);
  }, []);
  const setView = (next: HighlightView) => {
    setViewState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };
  const value = useMemo<HighlightRuntime>(
    () => ({
      view,
      label: HIGHLIGHT_VIEWS.find(([id]) => id === view)?.[1] ?? "All content",
      setView,
      matches: (content) => matchesHighlightView(view, content),
    }),
    [view],
  );
  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  const context = useContext(HighlightContext);
  if (!context) throw new Error("HighlightProvider missing");
  return context;
}
