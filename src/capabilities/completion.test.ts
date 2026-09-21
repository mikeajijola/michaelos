import { describe, expect, it } from "vitest";
import { digestIssueContract, evaluateIssueCompletion, extractAcceptanceCriteria, formatCompletionReport, type AcceptanceCriterion, type CompletionEvidence } from "./completion";
const criteria: AcceptanceCriterion[] = [{ id: "1", text: "Unit checks pass" }, { id: "2", text: "Browser evidence exists" }];
const evidence = (digest: string): CompletionEvidence[] => criteria.map(item => ({ criterionId: item.id, state: "satisfied", references: [`evidence:${item.id}`], actor: "github-actions", taskDigest: digest, candidateRevision: "head", integratedRevision: "main" }));
describe("issue completion conformance", () => {
  it("keeps merge and completion separate and reports missing evidence", async () => {
    const digest = await digestIssueContract(criteria);
    const report = evaluateIssueCompletion({ issue: "michaelos#1", criteria, taskDigest: digest, candidateRevision: "head", integratedRevision: "main", merged: true, requiredChecksPassed: true, evidence: evidence(digest).slice(0, 1) });
    expect(report).toMatchObject({ mergeState: "merged", completionState: "indeterminate" });
    expect(report.criteria[1]).toMatchObject({ state: "indeterminate", references: [] });
  });
  it("completes only exact-head, integrated, fully evidenced criteria", async () => {
    const digest = await digestIssueContract(criteria);
    expect(evaluateIssueCompletion({ issue: "synthetic#1", criteria, taskDigest: digest, candidateRevision: "head", integratedRevision: "main", merged: true, requiredChecksPassed: true, evidence: evidence(digest) }).completionState).toBe("complete");
    expect(evaluateIssueCompletion({ issue: "synthetic#1", criteria, taskDigest: `${digest}changed`, candidateRevision: "head", integratedRevision: "main", merged: true, requiredChecksPassed: true, evidence: evidence(digest) }).completionState).toBe("indeterminate");
  });
  it("does not turn blockers or failed checks into completion", async () => {
    const digest = await digestIssueContract(criteria);
    const report = evaluateIssueCompletion({ issue: "synthetic#2", criteria, taskDigest: digest, candidateRevision: "head", integratedRevision: "main", merged: true, requiredChecksPassed: false, evidence: evidence(digest) });
    expect(report.completionState).toBe("incomplete");
  });
  it("extracts every numbered criterion and keeps human and machine projections lossless", async () => {
    const extracted = extractAcceptanceCriteria("# Work\n\n## Acceptance criteria\n\n1. Unit checks pass.\n2. Browser evidence exists.\n\n## Plan\nLater");
    expect(extracted).toEqual([{ id: "1", text: "Unit checks pass." }, { id: "2", text: "Browser evidence exists." }]);
    const digest = await digestIssueContract(extracted);
    const report = evaluateIssueCompletion({ issue: "michaelos#1", criteria: extracted, taskDigest: digest, candidateRevision: "head", integratedRevision: "main", merged: true, requiredChecksPassed: true, evidence: evidence(digest) });
    const human = formatCompletionReport(report);
    for (const value of [report.issue, report.taskDigest, report.candidateRevision, report.integratedRevision!, ...report.criteria.flatMap(item => [item.id, item.state, ...item.references])]) expect(human).toContain(value);
  });
});
