import { canonicalize } from "./conformance";
import type {
  AuthorityDecision,
  AuthorityGrant,
  AvailabilityEvidence,
  CapabilityDefinition,
  InvocationProvenance,
  Risk,
} from "./types";

const encoder = new TextEncoder();
const digest = async (value: unknown) => {
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalize(value)));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
};
const deny = (code: string, grant: AuthorityGrant | undefined, grantDigest: string | null = null): AuthorityDecision => ({
  state: "denied", code, source: grant ? "grant" : "local-policy", grantId: grant?.grantId ?? null,
  grantDigest, parentGrantId: grant?.parent?.grantId ?? null,
});

export function defaultProvenance(caller: InvocationProvenance["interface"]): InvocationProvenance {
  const modality = caller === "navigator" ? "unknown" : caller === "terminal" || caller === "agent" ? "text" : caller === "accessibility" ? "assistive" : caller === "hotkey" ? "keyboard" : "visual";
  return { actor: { id: caller === "navigator" ? "navi" : "browser-session", kind: caller === "navigator" ? "agent" : "human" }, interface: caller, modality };
}

export function normaliseProvenance(value: Partial<InvocationProvenance> | undefined, caller: InvocationProvenance["interface"]): InvocationProvenance {
  const fallback = defaultProvenance(caller);
  return {
    actor: value?.actor?.id && value.actor.kind ? value.actor : fallback.actor,
    interface: value?.interface ?? caller,
    modality: value?.modality ?? fallback.modality,
    ...(value?.delegatedBy ? { delegatedBy: value.delegatedBy } : {}),
  };
}

const withinParent = (child: AuthorityGrant, parent: AuthorityGrant) =>
  child.subject === parent.subject && child.capabilityId === parent.capabilityId &&
  canonicalize(child.arguments) === canonicalize(parent.arguments) &&
  child.risks.every(risk => parent.risks.includes(risk)) &&
  Date.parse(child.issuedAt) >= Date.parse(parent.issuedAt) && Date.parse(child.expiresAt) <= Date.parse(parent.expiresAt) &&
  (!parent.target || child.target === parent.target);

export async function evaluateAuthority(input: {
  capability: Pick<CapabilityDefinition, "id" | "risk">;
  params: Record<string, unknown>;
  provenance: InvocationProvenance;
  grant?: AuthorityGrant;
  target?: string;
  now?: Date;
  consumedGrantIds?: ReadonlySet<string>;
}): Promise<AuthorityDecision> {
  const { capability, params, provenance, grant } = input;
  const needsGrant = capability.risk === "write" || capability.risk === "destructive" || Boolean(provenance.delegatedBy);
  if (!needsGrant && !grant) return { state: "allowed", code: "LOCAL_EPHEMERAL_AUTHORITY", source: "local-policy", grantId: null, grantDigest: null, parentGrantId: null };
  if (!grant) return deny("AUTHORITY_GRANT_REQUIRED", grant);
  const grantDigest = await digest(grant);
  if (input.consumedGrantIds?.has(grant.grantId)) return deny("AUTHORITY_REPLAYED", grant, grantDigest);
  if (grant.schemaVersion !== 1) return deny("AUTHORITY_SCHEMA_MISMATCH", grant, grantDigest);
  if (grant.subject !== provenance.actor.id) return deny("AUTHORITY_SUBJECT_MISMATCH", grant, grantDigest);
  if (grant.capabilityId !== capability.id) return deny("AUTHORITY_CAPABILITY_MISMATCH", grant, grantDigest);
  if (canonicalize(grant.arguments) !== canonicalize(params)) return deny("AUTHORITY_ARGUMENT_MISMATCH", grant, grantDigest);
  if (input.target !== grant.target) return deny("AUTHORITY_TARGET_MISMATCH", grant, grantDigest);
  if (!grant.risks.includes(capability.risk)) return deny("AUTHORITY_RISK_WIDENING", grant, grantDigest);
  const now = (input.now ?? new Date()).getTime();
  if (!Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now) return deny("AUTHORITY_EXPIRED", grant, grantDigest);
  if (Date.parse(grant.issuedAt) > now) return deny("AUTHORITY_NOT_YET_VALID", grant, grantDigest);
  if (grant.parent && !withinParent(grant, grant.parent)) return deny("AUTHORITY_PARENT_WIDENING", grant, grantDigest);
  return { state: "allowed", code: "EXACT_GRANT_ALLOWED", source: "grant", grantId: grant.grantId, grantDigest, parentGrantId: grant.parent?.grantId ?? null };
}

export const localAvailability = (capabilityId: string, now = new Date()): AvailabilityEvidence => ({
  realisationId: `${capabilityId}:local`, status: "available", reasonCode: "LOCAL_REALISATION_READY",
  observedAt: now.toISOString(), summary: "The local browser realisation has no external runtime prerequisite.",
});

export async function inspectAvailability(capability: CapabilityDefinition, context: Parameters<NonNullable<CapabilityDefinition["realisation"]>["inspect"]>[0], now = new Date()) {
  const evidence = capability.realisation ? await capability.realisation.inspect(context) : localAvailability(capability.id, now);
  if (!evidence.realisationId || !["available", "degraded", "unavailable", "indeterminate"].includes(evidence.status) || Number.isNaN(Date.parse(evidence.observedAt))) {
    return { realisationId: capability.realisation?.id ?? `${capability.id}:unknown`, status: "indeterminate", reasonCode: "AVAILABILITY_EVIDENCE_INVALID", observedAt: now.toISOString(), summary: "Availability evidence could not be validated." } satisfies AvailabilityEvidence;
  }
  return evidence;
}
