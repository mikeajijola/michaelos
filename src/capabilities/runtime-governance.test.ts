import { describe, expect, it } from "vitest";
import { evaluateAuthority, inspectAvailability, localAvailability, normaliseProvenance } from "./runtime-governance";
import type { AuthorityGrant, CapabilityDefinition } from "./types";
import { registry } from "./registry";

const capability = { id: "profile.update", risk: "write" } as const;
const provenance = { actor: { id: "human:session-1", kind: "human" as const }, interface: "terminal" as const, modality: "text" as const };
const grant = (overrides: Partial<AuthorityGrant> = {}): AuthorityGrant => ({
  schemaVersion: 1, grantId: "grant-1", subject: provenance.actor.id, capabilityId: capability.id,
  arguments: { value: "exact" }, risks: ["write"], issuedAt: "2026-09-21T00:00:00.000Z",
  expiresAt: "2026-09-22T00:00:00.000Z", ...overrides,
});

describe("bounded invocation authority", () => {
  it("keeps actor/interface provenance separate and does not infer authority from either", async () => {
    expect(normaliseProvenance(provenance, "terminal")).toEqual(provenance);
    expect((await evaluateAuthority({ capability, params: { value: "exact" }, provenance, now: new Date("2026-09-21T12:00:00Z") })).code).toBe("AUTHORITY_GRANT_REQUIRED");
  });
  it("allows only an exact, current, attributable grant", async () => {
    const decision = await evaluateAuthority({ capability, params: { value: "exact" }, provenance, grant: grant(), now: new Date("2026-09-21T12:00:00Z") });
    expect(decision).toMatchObject({ state: "allowed", code: "EXACT_GRANT_ALLOWED", grantId: "grant-1" });
    expect(decision.grantDigest).toMatch(/^[a-f0-9]{64}$/);
    await expect(evaluateAuthority({ capability, params: { value: "changed" }, provenance, grant: grant(), now: new Date("2026-09-21T12:00:00Z") })).resolves.toMatchObject({ code: "AUTHORITY_ARGUMENT_MISMATCH" });
    await expect(evaluateAuthority({ capability, params: { value: "exact" }, provenance, grant: grant(), now: new Date("2026-09-23T00:00:00Z") })).resolves.toMatchObject({ code: "AUTHORITY_EXPIRED" });
    await expect(evaluateAuthority({ capability, params: { value: "exact" }, provenance, grant: grant(), consumedGrantIds: new Set(["grant-1"]), now: new Date("2026-09-21T12:00:00Z") })).resolves.toMatchObject({ code: "AUTHORITY_REPLAYED" });
  });
  it("rejects child authority that widens its parent", async () => {
    const parent = grant({ grantId: "parent", expiresAt: "2026-09-21T18:00:00.000Z" });
    const child = grant({ grantId: "child", expiresAt: "2026-09-21T19:00:00.000Z", parent });
    expect((await evaluateAuthority({ capability, params: { value: "exact" }, provenance, grant: child, now: new Date("2026-09-21T12:00:00Z") })).code).toBe("AUTHORITY_PARENT_WIDENING");
  });
  it("binds risky confirmation to the exact canonical invocation", async () => {
    const confirmedCapability = { ...capability, requiresConfirmation: true };
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode('{"arguments":{"value":"exact"},"capabilityId":"profile.update","target":null}'));
    const invocationDigest = Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, "0")).join("");
    const confirmed = grant({ confirmation: { confirmedAt: "2026-09-21T11:59:00.000Z", invocationDigest } });
    await expect(evaluateAuthority({ capability: confirmedCapability, params: { value: "exact" }, provenance, grant: confirmed, now: new Date("2026-09-21T12:00:00Z") })).resolves.toMatchObject({ state: "allowed" });
    await expect(evaluateAuthority({ capability: confirmedCapability, params: { value: "changed" }, provenance, grant: { ...confirmed, arguments: { value: "changed" } }, now: new Date("2026-09-21T12:00:00Z") })).resolves.toMatchObject({ code: "AUTHORITY_CONFIRMATION_MISMATCH" });
  });
});

describe("realisation availability", () => {
  const context = {} as never;
  it("keeps local capability existence stable with an explicit available realisation", async () => {
    const definition = { id: "local.read", risk: "read" } as CapabilityDefinition;
    expect(await inspectAvailability(definition, context, new Date("2026-09-21T00:00:00Z"))).toEqual(localAvailability("local.read", new Date("2026-09-21T00:00:00Z")));
  });
  it.each(["degraded", "unavailable", "indeterminate"] as const)("preserves %s evidence without removing the capability", async status => {
    const definition = { id: "external.read", risk: "read", realisation: { id: "external", inspect: () => ({ realisationId: "external", status, reasonCode: `FIXTURE_${status.toUpperCase()}`, observedAt: "2026-09-21T00:00:00.000Z", summary: status }) } } as unknown as CapabilityDefinition;
    expect((await inspectAvailability(definition, context)).status).toBe(status);
  });
  it.each([
    ["opfs", "available", "OPFS_DURABLE"],
    ["memory", "degraded", "OPFS_UNAVAILABLE_MEMORY_FALLBACK"],
    ["initialising", "indeterminate", "DATABASE_INITIALISING"],
    ["unavailable", "unavailable", "DATABASE_INITIALISATION_FAILED"],
  ] as const)("projects database runtime %s as %s", async (state, status, reasonCode) => {
    const definition = registry.get("system.reportCapabilityIssue")!;
    const runtimeContext = { database: { inspectRuntime: () => ({ state, reasonCode: state === "unavailable" ? reasonCode : null }) } } as never;
    await expect(inspectAvailability(definition, runtimeContext)).resolves.toMatchObject({ status, reasonCode });
  });
});
