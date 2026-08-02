import type { CapabilityExecution } from "@/capabilities/types";

export type LilyNavigationPlanType =
  | "navigate"
  | "search"
  | "search_then_open"
  | "list_then_select"
  | "retrieve_then_answer"
  | "follow_up_reference"
  | "clarification"
  | "unsupported";
export type LilyPresentationState =
  | "landing-idle"
  | "landing-resolving"
  | "landing-navigating"
  | "morphing-to-bubble"
  | "bubble-collapsed"
  | "bubble-open"
  | "console-open";
export type CapabilityTraceEntry = {
  executionId: string;
  capabilityId: string;
  arguments: Record<string, unknown>;
  actionKeys: string | null;
  cliCommand: string | null;
  status: "success" | "error";
  durationMs?: number;
  resultSummary?: string;
  errorMessage?: string;
};
export type LilyClarificationOption = {
  id: string;
  label: string;
  request: string;
};
export type LilyMessage = {
  id: string;
  role: "user" | "lily" | "system";
  text: string;
  createdAt: string;
  status?: "pending" | "complete" | "error";
  capabilityTrace?: CapabilityTraceEntry[];
  clarificationOptions?: LilyClarificationOption[];
};
export type LilyResultReference = {
  kind: "project" | "article" | "experience";
  id: string;
  label: string;
  route?: string;
  summary?: string;
};
export type LilySession = {
  id: string;
  messages: LilyMessage[];
  presentation: LilyPresentationState;
  currentRoute: string;
  currentEntity?: { type: string; id: string };
  previousResults: LilyResultReference[];
  activeRequestId?: string;
  eveSession?: {
    continuationToken?: string;
    sessionId?: string;
    streamIndex: number;
  };
  createdAt: string;
  updatedAt: string;
};
export type LilyBubblePosition = { edge: "left" | "right"; yRatio: number };
export type LilyProposal = {
  kind: "capability" | "clarification" | "final";
  capabilityId?: string;
  arguments?: Record<string, unknown>;
  message: string;
  options?: LilyClarificationOption[];
  needsAnotherTurn?: boolean;
};
export type LilyExecutor = (
  id: string,
  args: Record<string, unknown>,
  caller: "navigator",
) => Promise<CapabilityExecution>;
