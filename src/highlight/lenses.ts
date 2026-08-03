export const HIGHLIGHT_VIEWS = [
  ["all", "All content"],
  ["platform", "Platform engineering"],
  ["architecture", "Enterprise architecture"],
  ["ai", "Agentic AI"],
  ["startup", "Startup advisory"],
  ["ma", "M&A integration"],
  ["procurement", "Procurement and renewals"],
  ["customer", "Customer ownership"],
] as const;

export type HighlightView = (typeof HIGHLIGHT_VIEWS)[number][0];
const keywords: Record<Exclude<HighlightView, "all">, string[]> = {
  platform: [
    "platform",
    "kubernetes",
    "backstage",
    "cloud",
    "developer experience",
    "golden path",
    "infrastructure",
  ],
  architecture: [
    "architecture",
    "distributed",
    "modernisation",
    "strategy",
    "event",
    "system",
    "technical direction",
  ],
  ai: ["agent", "ai", "automation", "capability", "gemini"],
  startup: ["startup", "seed", "independent", "advisor", "product"],
  ma: [
    "m&a",
    "merger",
    "acquisition",
    "integration",
    "modernisation",
    "migration",
  ],
  procurement: ["procurement", "renewal", "vendor", "commercial", "contract"],
  customer: [
    "customer",
    "ownership",
    "service ownership",
    "product",
    "adoption",
  ],
};

export function matchesHighlightView(
  view: HighlightView,
  content: Array<string | undefined>,
) {
  if (view === "all") return true;
  const haystack = content.filter(Boolean).join(" ").toLowerCase();
  return keywords[view].some((keyword) => haystack.includes(keyword));
}
