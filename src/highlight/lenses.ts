export const HIGHLIGHT_VIEWS = [
  ["all", "None"],
  ["platform", "Platform engineering"],
  ["architecture", "Enterprise architecture"],
  ["ai", "AI strategy"],
  ["startup", "Startup advisory"],
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
};

export function matchesHighlightView(
  view: HighlightView,
  content: Array<string | undefined>,
) {
  if (view === "all") return true;
  const haystack = content.filter(Boolean).join(" ").toLowerCase();
  return keywords[view].some((keyword) => haystack.includes(keyword));
}
