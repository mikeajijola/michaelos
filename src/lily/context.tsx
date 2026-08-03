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
import { usePathname } from "next/navigation";
import { Client, type ClientSession } from "eve/client";
import { useCapabilities } from "@/capabilities/context";
import { capabilityTraceFromExecution } from "./capability-trace";
import {
  buildLilyClientContext,
  type LilyConfirmedExecutionContext,
} from "./client-context";
import {
  compactReferences,
  lilyProposalSchema,
  normaliseLilyProposal,
  preferCapabilityProposal,
  recoverLilyProposal,
  validateLilyProposal,
} from "./proposals";
import { loadLilySession, saveLilySession } from "./conversation-storage";
import {
  completedLilyPresentation,
  restoredLilyPresentation,
} from "./presentation";
import type {
  CapabilityTraceEntry,
  LilyMessage,
  LilyPresentationState,
  LilyProposal,
  LilySession,
} from "./types";

type LilyRuntime = {
  session: LilySession;
  submit: (text: string) => Promise<void>;
  open: () => void;
  close: () => void;
  clear: () => void;
  setPresentation: (value: LilyPresentationState) => void;
};
const LilyContext = createContext<LilyRuntime | null>(null);
const now = () => new Date().toISOString();
const createMessage = (
  role: LilyMessage["role"],
  text: string,
  extra: Partial<LilyMessage> = {},
): LilyMessage => ({
  id: `lily_${crypto.randomUUID()}`,
  role,
  text,
  createdAt: now(),
  ...extra,
});
function fresh(route = "/"): LilySession {
  const createdAt = now();
  return {
    id: `lily_session_${crypto.randomUUID()}`,
    messages: [],
    presentation: route === "/" ? "landing-idle" : "bubble-collapsed",
    currentRoute: route,
    previousResults: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export function LilyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const capabilities = useCapabilities();
  const remote = useRef<ClientSession | null>(null);
  const [session, setSession] = useState<LilySession>(() => fresh(pathname));
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const update = useCallback(
    (change: (current: LilySession) => LilySession) =>
      setSession((current) => {
        const next = { ...change(current), updatedAt: now() };
        sessionRef.current = next;
        saveLilySession(next);
        return next;
      }),
    [],
  );
  useEffect(() => {
    const saved = loadLilySession();
    if (saved) {
      setSession({
        ...saved,
        currentRoute: pathname,
        presentation: restoredLilyPresentation(pathname, saved.presentation),
      });
      remote.current = new Client({ host: "" }).session(saved.eveSession);
    } else remote.current = new Client({ host: "" }).session();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    update((current) => ({ ...current, currentRoute: pathname }));
  }, [pathname, update]);
  const setPresentation = useCallback(
    (presentation: LilyPresentationState) =>
      update((current) => ({ ...current, presentation })),
    [update],
  );
  const open = useCallback(
    () => setPresentation("bubble-open"),
    [setPresentation],
  );
  const close = useCallback(
    () => setPresentation("bubble-collapsed"),
    [setPresentation],
  );
  const clear = useCallback(() => {
    remote.current = new Client({ host: "" }).session();
    setSession(fresh(pathname));
  }, [pathname]);
  useEffect(() => {
    const control = (raw: Event) => {
      const action = (raw as CustomEvent<{ action: string }>).detail.action;
      if (action === "open") open();
      if (action === "close") close();
      if (action === "clear") clear();
    };
    window.addEventListener("lily-control", control);
    return () => window.removeEventListener("lily-control", control);
  }, [clear, close, open]);
  const submit = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sessionRef.current.activeRequestId) return;
      const requestId = `lily_request_${crypto.randomUUID()}`;
      const conversationContext = [
        ...sessionRef.current.messages.map((message) => ({
          role: message.role,
          text: message.text,
          status: message.status,
        })),
        { role: "user" as const, text, status: "complete" as const },
      ];
      const landing = sessionRef.current.currentRoute === "/";
      update((current) => ({
        ...current,
        activeRequestId: requestId,
        presentation: landing ? "landing-resolving" : "bubble-open",
        messages: [
          ...current.messages,
          createMessage("user", text),
          createMessage(
            "lily",
            "Consulting the permitted MichaelOS capabilities…",
            { id: requestId, status: "pending" },
          ),
        ],
      }));
      const trace: CapabilityTraceEntry[] = [];
      const confirmedExecutions: LilyConfirmedExecutionContext[] = [];
      let references = sessionRef.current.previousResults;
      let finalText = "";
      let failed = false;
      try {
        if (!remote.current)
          remote.current = new Client({ host: "" }).session(
            sessionRef.current.eveSession,
          );
        let prompt = text;
        for (let step = 0; step < 4; step++) {
          const clientContext = JSON.parse(
            JSON.stringify(
              buildLilyClientContext({
                request: text,
                session: sessionRef.current,
                conversation: conversationContext,
                previousResults: references,
                completedExecutions: confirmedExecutions,
              }),
            ),
          );
          const sendTurn = async () => {
            const response = await remote.current!.send<LilyProposal>({
              message: prompt,
              clientContext,
              outputSchema: lilyProposalSchema,
            });
            return response.result();
          };
          let result = await sendTurn();
          let retriedWithFreshSession = false;
          if (!result.data) {
            // Persisted eve continuations can outlive an agent deployment. Retry
            // the same grounded browser turn once in a fresh remote session.
            remote.current = new Client({ host: "" }).session();
            result = await sendTurn();
            retriedWithFreshSession = true;
          }
          const recover = (data: unknown) =>
            data ??
            recoverLilyProposal(
              text,
              references,
              trace.map((entry) => entry.capabilityId),
            );
          let proposal: LilyProposal;
          try {
            proposal = validateLilyProposal(
              preferCapabilityProposal(
                normaliseLilyProposal(recover(result.data), text),
                text,
                references,
                trace.map((entry) => entry.capabilityId),
              ),
              references,
            );
          } catch (error) {
            if (retriedWithFreshSession) throw error;
            remote.current = new Client({ host: "" }).session();
            result = await sendTurn();
            proposal = validateLilyProposal(
              preferCapabilityProposal(
                normaliseLilyProposal(recover(result.data), text),
                text,
                references,
                trace.map((entry) => entry.capabilityId),
              ),
              references,
            );
          }
          update((current) => ({
            ...current,
            eveSession: remote.current?.state,
          }));
          if (proposal.kind === "clarification") {
            finalText = proposal.message;
            update((current) => ({
              ...current,
              messages: current.messages.map((item) =>
                item.id === requestId
                  ? { ...item, clarificationOptions: proposal.options }
                  : item,
              ),
            }));
            break;
          }
          if (proposal.kind === "final") {
            finalText = proposal.message;
            break;
          }
          update((current) => ({
            ...current,
            presentation: landing ? "landing-navigating" : current.presentation,
          }));
          const execution = await capabilities.execute(
            proposal.capabilityId!,
            proposal.arguments ?? {},
            "navigator",
          );
          trace.push(capabilityTraceFromExecution(execution));
          const found = compactReferences(execution.result);
          if (found.length) references = found;
          confirmedExecutions.push({
            capabilityId: execution.capabilityId,
            arguments: execution.params,
            status: execution.status,
            returnedReferences: found,
            errorMessage: execution.error?.message,
          });
          prompt = JSON.stringify({
            browserExecution: {
              capabilityId: execution.capabilityId,
              arguments: execution.params,
              status: execution.status,
              result: execution.status === "success" ? execution.result : null,
              error: execution.error,
            },
            instruction:
              "Use only this confirmed browser result. Propose one next permitted capability or return a final response.",
          });
          if (execution.status === "failure") {
            failed = true;
            finalText = `I couldn’t complete ${execution.capabilityId}. ${execution.error?.message ?? "The browser capability failed."}`;
            break;
          }
          if (!proposal.needsAnotherTurn && step === 3)
            finalText = proposal.message;
        }
        if (!finalText)
          finalText = trace.length
            ? "I completed the confirmed browser action."
            : "I couldn’t map that request to an available action.";
      } catch (error) {
        failed = true;
        finalText = `Navi couldn’t resolve that request. ${error instanceof Error ? error.message : String(error)}`;
      }
      const navigated = trace.some(
        (entry) =>
          entry.status === "success" &&
          /^(navigation\.|project\.view|article\.view|experience\.view)/.test(
            entry.capabilityId,
          ),
      );
      update((current) => ({
        ...current,
        activeRequestId: undefined,
        previousResults: references,
        presentation: completedLilyPresentation(landing, navigated),
        messages: current.messages.map((item) =>
          item.id === requestId
            ? {
                ...item,
                text: finalText,
                status: failed ? "error" : "complete",
                capabilityTrace: trace,
              }
            : item,
        ),
      }));
      if (navigated)
        window.setTimeout(() => setPresentation("bubble-open"), 760);
    },
    [capabilities, setPresentation, update],
  );
  const value = useMemo(
    () => ({ session, submit, open, close, clear, setPresentation }),
    [session, submit, open, close, clear, setPresentation],
  );
  return <LilyContext.Provider value={value}>{children}</LilyContext.Provider>;
}
export function useLily() {
  const value = useContext(LilyContext);
  if (!value) throw new Error("LilyProvider missing");
  return value;
}
