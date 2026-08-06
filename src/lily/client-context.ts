import { lilyCapabilityShortlist } from "./proposals";
import type { LilyResultReference, LilySession } from "./types";

export const LILY_CONTEXT_VERSION = 1;

export type LilyConfirmedExecutionContext = {
  capabilityId: string;
  arguments: Record<string, unknown>;
  status: "success" | "failure";
  returnedReferences: LilyResultReference[];
  errorMessage?: string;
};

export type LilyConversationContextMessage = {
  role: "user" | "lily" | "system";
  text: string;
  status?: "pending" | "complete" | "error";
};

export function buildLilyClientContext(input: {
  request: string;
  session: Pick<LilySession, "currentRoute" | "currentEntity">;
  conversation: LilyConversationContextMessage[];
  previousResults: LilyResultReference[];
  completedExecutions: LilyConfirmedExecutionContext[];
}) {
  return {
    contextVersion: LILY_CONTEXT_VERSION,
    agent: {
      name: "Navi",
      role: "MikeOS conversational navigation agent",
      executionBoundary:
        "Propose only. The browser validates and executes every capability.",
    },
    currentRequest: input.request,
    currentRoute: input.session.currentRoute,
    currentEntity: input.session.currentEntity ?? null,
    recentConversation: input.conversation.slice(-12).map((message) => ({
      role: message.role,
      text: message.text.slice(0, 600),
      status: message.status,
    })),
    previousResults: input.previousResults.slice(0, 12),
    confirmedBrowserExecutions: input.completedExecutions.slice(-4),
    capabilityMap: lilyCapabilityShortlist(),
    approvedChains: [
      "project.search -> project.view using a returned project slug",
      "article.search or article.list -> article.view using a returned article slug",
      "experience.list -> experience.view using a returned experience id",
      "a retrieval capability -> a grounded final response",
      "a reading-navigation request -> one navigation heading or page-position capability",
    ],
    decisionPriority: [
      "Prefer a permitted capability whenever the request maps to MikeOS content or navigation.",
      "For show, open, choose, strongest, latest, or take-me requests, continue from search/list to a grounded view capability.",
      "Use clarification only for materially ambiguous content domains.",
      "Use a text-only final response only when no capability is needed or after confirmed browser results support it.",
      "For next, previous, named-section, page-top, or main-content reading requests, use the matching navigation capability.",
    ],
    proposalContract: {
      oneProposalPerTurn: true,
      allowedKinds: ["capability", "clarification", "final"],
      capabilityIdsMustComeFrom: "capabilityMap",
      requiredArgumentsMustMatch: "capabilityMap.parameters",
      entityIdsMustComeFrom: "previousResults",
      successRequiresConfirmedBrowserExecution: true,
      responseMustBeStructured: true,
    },
  } as const;
}
