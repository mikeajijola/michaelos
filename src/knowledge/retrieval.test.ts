import { describe, expect, it } from "vitest";
import { buildKnowledgeCorpus, knowledgeCorpusDigest, resolveConfirmedKnowledgeRef, searchKnowledge } from "./retrieval";
describe("grounded cross-domain knowledge retrieval", () => {
  it("projects every public knowledge kind from canonical content with stable identity", async () => {
    const corpus = buildKnowledgeCorpus();
    expect(new Set(corpus.map(item => item.ref.kind))).toEqual(new Set(["project", "article", "experience", "education", "skill", "recognition", "profile"]));
    expect(new Set(corpus.map(item => item.ref.sourceKey)).size).toBe(corpus.length);
    expect(await knowledgeCorpusDigest(corpus)).toBe(await knowledgeCorpusDigest(structuredClone(corpus)));
  });
  it("returns deterministic mixed typed results with attributable evidence", async () => {
    const first = await searchKnowledge("AI architecture platform", { limit: 20 });
    const second = await searchKnowledge("AI architecture platform", { limit: 20 });
    expect(first).toEqual(second);
    expect(new Set(first.hits.map(item => item.ref.kind)).size).toBeGreaterThan(1);
    expect(first.hits.every(item => item.evidenceSnippet && item.matchedFields.length && item.rank > 0)).toBe(true);
  });
  it("represents no-match explicitly and rejects fabricated grounding refs", async () => {
    const result = await searchKnowledge("qqqqzzzzvvvvxxxx");
    expect(result).toMatchObject({ status: "no-match", hits: [] });
    expect(() => resolveConfirmedKnowledgeRef(result, "project:invented")).toThrow("KNOWLEDGE_REFERENCE_NOT_CONFIRMED");
  });
  it("filters without changing the shared result contract", async () => {
    const result = await searchKnowledge("platform", { kinds: ["project"] });
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits.every(item => item.ref.kind === "project")).toBe(true);
  });
});
