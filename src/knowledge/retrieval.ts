import { aliases, articles, education, experience, profile, projects, recognition, skills } from "@/data/content";
import { canonicalize } from "@/capabilities/conformance";

export type KnowledgeKind = "project" | "article" | "experience" | "education" | "skill" | "recognition" | "profile";
export type KnowledgeSourceRef = { kind: KnowledgeKind; id: string; route?: string; sourceKey: string };
export type KnowledgeRecord = { ref: KnowledgeSourceRef; title: string; text: string; aliases: string[]; fields: Record<string, string> };
export type KnowledgeHit = { ref: KnowledgeSourceRef; title: string; evidenceSnippet: string; matchedFields: string[]; score: number; rank: number };
export type KnowledgeSearchResult = { schemaVersion: 1; query: string; corpusDigest: string; retrievalStrategy: "deterministic-lexical-v1"; status: "matched" | "no-match"; hits: KnowledgeHit[] };

const flatten = (value: unknown): string => Array.isArray(value) ? value.map(flatten).join(" ") : value && typeof value === "object" ? Object.values(value).map(flatten).join(" ") : String(value ?? "");
const record = (kind: KnowledgeKind, id: string, title: string, fields: Record<string, unknown>, route?: string): KnowledgeRecord => {
  const normalized = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, flatten(value)]));
  const slug = typeof fields.slug === "string" ? fields.slug : id;
  const relatedAliases = Array.isArray(fields.relatedProjectIds) ? fields.relatedProjectIds.flatMap(key => aliases[String(key)] ?? []) : [];
  const recordAliases = [...(aliases[id] ?? []), ...(aliases[slug] ?? []), ...relatedAliases, ...(slug.includes("ceoclaw") ? aliases.ceoclaw ?? [] : [])];
  return { ref: { kind, id, ...(route ? { route } : {}), sourceKey: `${kind}:${id}` }, title, text: Object.values(normalized).join(" "), aliases: [...new Set(recordAliases)], fields: normalized };
};
export function buildKnowledgeCorpus(): KnowledgeRecord[] {
  const records = [
    record("profile", "mike-ajijola", profile.formalName, profile, "/"),
    ...projects.map(item => record("project", item.id, item.name, item, `/projects?project=${item.slug}`)),
    ...articles.filter(item => item.status === "published").map(item => record("article", item.id, item.title, item, `/blog/${item.slug}`)),
    ...experience.map(item => record("experience", item.id, `${item.title} · ${item.organisation}`, item, "/experience")),
    ...education.map(item => record("education", item.id, item.qualification, item, "/experience")),
    ...skills.map(item => record("skill", item.id, item.name, item, "/experience")),
    ...recognition.map(item => record("recognition", item.id, item.title, item, "/experience")),
  ];
  return records.sort((a, b) => a.ref.sourceKey.localeCompare(b.ref.sourceKey));
}
export async function knowledgeCorpusDigest(corpus = buildKnowledgeCorpus()) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalize(corpus)));
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, "0")).join("");
}
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export async function searchKnowledge(query: string, options: { kinds?: KnowledgeKind[]; limit?: number; corpus?: KnowledgeRecord[] } = {}): Promise<KnowledgeSearchResult> {
  const corpus = options.corpus ?? buildKnowledgeCorpus();
  const normalizedQuery = normalize(query);
  const terms = [...new Set(normalizedQuery.split(" ").filter(term => term.length > 1))];
  const candidates = !normalizedQuery ? [] : corpus.filter(item => !options.kinds || options.kinds.includes(item.ref.kind)).map(item => {
    const fields: Record<string, string> = { title: item.title, aliases: item.aliases.join(" "), ...item.fields };
    const matchedFields = Object.entries(fields).filter(([, value]) => terms.some(term => normalize(value).includes(term))).map(([key]) => key).sort();
    const title = normalize(item.title), alias = normalize(item.aliases.join(" ")), full = normalize(item.text);
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 8 : 0) + (alias.includes(term) ? 6 : 0) + (full.includes(term) ? 1 : 0), normalizedQuery === title ? 20 : 0);
    const evidenceField = matchedFields.find(key => key !== "aliases") ?? matchedFields[0];
    const source = evidenceField ? fields[evidenceField] : "";
    const at = Math.max(0, terms.length ? normalize(source).indexOf(terms[0]) : 0);
    return { item, score, matchedFields, snippet: source.slice(Math.max(0, at - 60), at + 180).trim() };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.item.ref.sourceKey.localeCompare(b.item.ref.sourceKey));
  const hits = candidates.slice(0, Math.min(Math.max(options.limit ?? 8, 1), 25)).map((candidate, index) => ({ ref: candidate.item.ref, title: candidate.item.title, evidenceSnippet: candidate.snippet, matchedFields: candidate.matchedFields, score: candidate.score, rank: index + 1 }));
  return { schemaVersion: 1, query, corpusDigest: await knowledgeCorpusDigest(corpus), retrievalStrategy: "deterministic-lexical-v1", status: hits.length ? "matched" : "no-match", hits };
}

export function resolveConfirmedKnowledgeRef(result: KnowledgeSearchResult, sourceKey: string) {
  const hit = result.hits.find(item => item.ref.sourceKey === sourceKey);
  if (!hit) throw new Error("KNOWLEDGE_REFERENCE_NOT_CONFIRMED");
  return hit.ref;
}
