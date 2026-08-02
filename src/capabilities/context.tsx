"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { executeCapability } from "./executor";
import type { Caller, Execution } from "./types";

type Runtime = { last: Execution | null; history: Execution[]; execute: (id: string, params?: Record<string, unknown>, caller?: Caller) => Promise<Execution>; selectedElement: { text: string; role: string; accessibleName: string; capabilityId: string; params: Record<string, unknown> } | null; selectElement: (v: Runtime["selectedElement"]) => void };
const Context = createContext<Runtime | null>(null);
export function CapabilityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const search = useSearchParams(); const [last, setLast] = useState<Execution | null>(null); const [history, setHistory] = useState<Execution[]>([]); const [selectedElement, selectElement] = useState<Runtime["selectedElement"]>(null);
  useEffect(() => { try { setHistory(JSON.parse(localStorage.getItem("michaelos.capability-history.v1") ?? "[]")); } catch {} }, []);
  const execute = useCallback(async (id: string, params: Record<string, unknown> = {}, caller: Caller = "ui") => { const event = await executeCapability(id, params, caller, path => router.push(path)); setLast(event); setHistory(h => [event, ...h.filter(x => x.id !== event.id)].slice(0, 100)); return event; }, [router]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.ctrlKey && event.altKey && event.code === "Space") { event.preventDefault(); router.push("/capabilities"); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [router]);
  useEffect(() => { void pathname; void search; }, [pathname, search]);
  return <Context.Provider value={{ last, history, execute, selectedElement, selectElement }}>{children}</Context.Provider>;
}
export const useCapabilities = () => { const value = useContext(Context); if (!value) throw new Error("CapabilityProvider missing"); return value; };
