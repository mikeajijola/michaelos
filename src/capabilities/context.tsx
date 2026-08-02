"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { articles, experience, projects, skills } from "@/data/content";
import { executeCapability, formatExecution, HISTORY_KEY, normaliseExecutionHistory, TRANSCRIPT_KEY } from "./executor";
import { capabilities } from "./registry";
import { advanceGateway, parseProtocol, PROTOCOL_TIMEOUT_MS } from "./protocol";
import type { Caller, CapabilityContext, CapabilityExecution, SelectedControl, SurfaceController, SurfaceTab } from "./types";
import { DatabaseClient } from "@/database/client";

export type Runtime = {
  last: CapabilityExecution | null; history: CapabilityExecution[];
  execute: (id: string, params?: Record<string, unknown>, caller?: Caller) => Promise<CapabilityExecution>;
  selectedElement: SelectedControl | null; selectElement: (value: SelectedControl | null) => void;
  surface: { open: boolean; minimised: boolean; tab: SurfaceTab }; transcript: string[]; unread: number;
  protocol: { active: boolean; buffer: string; gatewayStep: number };
  toast: { title: string; detail?: string; status: "success" | "failure" } | null;
  clearTranscript: () => void; appendTranscript: (...lines: string[]) => void; markRead: () => void;
};
const RuntimeContext = createContext<Runtime | null>(null);

export function CapabilityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const [last, setLast] = useState<CapabilityExecution | null>(null); const [history, setHistory] = useState<CapabilityExecution[]>([]); const historyRef = useRef<CapabilityExecution[]>([]);
  const [selectedElement, selectElement] = useState<SelectedControl | null>(null); const selectedRef = useRef<SelectedControl | null>(null);
  const [surface, setSurface] = useState<Runtime["surface"]>({ open: false, minimised: false, tab: "terminal" }); const surfaceRef = useRef(surface); const priorFocus = useRef<HTMLElement | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]); const [unread, setUnread] = useState(0); const [toast, setToast] = useState<Runtime["toast"]>(null);
  const [protocol, setProtocol] = useState<Runtime["protocol"]>({ active: false, buffer: "", gatewayStep: 0 });
  const database = useRef<DatabaseClient | null>(null);
  const step = useRef(0); const lastStepAt = useRef(0); const buffer = useRef(""); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { surfaceRef.current = surface; }, [surface]);
  useEffect(() => { selectedRef.current = selectedElement; }, [selectedElement]);
  useEffect(() => { let saved: CapabilityExecution[] = []; try { saved = normaliseExecutionHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")); } catch {} setHistory(saved); historyRef.current = saved; try { setTranscript(JSON.parse(localStorage.getItem(TRANSCRIPT_KEY) ?? "[]")); } catch {} }, []);
  useEffect(() => { const client = new DatabaseClient(); database.current = client; void client.initialise().then(() => client.exec("CREATE TABLE IF NOT EXISTS capability_history (id TEXT PRIMARY KEY, capability_id TEXT NOT NULL, caller TEXT NOT NULL, input TEXT, output TEXT, success INTEGER NOT NULL, duration_ms INTEGER NOT NULL, executed_at TEXT NOT NULL, confirmation_status TEXT)")).catch(error => console.warn("SQLite running in degraded mode", error)); return () => { database.current = null; }; }, []);
  const saveTranscript = useCallback((update: (current: string[]) => string[]) => setTranscript(current => { const next = update(current).slice(-200); localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(next)); return next; }), []);

  const surfaceController = useMemo<SurfaceController>(() => ({
    open: (tab = "terminal") => { priorFocus.current = document.activeElement as HTMLElement; setSurface({ open: true, minimised: false, tab }); },
    close: () => { setSurface(s => ({ ...s, open: false, minimised: false })); queueMicrotask(() => priorFocus.current?.focus()); },
    minimise: () => setSurface(s => ({ ...s, minimised: true })), restore: () => setSurface(s => ({ ...s, open: true, minimised: false })),
    toggle: () => setSurface(s => ({ ...s, open: !s.open, minimised: false })), selectTab: tab => setSurface(s => ({ ...s, tab })),
  }), []);
  const context = useMemo<CapabilityContext>(() => ({ caller: "ui", data: { projects, experience, articles, skills }, navigate: path => router.push(path), back: () => router.back(), surface: surfaceController, getHistory: () => historyRef.current, getSelectedControl: () => selectedRef.current }), [router, surfaceController]);
  const execute = useCallback(async (id: string, params: Record<string, unknown> = {}, caller: Caller = "ui") => executeCapability(id, params, caller, { ...context, caller }), [context]);

  useEffect(() => {
    const receive = (raw: Event) => { const event = (raw as CustomEvent<CapabilityExecution>).detail; setLast(event); setHistory(current => { const next = [event, ...current.filter(x => x.executionId !== event.executionId)].slice(0, 250); historyRef.current = next; return next; }); saveTranscript(current => [...current, formatExecution(event)]); const surfaceAction = event.capabilityId.startsWith("system.") && (event.capabilityId.includes("CommandSurface") || event.capabilityId.includes("Terminal") || event.capabilityId.includes("Console") || event.capabilityId.includes("Inspector")); if ((!surfaceRef.current.open || surfaceRef.current.minimised) && !surfaceAction) setUnread(value => value + 1); void database.current?.exec("INSERT OR REPLACE INTO capability_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [event.executionId, event.capabilityId, event.caller, JSON.stringify(event.params), JSON.stringify(event.result ?? event.error), event.status === "success" ? 1 : 0, event.durationMs, event.timestamp, event.confirmationStatus]).catch(() => undefined); const message = event.result as { message?: string; path?: string } | null; setToast({ title: event.status === "success" ? message?.message ?? `${event.capabilityId} complete` : `Could not execute ${event.capabilityId}`, detail: event.error?.message ?? message?.path, status: event.status }); window.setTimeout(() => setToast(null), 4200); };
    window.addEventListener("capability-executed", receive); return () => window.removeEventListener("capability-executed", receive);
  }, [saveTranscript]);
  useEffect(() => { const activate = (raw: Event) => { const detail = (raw as CustomEvent<{ id: string; params: Record<string, unknown> }>).detail; void execute(detail.id, detail.params, "accessibility"); }; window.addEventListener("capability-accessibility-activate", activate); return () => window.removeEventListener("capability-accessibility-activate", activate); }, [execute]);

  const endCapture = useCallback(() => { if (timer.current) clearTimeout(timer.current); step.current = 0; buffer.current = ""; setProtocol({ active: false, buffer: "", gatewayStep: 0 }); }, []);
  const armTimeout = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(endCapture, PROTOCOL_TIMEOUT_MS); }, [endCapture]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (protocol.active) {
        event.preventDefault(); event.stopPropagation(); armTimeout();
        if (event.key === "Escape") { endCapture(); return; }
        if (event.key === "Backspace") { buffer.current = buffer.current.slice(0, -1); setProtocol(p => ({ ...p, buffer: buffer.current })); return; }
        if (event.key === "Enter") { const entered = buffer.current.trim(); const parsed = parseProtocol(`${entered} ENTER`, capabilities); endCapture(); if (parsed) void execute(parsed.capability.id, parsed.params, "hotkey"); else void execute("protocol.invalid", { input: entered }, "hotkey"); return; }
        if (event.key.length === 1) { buffer.current += event.key; setProtocol(p => ({ ...p, buffer: buffer.current })); }
        return;
      }
      const next = advanceGateway({ step: step.current, lastAt: lastStepAt.current }, event, Date.now());
      if (next.consume) { event.preventDefault(); event.stopPropagation(); }
      step.current = next.progress.step; lastStepAt.current = next.progress.lastAt; setProtocol(p => ({ ...p, gatewayStep: step.current }));
      if (next.activated) { buffer.current = ""; setProtocol({ active: true, buffer: "", gatewayStep: 6 }); armTimeout(); }
    };
    window.addEventListener("keydown", onKey, true); return () => window.removeEventListener("keydown", onKey, true);
  }, [armTimeout, endCapture, execute, protocol.active]);

  const value: Runtime = { last, history, execute, selectedElement, selectElement, surface, transcript, unread, protocol, toast, clearTranscript: () => saveTranscript(() => []), appendTranscript: (...lines) => saveTranscript(current => [...current, ...lines]), markRead: () => setUnread(0) };
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}
export const useCapabilities = () => { const value = useContext(RuntimeContext); if (!value) throw new Error("CapabilityProvider missing"); return value; };
