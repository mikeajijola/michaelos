import { describe, expect, it } from "vitest";
import { resolveCanonicalInvocation } from "@/capabilities/invocation";
import { capabilities } from "@/capabilities/registry";
import { capabilityTraceFromExecution } from "./capability-trace";
import { buildLilyClientContext } from "./client-context";
import {
  LILY_CAPABILITY_IDS,
  compactReferences,
  normaliseLilyProposal,
  preferCapabilityProposal,
  recoverLilyProposal,
  validateLilyProposal,
} from "./proposals";
import type { CapabilityExecution } from "@/capabilities/types";
import {
  completedLilyPresentation,
  restoredLilyPresentation,
  shouldOpenLilyPanel,
  shouldShowLilyCompanion,
} from "./presentation";

describe("Lily proposal boundary", () => {
  it("derives the shortlist from navigator-enabled, non-mutating registry entries", () => {
    expect(LILY_CAPABILITY_IDS.has("project.search")).toBe(true);
    expect(LILY_CAPABILITY_IDS.has("system.reportCapabilityIssue")).toBe(false);
    expect(
      [...LILY_CAPABILITY_IDS].every(
        (id) => capabilities.find((item) => item.id === id)?.navigator.enabled,
      ),
    ).toBe(true);
  });
  it("rejects invented capabilities and ungrounded entity slugs", () => {
    expect(() =>
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.destroy",
          arguments: {},
          message: "",
        },
        [],
      ),
    ).toThrow(/outside/);
    expect(() =>
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.view",
          arguments: { slug: "invented" },
          message: "",
        },
        [],
      ),
    ).toThrow(/not returned/);
  });
  it("accepts a returned entity reference", () => {
    const refs = compactReferences({
      projects: [
        { slug: "atlas-platform", name: "Atlas Platform", summary: "Platform" },
      ],
    });
    expect(
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.view",
          arguments: { slug: "atlas-platform" },
          message: "Open it",
        },
        refs,
      ),
    ).toMatchObject({
      capabilityId: "project.view",
      arguments: { slug: "atlas-platform" },
    });
  });
  it("repairs a missing required search query from natural wording", () => {
    const raw = {
      kind: "capability",
      capabilityId: "project.search",
      arguments: {},
      message: "I’ll look.",
    };
    const repaired = normaliseLilyProposal(
      raw,
      "Does he have anything on platform engineering?",
    );
    expect(validateLilyProposal(repaired, [])).toMatchObject({
      capabilityId: "project.search",
      arguments: { query: "platform engineering" },
    });
  });
  it("normalises whitespace in model-generated argument names", () => {
    const raw = {
      kind: "capability",
      capabilityId: "article.search",
      arguments: { " query ": "local-first" },
      message: "I’ll look.",
    };
    expect(
      validateLilyProposal(
        normaliseLilyProposal(raw, "Find local-first writing"),
        [],
      ),
    ).toMatchObject({ arguments: { query: "local-first" } });
  });
  it.each([
    "Where I get Michael's cv",
    "Where can I find Michael's CV?",
    "Can you show me the resume?",
  ])("recovers conversational CV navigation: %s", (request) => {
    expect(recoverLilyProposal(request, [])).toMatchObject({
      kind: "capability",
      capabilityId: "cv.view",
      arguments: {},
    });
  });
  it("lists writing before selecting an interesting real article", () => {
    expect(
      recoverLilyProposal("Show me an interesting article from Michael", []),
    ).toMatchObject({ capabilityId: "article.list" });
    const references = compactReferences({
      articles: [
        {
          slug: "local-first",
          title: "Local-first systems",
          summary: "Resilient software",
        },
      ],
    });
    const proposal = recoverLilyProposal(
      "Show me an interesting article from Michael",
      references,
    );
    expect(validateLilyProposal(proposal, references)).toMatchObject({
      capabilityId: "article.view",
      arguments: { slug: "local-first" },
    });
    expect(
      recoverLilyProposal("Show me an interesting article", references, [
        "article.list",
        "article.view",
      ]),
    ).toEqual({ kind: "final", message: "I opened Local-first systems." });
  });
  it("replaces a premature text response with grounded project navigation", () => {
    const final = {
      kind: "final" as const,
      message: "Mike has worked on platform engineering.",
    };
    expect(
      preferCapabilityProposal(
        final,
        "Show me his platform-engineering work",
        [],
        [],
      ),
    ).toMatchObject({
      kind: "capability",
      capabilityId: "project.search",
    });

    const references = compactReferences({
      projects: [
        { slug: "atlas-platform", name: "Atlas Platform", summary: "Platform" },
      ],
    });
    expect(
      preferCapabilityProposal(
        final,
        "Show me his platform-engineering work",
        references,
        ["project.search"],
      ),
    ).toMatchObject({
      capabilityId: "project.view",
      arguments: { slug: "atlas-platform" },
    });
  });
  it("keeps genuine website-orientation answers as text responses", () => {
    const final = {
      kind: "final" as const,
      message: "You can explore Mike’s work.",
    };
    expect(
      preferCapabilityProposal(
        final,
        "What can I see on this website?",
        [],
        [],
      ),
    ).toEqual(final);
  });
  it.each([
    "What type of things can I see on this website?",
    "What can I explore on this site?",
    "Show me around",
  ])("recovers a website discovery question: %s", (request) => {
    expect(recoverLilyProposal(request, [])).toMatchObject({
      kind: "final",
      message: expect.stringContaining("projects"),
    });
  });
});

describe("Lily Gemini client context", () => {
  it("sends a complete safe capability map on every turn", () => {
    const context = buildLilyClientContext({
      request: "Does he have anything on platform engineering?",
      session: { currentRoute: "/capabilities" },
      conversation: [
        { role: "user", text: "Show me the capabilities page." },
        { role: "lily", text: "I opened it.", status: "complete" },
      ],
      previousResults: [],
      completedExecutions: [],
    });
    expect(context.currentRequest).toContain("platform engineering");
    expect(context.currentRoute).toBe("/capabilities");
    expect(context.recentConversation).toHaveLength(2);
    expect(
      context.capabilityMap.find((item) => item.id === "project.search"),
    ).toMatchObject({
      namespace: "project",
      parameters: [expect.objectContaining({ name: "query", required: true })],
    });
    expect(
      context.capabilityMap.some(
        (item) => item.id === "system.reportCapabilityIssue",
      ),
    ).toBe(false);
    expect(context.proposalContract.capabilityIdsMustComeFrom).toBe(
      "capabilityMap",
    );
  });

  it("carries grounded references and confirmed browser executions after a capability turn", () => {
    const reference = {
      kind: "project" as const,
      id: "atlas-platform",
      label: "Atlas Platform",
    };
    const context = buildLilyClientContext({
      request: "Open the first one",
      session: {
        currentRoute: "/projects",
        currentEntity: { type: "project", id: "atlas-platform" },
      },
      conversation: Array.from({ length: 15 }, (_, index) => ({
        role: "user" as const,
        text: `message ${index}`,
      })),
      previousResults: [reference],
      completedExecutions: [
        {
          capabilityId: "project.search",
          arguments: { query: "platform" },
          status: "success",
          returnedReferences: [reference],
        },
      ],
    });
    expect(context.recentConversation).toHaveLength(12);
    expect(context.previousResults).toEqual([reference]);
    expect(context.confirmedBrowserExecutions[0]).toMatchObject({
      capabilityId: "project.search",
      status: "success",
    });
  });
});

describe("Lily homepage surface continuity", () => {
  it("never stacks the floating companion over the homepage prompt", () => {
    expect(shouldShowLilyCompanion("/")).toBe(false);
    expect(restoredLilyPresentation("/", "bubble-open")).toBe("landing-idle");
  });

  it("keeps non-navigation responses on the landing surface", () => {
    expect(completedLilyPresentation(true, false)).toBe("landing-idle");
  });

  it("morphs to the companion only after homepage navigation", () => {
    expect(completedLilyPresentation(true, true)).toBe("morphing-to-bubble");
    expect(shouldShowLilyCompanion("/projects")).toBe(true);
  });

  it("opens the panel immediately on the destination without flashing the bubble", () => {
    expect(
      shouldOpenLilyPanel(
        "/projects",
        "landing-navigating",
        "active-request",
      ),
    ).toBe(true);
    expect(
      shouldOpenLilyPanel("/projects", "morphing-to-bubble"),
    ).toBe(true);
    expect(shouldOpenLilyPanel("/projects", "bubble-collapsed")).toBe(false);
    expect(
      shouldOpenLilyPanel("/", "landing-navigating", "active-request"),
    ).toBe(false);
  });
});

describe("Lily Capability Trace", () => {
  it("uses the same canonical quoted CLI and Action Keys as the registry", () => {
    const invocation = resolveCanonicalInvocation("project.search", {
      query: "platform engineering",
    });
    expect(invocation.cliCommand).toBe(
      'run project.search --query "platform engineering"',
    );
    expect(invocation.actionKeys).toBe(
      "PROJECT SEARCH platform engineering ENTER",
    );
    const execution = {
      executionId: "exec_1",
      capabilityId: "project.search",
      caller: "navigator",
      params: { query: "platform engineering" },
      status: "success",
      result: { count: 1 },
      error: null,
      durationMs: 8,
      timestamp: new Date(0).toISOString(),
      resolvedCli: invocation.cliCommand!,
      resolvedActionKeys: invocation.actionKeys!,
      accessibilityLabel: "Search portfolio projects",
      confirmationStatus: "not-required",
    } satisfies CapabilityExecution;
    expect(capabilityTraceFromExecution(execution)).toMatchObject({
      capabilityId: invocation.capabilityId,
      arguments: invocation.arguments,
      cliCommand: invocation.cliCommand,
      actionKeys: invocation.actionKeys,
      status: "success",
    });
  });
  it("constructs an honest error trace from executor metadata", () => {
    const execution = {
      executionId: "exec_2",
      capabilityId: "project.view",
      caller: "navigator",
      params: { slug: "missing" },
      status: "failure",
      result: null,
      error: { code: "PROJECT_NOT_FOUND", message: "Not found" },
      durationMs: 3,
      timestamp: new Date(0).toISOString(),
      resolvedCli: "run project.view --slug missing",
      resolvedActionKeys: "PROJECT VIEW missing ENTER",
      accessibilityLabel: "Open project details",
      confirmationStatus: "not-required",
    } satisfies CapabilityExecution;
    expect(capabilityTraceFromExecution(execution)).toMatchObject({
      status: "error",
      errorMessage: "Not found",
    });
  });
});
