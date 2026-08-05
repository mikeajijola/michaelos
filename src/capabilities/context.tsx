"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { articles, experience, projects, skills } from "@/data/content";
import {
  executeCapability,
  formatExecution,
  HISTORY_KEY,
  normaliseExecutionHistory,
  TRANSCRIPT_KEY,
} from "./executor";
import { capabilities } from "./registry";
import {
  advanceGateway,
  isActionKeyModeShortcut,
  parseProtocol,
} from "./protocol";
import type {
  Caller,
  CapabilityContext,
  CapabilityDatabase,
  CapabilityExecution,
  SelectedControl,
  SurfaceController,
  SurfaceTab,
} from "./types";
import { DatabaseClient } from "@/database/client";

export type Runtime = {
  last: CapabilityExecution | null;
  history: CapabilityExecution[];
  execute: (
    id: string,
    params?: Record<string, unknown>,
    caller?: Caller,
  ) => Promise<CapabilityExecution>;
  selectedElement: SelectedControl | null;
  selectElement: (value: SelectedControl | null) => void;
  surface: { open: boolean; minimised: boolean; tab: SurfaceTab };
  transcript: string[];
  unread: number;
  protocol: {
    active: boolean;
    buffer: string;
    gatewayStep: number;
    secretUnlocked: boolean;
    error: string | null;
  };
  toast: {
    title: string;
    detail?: string;
    status: "loading" | "success" | "failure";
  } | null;
  inspectedExecutionId: string | null;
  inspect: (executionId: string) => void;
  openActionKeyMode: () => void;
  closeActionKeyMode: () => void;
  setActionKeyInput: (value: string) => void;
  submitActionKey: () => Promise<void>;
  clearTranscript: () => void;
  appendTranscript: (...lines: string[]) => void;
  markRead: () => void;
};
const RuntimeContext = createContext<Runtime | null>(null);

export function CapabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [last, setLast] = useState<CapabilityExecution | null>(null);
  const [history, setHistory] = useState<CapabilityExecution[]>([]);
  const historyRef = useRef<CapabilityExecution[]>([]);
  const [selectedElement, selectElement] = useState<SelectedControl | null>(
    null,
  );
  const selectedRef = useRef<SelectedControl | null>(null);
  const [surface, setSurface] = useState<Runtime["surface"]>({
    open: false,
    minimised: false,
    tab: "terminal",
  });
  const surfaceRef = useRef(surface);
  const priorFocus = useRef<HTMLElement | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<Runtime["toast"]>(null);
  const [protocol, setProtocol] = useState<Runtime["protocol"]>({
    active: false,
    buffer: "",
    gatewayStep: 0,
    secretUnlocked: false,
    error: null,
  });
  const [inspectedExecutionId, setInspectedExecutionId] = useState<
    string | null
  >(null);
  const database = useRef<DatabaseClient | null>(null);
  const step = useRef(0);
  const lastStepAt = useRef(0);
  const buffer = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionKeyPriorFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    surfaceRef.current = surface;
  }, [surface]);
  useEffect(() => {
    selectedRef.current = selectedElement;
  }, [selectedElement]);
  useEffect(() => {
    let saved: CapabilityExecution[] = [];
    try {
      saved = normaliseExecutionHistory(
        JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"),
      );
    } catch {}
    setHistory(saved);
    historyRef.current = saved;
    try {
      setTranscript(JSON.parse(localStorage.getItem(TRANSCRIPT_KEY) ?? "[]"));
    } catch {}
  }, []);
  useEffect(() => {
    const client = new DatabaseClient();
    database.current = client;
    void client
      .initialise()
      .then(async () => {
        await client.exec(
          "CREATE TABLE IF NOT EXISTS capability_history (id TEXT PRIMARY KEY, capability_id TEXT NOT NULL, caller TEXT NOT NULL, input TEXT, output TEXT, success INTEGER NOT NULL, duration_ms INTEGER NOT NULL, executed_at TEXT NOT NULL, confirmation_status TEXT)",
        );
        await client.exec(
          "CREATE TABLE IF NOT EXISTS capability_reports (id TEXT PRIMARY KEY, capability_id TEXT, report_type TEXT NOT NULL, severity TEXT NOT NULL, details TEXT NOT NULL, caller TEXT NOT NULL, route TEXT, created_at TEXT NOT NULL)",
        );
      })
      .catch((error) => console.warn("SQLite running in degraded mode", error));
    return () => {
      database.current = null;
    };
  }, []);
  const saveTranscript = useCallback(
    (update: (current: string[]) => string[]) =>
      setTranscript((current) => {
        const next = update(current).slice(-200);
        localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(next));
        return next;
      }),
    [],
  );

  const surfaceController = useMemo<SurfaceController>(
    () => ({
      open: (tab = "terminal") => {
        priorFocus.current = document.activeElement as HTMLElement;
        setSurface({ open: true, minimised: false, tab });
      },
      close: () => {
        setSurface((s) => ({ ...s, open: false, minimised: false }));
        queueMicrotask(() => priorFocus.current?.focus());
      },
      minimise: () =>
        setSurface((s) => ({ ...s, open: false, minimised: false })),
      restore: () =>
        setSurface((s) => ({ ...s, open: true, minimised: false })),
      toggle: () =>
        setSurface((s) => ({ ...s, open: !s.open, minimised: false })),
      selectTab: (tab) => setSurface((s) => ({ ...s, tab })),
    }),
    [],
  );
  const capabilityDatabase = useMemo<CapabilityDatabase>(
    () => ({
      exec: (sql, bind) =>
        database.current
          ? database.current.exec(sql, bind)
          : Promise.reject(new Error("Local database is not ready.")),
      query: <T,>(sql: string, bind?: unknown[]) =>
        database.current
          ? database.current.query<T>(sql, bind)
          : Promise.reject(new Error("Local database is not ready.")),
    }),
    [],
  );
  const context = useMemo<CapabilityContext>(
    () => ({
      caller: "ui",
      data: { projects, experience, articles, skills },
      navigate: (path) => router.push(path),
      back: () => router.back(),
      surface: surfaceController,
      database: capabilityDatabase,
      getHistory: () => historyRef.current,
      getSelectedControl: () => selectedRef.current,
    }),
    [capabilityDatabase, router, surfaceController],
  );
  const execute = useCallback(
    async (
      id: string,
      params: Record<string, unknown> = {},
      caller: Caller = "ui",
    ) => {
      setToast({
        title: `Running ${id}…`,
        detail: "Validating capability and parameters",
        status: "loading",
      });
      return executeCapability(id, params, caller, { ...context, caller });
    },
    [context],
  );

  useEffect(() => {
    const receive = (raw: Event) => {
      const event = (raw as CustomEvent<CapabilityExecution>).detail;
      setLast(event);
      setHistory((current) => {
        const next = [
          event,
          ...current.filter((x) => x.executionId !== event.executionId),
        ].slice(0, 250);
        historyRef.current = next;
        return next;
      });
      saveTranscript((current) => [...current, formatExecution(event)]);
      const surfaceAction =
        event.capabilityId.startsWith("system.") &&
        (event.capabilityId.includes("CommandSurface") ||
          event.capabilityId.includes("Terminal") ||
          event.capabilityId.includes("Console") ||
          event.capabilityId.includes("Inspector"));
      if (
        (!surfaceRef.current.open || surfaceRef.current.minimised) &&
        !surfaceAction
      )
        setUnread((value) => value + 1);
      void database.current
        ?.exec(
          "INSERT OR REPLACE INTO capability_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            event.executionId,
            event.capabilityId,
            event.caller,
            JSON.stringify(event.params),
            JSON.stringify(event.result ?? event.error),
            event.status === "success" ? 1 : 0,
            event.durationMs,
            event.timestamp,
            event.confirmationStatus,
          ],
        )
        .catch(() => undefined);
      const message = event.result as {
        message?: string;
        path?: string;
      } | null;
      setToast({
        title:
          event.status === "success"
            ? (message?.message ?? `${event.capabilityId} complete`)
            : `Could not execute ${event.capabilityId}`,
        detail: event.error?.message ?? message?.path,
        status: event.status,
      });
      window.setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener("capability-executed", receive);
    return () => window.removeEventListener("capability-executed", receive);
  }, [saveTranscript]);
  useEffect(() => {
    const activate = (raw: Event) => {
      const detail = (
        raw as CustomEvent<{ id: string; params: Record<string, unknown> }>
      ).detail;
      void execute(detail.id, detail.params, "accessibility");
    };
    window.addEventListener("capability-accessibility-activate", activate);
    return () =>
      window.removeEventListener("capability-accessibility-activate", activate);
  }, [execute]);

  const closeActionKeyMode = useCallback(() => {
    buffer.current = "";
    setProtocol((current) => ({
      ...current,
      active: false,
      buffer: "",
      error: null,
    }));
    queueMicrotask(() => actionKeyPriorFocus.current?.focus());
  }, []);
  const openActionKeyMode = useCallback(() => {
    actionKeyPriorFocus.current = document.activeElement as HTMLElement;
    buffer.current = "";
    setProtocol((current) => ({
      ...current,
      active: true,
      buffer: "",
      error: null,
    }));
  }, []);
  const setActionKeyInput = useCallback((value: string) => {
    buffer.current = value;
    setProtocol((current) => ({ ...current, buffer: value, error: null }));
  }, []);
  const submitActionKey = useCallback(async () => {
    const entered = buffer.current.trim();
    if (!entered) return;
    // parseProtocol accepts the canonical trailing ENTER token and adds it
    // when omitted, so pasted registry commands and manually typed commands
    // follow the same execution path.
    const parsed = parseProtocol(entered, capabilities);
    if (!parsed) {
      setProtocol((current) => ({
        ...current,
        error:
          "That Action Key is not registered. Check the command and try again.",
      }));
      return;
    }
    closeActionKeyMode();
    await execute(parsed.capability.id, parsed.params, "hotkey");
  }, [closeActionKeyMode, execute]);
  useEffect(() => {
    const open = () => openActionKeyMode();
    const close = () => closeActionKeyMode();
    window.addEventListener("action-key-mode-open", open);
    window.addEventListener("action-key-mode-close", close);
    return () => {
      window.removeEventListener("action-key-mode-open", open);
      window.removeEventListener("action-key-mode-close", close);
    };
  }, [closeActionKeyMode, openActionKeyMode]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const actionKeyShortcut = isActionKeyModeShortcut(event);
      if (actionKeyShortcut) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat)
          void execute("system.openActionKeyMode", {}, "hotkey");
        return;
      }
      if (protocol.active) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeActionKeyMode();
        }
        return;
      }
      const next = advanceGateway(
        { step: step.current, lastAt: lastStepAt.current },
        event,
        Date.now(),
      );
      if (next.consume) {
        event.preventDefault();
        event.stopPropagation();
      }
      step.current = next.progress.step;
      lastStepAt.current = next.progress.lastAt;
      setProtocol((p) => ({ ...p, gatewayStep: step.current }));
      if (next.activated) {
        if (timer.current) clearTimeout(timer.current);
        setProtocol((current) => ({
          ...current,
          gatewayStep: 0,
          secretUnlocked: true,
        }));
        timer.current = setTimeout(
          () =>
            setProtocol((current) => ({ ...current, secretUnlocked: false })),
          5 * 60 * 1000,
        );
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [closeActionKeyMode, execute, protocol.active]);

  const value: Runtime = {
    last,
    history,
    execute,
    selectedElement,
    selectElement,
    surface,
    transcript,
    unread,
    protocol,
    toast,
    inspectedExecutionId,
    inspect: (executionId) => {
      setInspectedExecutionId(executionId);
      surfaceController.open("inspector");
    },
    openActionKeyMode,
    closeActionKeyMode,
    setActionKeyInput,
    submitActionKey,
    clearTranscript: () => saveTranscript(() => []),
    appendTranscript: (...lines) =>
      saveTranscript((current) => [...current, ...lines]),
    markRead: () => setUnread(0),
  };
  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}
export const useCapabilities = () => {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error("CapabilityProvider missing");
  return value;
};
