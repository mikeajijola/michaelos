import { canonicalize } from "./conformance";

export type CriterionState = "satisfied" | "failed" | "indeterminate" | "not-applicable";
export type AcceptanceCriterion = { id: string; text: string; required?: boolean };
export type CompletionEvidence = { criterionId: string; state: CriterionState; references: string[]; actor: string; taskDigest: string; candidateRevision: string; integratedRevision?: string };
export type CompletionReport = {
  schemaVersion: 1; issue: string; taskDigest: string; candidateRevision: string; integratedRevision: string | null;
  mergeState: "unmerged" | "merged"; completionState: "complete" | "incomplete" | "indeterminate";
  criteria: Array<AcceptanceCriterion & { state: CriterionState; references: string[]; actor: string | null }>;
};

export async function digestIssueContract(criteria: AcceptanceCriterion[]) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalize(criteria)));
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, "0")).join("");
}
export function extractAcceptanceCriteria(markdown: string): AcceptanceCriterion[] {
  const section = markdown.match(/##+\s+Acceptance(?: criteria| evaluation)?\s*\n([\s\S]*?)(?=\n##+\s|$)/i)?.[1] ?? "";
  const numbered = [...section.matchAll(/^\s*(\d+)[.)]\s+(.+)$/gm)].map(match => ({ id: match[1], text: match[2].trim() }));
  if (numbered.length) return numbered;
  return [...section.matchAll(/^\s*[-*]\s+(.+)$/gm)].map((match, index) => ({ id: String(index + 1), text: match[1].trim() }));
}
export function evaluateIssueCompletion(input: { issue: string; criteria: AcceptanceCriterion[]; taskDigest: string; candidateRevision: string; integratedRevision?: string | null; merged: boolean; requiredChecksPassed: boolean; evidence: CompletionEvidence[] }): CompletionReport {
  const criteria = input.criteria.map(criterion => {
    const matches = input.evidence.filter(item => item.criterionId === criterion.id && item.taskDigest === input.taskDigest && item.candidateRevision === input.candidateRevision && (!input.integratedRevision || item.integratedRevision === input.integratedRevision));
    const selected = matches.find(item => item.state === "failed") ?? matches.find(item => item.state === "satisfied") ?? matches[0];
    return { ...criterion, state: selected?.state ?? "indeterminate", references: selected?.references ?? [], actor: selected?.actor ?? null };
  });
  const required = criteria.filter(item => item.required !== false);
  const complete = input.merged && input.requiredChecksPassed && Boolean(input.integratedRevision) && required.every(item => item.state === "satisfied" && item.references.length > 0);
  const failed = !input.requiredChecksPassed || required.some(item => item.state === "failed");
  return { schemaVersion: 1, issue: input.issue, taskDigest: input.taskDigest, candidateRevision: input.candidateRevision, integratedRevision: input.integratedRevision ?? null, mergeState: input.merged ? "merged" : "unmerged", completionState: complete ? "complete" : failed ? "incomplete" : "indeterminate", criteria };
}
export function formatCompletionReport(report: CompletionReport) {
  return [
    `${report.issue} · ${report.completionState.toUpperCase()}`,
    `Merge: ${report.mergeState} · candidate ${report.candidateRevision} · integrated ${report.integratedRevision ?? "unavailable"}`,
    `Task contract: ${report.taskDigest}`,
    ...report.criteria.map(item => `${item.id}. [${item.state}] ${item.text} — ${item.references.length ? item.references.join(", ") : "no evidence"}${item.actor ? ` (${item.actor})` : ""}`),
  ].join("\n");
}
