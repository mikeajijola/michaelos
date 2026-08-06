import { capabilities, registry } from "@/capabilities/registry";
import { validateParams } from "@/capabilities/protocol";
import type { CapabilityDefinition } from "@/capabilities/types";
import type { LilyProposal, LilyResultReference } from "./types";

export const LILY_CAPABILITY_IDS = new Set(
  capabilities
    .filter(
      (item) =>
        item.navigator.enabled &&
        item.risk !== "write" &&
        item.risk !== "destructive",
    )
    .map((item) => item.id),
);
export function lilyCapabilityShortlist() {
  return [...LILY_CAPABILITY_IDS]
    .map((id) => registry.get(id))
    .filter((item): item is CapabilityDefinition => Boolean(item))
    .map((item) => ({
      id: item.id,
      namespace: item.id.split(".")[0],
      title: item.title,
      description: item.description,
      aliases: item.aliases ?? [],
      parameters: item.params.map((param) => ({
        name: param.name,
        description: param.description,
        type: param.type,
        required: param.required,
        values: param.values,
        default: param.default,
      })),
      exampleArguments: item.examples
        .slice(0, 2)
        .map((example) => example.params),
    }));
}
function searchQueryFromRequest(request: string) {
  const reduced = request
    .trim()
    .replace(
      /^(?:does\s+(?:he|mike|michael)\s+have\s+(?:anything|something)\s+(?:on|about|for)|(?:please\s+)?(?:show|find)\s+me\s+(?:anything|something)?\s*(?:on|about|for)?|(?:can|could)\s+you\s+(?:show|find)\s+me\s+(?:anything|something)?\s*(?:on|about|for)?)/i,
      "",
    )
    .replace(/[?.!]+$/g, "")
    .trim();
  return reduced || request.trim();
}

export function normaliseLilyProposal(
  value: unknown,
  request: string,
): unknown {
  if (!value || typeof value !== "object") return value;
  const proposal = value as LilyProposal;
  if (proposal.kind !== "capability") return value;
  const rawArguments =
    proposal.arguments && typeof proposal.arguments === "object"
      ? proposal.arguments
      : {};
  const args = Object.fromEntries(
    Object.entries(rawArguments).map(([key, argument]) => [
      key.trim(),
      argument,
    ]),
  );
  const capability = proposal.capabilityId
    ? registry.get(proposal.capabilityId)
    : undefined;
  const needsQuery = capability?.params.some(
    (parameter) => parameter.name === "query" && parameter.required,
  );
  if (needsQuery && !String(args.query ?? "").trim())
    args.query = searchQueryFromRequest(request);
  return { ...proposal, arguments: args };
}

export function preferCapabilityProposal(
  value: unknown,
  request: string,
  references: LilyResultReference[],
  completedCapabilityIds: string[],
): unknown {
  if (!value || typeof value !== "object") return value;
  const proposal = value as LilyProposal;
  if (proposal.kind !== "final") return value;
  const grounded = recoverLilyProposal(
    request,
    references,
    completedCapabilityIds,
  );
  return grounded?.kind === "capability" ? grounded : value;
}

export function validateLilyProposal(
  value: unknown,
  references: LilyResultReference[],
): LilyProposal {
  if (!value || typeof value !== "object")
    throw new Error("Navi returned no structured proposal.");
  const proposal = value as LilyProposal;
  if (
    !["capability", "clarification", "final"].includes(proposal.kind) ||
    typeof proposal.message !== "string"
  )
    throw new Error("Navi returned an invalid proposal shape.");
  if (proposal.kind !== "capability") return proposal;
  if (!proposal.capabilityId || !LILY_CAPABILITY_IDS.has(proposal.capabilityId))
    throw new Error(
      "Navi proposed a capability outside the permitted shortlist.",
    );
  const capability = registry.get(proposal.capabilityId);
  if (
    !capability ||
    capability.risk === "write" ||
    capability.risk === "destructive"
  )
    throw new Error(
      "Navi proposed a capability that is not safe for navigation.",
    );
  const args = validateParams(capability, proposal.arguments ?? {});
  if (
    proposal.capabilityId === "project.view" ||
    proposal.capabilityId === "article.view"
  ) {
    const slug = String(args.slug);
    if (
      !references.some(
        (ref) => ref.id === slug && proposal.capabilityId!.startsWith(ref.kind),
      )
    )
      throw new Error(
        "Navi proposed an entity slug that was not returned by a browser capability.",
      );
  }
  if (
    proposal.capabilityId === "experience.view" &&
    !references.some(
      (ref) => ref.kind === "experience" && ref.id === String(args.id),
    )
  )
    throw new Error(
      "Navi proposed an experience ID that was not returned by a browser capability.",
    );
  return { ...proposal, arguments: args };
}

/**
 * A narrow browser-side recovery for common navigation requests when a hosted
 * model turn completes without its requested structured result. It can only
 * return registry-backed proposals and can only open entities supplied by a
 * preceding browser execution.
 */
export function recoverLilyProposal(
  request: string,
  references: LilyResultReference[],
  completedCapabilityIds: string[] = [],
): LilyProposal | null {
  const text = request
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/\b(next|following)\s+(heading|section|title)\b/.test(text)) {
    return {
      kind: "capability",
      capabilityId: "navigation.nextHeading",
      arguments: {},
      message: "I’ll move to the next heading.",
      needsAnotherTurn: false,
    };
  }

  if (/\b(previous|prior|last)\s+(heading|section|title)\b/.test(text)) {
    return {
      kind: "capability",
      capabilityId: "navigation.previousHeading",
      arguments: {},
      message: "I’ll move to the previous heading.",
      needsAnotherTurn: false,
    };
  }

  if (/\b(top|start|beginning)\s+of\s+(the\s+)?page\b/.test(text)) {
    return {
      kind: "capability",
      capabilityId: "navigation.goTop",
      arguments: {},
      message: "I’ll move to the top of the page.",
      needsAnotherTurn: false,
    };
  }

  if (/\bmain\s+(content|reading area)\b/.test(text)) {
    return {
      kind: "capability",
      capabilityId: "navigation.goMainContent",
      arguments: {},
      message: "I’ll move to the main content.",
      needsAnotherTurn: false,
    };
  }

  const namedHeading = text.match(
    /\b(?:go|jump|skip|move|take me)\s+to\s+(?:the\s+)?(.+?)\s+(?:heading|section|title)\b/,
  )?.[1];
  if (namedHeading) {
    return {
      kind: "capability",
      capabilityId: "navigation.goHeading",
      arguments: { heading: namedHeading },
      message: `I’ll move to the ${namedHeading} heading.`,
      needsAnotherTurn: false,
    };
  }

  if (/\b(cv|resume|curriculum vitae)\b/.test(text)) {
    if (completedCapabilityIds.includes("cv.view")) {
      return { kind: "final", message: "I opened Mike’s CV." };
    }
    return {
      kind: "capability",
      capabilityId: "cv.view",
      arguments: {},
      message: "I’ll open Mike’s CV.",
      needsAnotherTurn: true,
    };
  }

  if (
    /\b(article|articles|writing|writings|blog|post|posts)\b/.test(text) ||
    /\b(company as code|semantic alerts?|ceoclaw|ceo claw)\b/.test(text)
  ) {
    if (completedCapabilityIds.includes("article.view")) {
      const article = references.find(
        (reference) => reference.kind === "article",
      );
      return {
        kind: "final",
        message: article
          ? `I opened ${article.label}.`
          : "I opened one of Mike’s articles.",
      };
    }
    const asksForCompanyFollowUp =
      /\b(follows?|after|lead to|led to|continue reading)\b/.test(text) &&
      /\b(ceoclaw|ceo claw|ceo)\b/.test(text);
    if (
      asksForCompanyFollowUp &&
      !completedCapabilityIds.includes("article.search")
    ) {
      return {
        kind: "capability",
        capabilityId: "article.search",
        arguments: { query: "Company as Code" },
        message: "I’ll find the article that develops the CEOclaw idea.",
        needsAnotherTurn: true,
      };
    }
    const article = references.find(
      (reference) => reference.kind === "article",
    );
    if (article) {
      return {
        kind: "capability",
        capabilityId: "article.view",
        arguments: { slug: article.id },
        message: `I’ll open ${article.label}.`,
        needsAnotherTurn: true,
      };
    }
    if (
      /\b(company as code|semantic alerts?|ceoclaw|ceo claw|lawneeds|law needs|aeroknite|aeronite|backstage|platform engineering|omnicede|omni seed)\b/.test(
        text,
      ) &&
      !completedCapabilityIds.includes("article.search")
    ) {
      return {
        kind: "capability",
        capabilityId: "article.search",
        arguments: { query: searchQueryFromRequest(request) },
        message: "I’ll search Mike’s writing.",
        needsAnotherTurn: true,
      };
    }
    return {
      kind: "capability",
      capabilityId: "article.list",
      arguments: {},
      message: "I’ll look through Mike’s writing.",
      needsAnotherTurn: true,
    };
  }

  if (/\bcapabilit(?:y|ies)\b/.test(text)) {
    if (completedCapabilityIds.includes("navigation.goCapabilities"))
      return { kind: "final", message: "I opened the capabilities page." };
    return {
      kind: "capability",
      capabilityId: "navigation.goCapabilities",
      arguments: {},
      message: "I’ll open the capabilities page.",
      needsAnotherTurn: true,
    };
  }

  const asksForProjects =
    /\b(project|projects)\b/.test(text) ||
    /\b(platform[-\s]+engineering|automation|agentic[-\s]+ai|ai[-\s]+work|lawneeds|law needs|aeroknite|aeronite|aero knite|nexus|backstage|omnicede|omni seed|michaelos|michael os|innovation endorsement|endorsed venture)\b/.test(
      text,
    );
  if (asksForProjects) {
    if (completedCapabilityIds.includes("project.view")) {
      const project = references.find((item) => item.kind === "project");
      return {
        kind: "final",
        message: project ? `I opened ${project.label}.` : "I opened the project.",
      };
    }
    const project = references.find((item) => item.kind === "project");
    const asksToOpen = /\b(open|take|show|choose|strongest|best|interesting)\b/.test(
      text,
    );
    if (
      project &&
      completedCapabilityIds.includes("project.search") &&
      /\b(what is|explain|tell me about)\b/.test(text)
    ) {
      return {
        kind: "final",
        message: `${project.label}: ${project.summary ?? "I found the matching project."}`,
      };
    }
    if (project && asksToOpen) {
      return {
        kind: "capability",
        capabilityId: "project.view",
        arguments: { slug: project.id },
        message: `I’ll open ${project.label}.`,
        needsAnotherTurn: true,
      };
    }
    if (/\b(project|projects)\s+(page|section)\b/.test(text)) {
      return {
        kind: "capability",
        capabilityId: "navigation.goProjects",
        arguments: {},
        message: "I’ll open Mike’s projects.",
        needsAnotherTurn: true,
      };
    }
    if (!completedCapabilityIds.includes("project.search")) {
      return {
        kind: "capability",
        capabilityId: "project.search",
        arguments: { query: searchQueryFromRequest(request) },
        message: "I’ll search Mike’s projects.",
        needsAnotherTurn: true,
      };
    }
  }

  if (/\b(experience|role|roles|job|career)\b/.test(text)) {
    if (completedCapabilityIds.includes("experience.view")) {
      const role = references.find((item) => item.kind === "experience");
      return {
        kind: "final",
        message: role ? `I opened ${role.label}.` : "I opened the role.",
      };
    }
    const role = references.find((item) => item.kind === "experience");
    if (role && /\b(open|take|show|latest|recent|current)\b/.test(text)) {
      return {
        kind: "capability",
        capabilityId: "experience.view",
        arguments: { id: role.id },
        message: `I’ll open ${role.label}.`,
        needsAnotherTurn: true,
      };
    }
    if (!completedCapabilityIds.includes("experience.list")) {
      return {
        kind: "capability",
        capabilityId: "experience.list",
        arguments: {},
        message: "I’ll check Mike’s experience.",
        needsAnotherTurn: true,
      };
    }
  }

  if (
    /\b(what|which)\b.*\b(website|site)\b/.test(text) ||
    /\b(what can i|show me around|explore this site)\b/.test(text)
  ) {
    return {
      kind: "final",
      message:
        "You can explore Mike’s projects, experience, writing, skills and CV. Ask me to open a section or find something specific.",
    };
  }

  return null;
}
export const lilyProposalSchema = {
  type: "object",
  properties: {
    kind: { type: "string", enum: ["capability", "clarification", "final"] },
    capabilityId: { type: "string" },
    arguments: { type: "object", additionalProperties: true },
    message: { type: "string" },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          request: { type: "string" },
        },
        required: ["id", "label", "request"],
        additionalProperties: false,
      },
    },
    needsAnotherTurn: { type: "boolean" },
  },
  required: ["kind", "message"],
  additionalProperties: false,
} as const;
export function compactReferences(result: unknown): LilyResultReference[] {
  if (!result || typeof result !== "object") return [];
  const value = result as Record<string, unknown>;
  const rows = (value.projects ?? value.articles ?? value.experience) as
    Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 12).map((row) => {
    if (row.slug && row.name)
      return {
        kind: "project" as const,
        id: String(row.slug),
        label: String(row.name),
        summary: String(row.summary ?? ""),
      };
    if (row.slug && row.title)
      return {
        kind: "article" as const,
        id: String(row.slug),
        label: String(row.title),
        summary: String(row.summary ?? ""),
      };
    return {
      kind: "experience" as const,
      id: String(row.id),
      label: `${row.title} at ${row.organisation}`,
      summary: `${row.period}: ${row.summary}`,
    };
  });
}
