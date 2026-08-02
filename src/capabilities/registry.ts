import { articles, experience, projects, skills } from "@/data/content";
import type { CapabilityContext, CapabilityDefinition, CapabilityManifestEntry, CapabilityParameter } from "./types";
import { CapabilityError } from "./types";
import { auditCapabilities, generateCapabilityManifest, getCapabilityDelta } from "./governance";
import baselineManifest from "../../capabilities/baseline-manifest.json";

type Handler = (params: Record<string, unknown>, context: CapabilityContext) => Promise<unknown>;
const text = (name: string, description: string): CapabilityParameter => ({ name, description, type: "string", required: true });
const findProject = (slug: unknown) => { const item = projects.find(project => project.slug === String(slug)); if (!item) throw new CapabilityError("PROJECT_NOT_FOUND", `No project exists with the slug "${slug}".`, slug, "Run project.list to see available project slugs."); return item; };
const findArticle = (slug: unknown) => { const item = articles.find(article => article.slug === String(slug)); if (!item) throw new CapabilityError("ARTICLE_NOT_FOUND", `No article exists with the slug "${slug}".`, slug, "Run article.list to see available article slugs."); return item; };
const contains = (values: string[], query: unknown) => values.some(value => value.toLowerCase().includes(String(query).toLowerCase()));
const openExternal = (url: string) => { window.open(url, "_blank", "noopener,noreferrer"); return { url }; };

const handlers: Record<string, Handler> = {
  "system.openCommandSurface": async (_, c) => { c.surface.open("terminal"); return { open: true, tab: "terminal" }; },
  "system.closeCommandSurface": async (_, c) => { c.surface.close(); return { open: false }; },
  "system.minimiseCommandSurface": async (_, c) => { c.surface.minimise(); return { minimised: true }; },
  "system.restoreCommandSurface": async (_, c) => { c.surface.restore(); return { minimised: false }; },
  "system.toggleCommandSurface": async (_, c) => { c.surface.toggle(); return { toggled: true }; },
  "system.openTerminal": async (_, c) => { c.surface.open("terminal"); return { open: true, tab: "terminal" }; },
  "system.openAiConsole": async (_, c) => { c.surface.open("agent"); return { open: true, tab: "agent" }; },
  "system.openInspector": async (_, c) => { c.surface.open("inspector"); return { open: true, tab: "inspector" }; },
  "system.getApplicationInfo": async () => ({ runtime: "browser", architecture: "capability-first", persistence: "SQLite WASM + OPFS", backend: false, version: "2.0.0" }),
  "system.auditCapabilities": async () => auditCapabilities(capabilities),
  "system.getCapabilityDelta": async () => getCapabilityDelta(generateCapabilityManifest(capabilities), baselineManifest as unknown as CapabilityManifestEntry[]),
  "system.reportCapabilityIssue": async (p, c) => {
    const report = { id: `report_${crypto.randomUUID()}`, capability_id: p.capabilityId ? String(p.capabilityId) : null, report_type: String(p.reportType), severity: String(p.severity), details: String(p.details), caller: c.caller, route: p.route ? String(p.route) : null, created_at: new Date().toISOString() };
    await c.database.exec("INSERT INTO capability_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?)", Object.values(report));
    return { report };
  },
  "system.exportCapabilityReports": async (_, c) => {
    const reports = await c.database.query<Record<string, unknown>>("SELECT * FROM capability_reports ORDER BY created_at DESC");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), reports }, null, 2)], { type: "application/json" }));
    link.download = "michaelos-capability-reports.json"; link.click(); URL.revokeObjectURL(link.href);
    return { reports, count: reports.length };
  },
  "navigation.goHome": async (_, c) => { c.navigate("/"); return { path: "/" }; },
  "navigation.goProjects": async (_, c) => { c.navigate("/projects"); return { path: "/projects" }; },
  "navigation.goExperience": async (_, c) => { c.navigate("/experience"); return { path: "/experience" }; },
  "navigation.goBlog": async (_, c) => { c.navigate("/blog"); return { path: "/blog" }; },
  "navigation.goCv": async (_, c) => { c.navigate("/cv"); return { path: "/cv" }; },
  "navigation.goCapabilities": async (_, c) => { c.navigate("/capabilities"); return { path: "/capabilities" }; },
  "navigation.goBack": async (_, c) => { c.back(); return { back: true }; },
  "project.list": async p => { const rows = p.featured ? projects.filter(x => x.featured) : projects; return { projects: rows, count: rows.length }; },
  "project.search": async p => { const rows = projects.filter(x => contains([x.name, x.summary, x.description, x.technologies.join(" ")], p.query)); return { projects: rows, count: rows.length, query: p.query }; },
  "project.view": async (p, c) => { const project = findProject(p.slug); const path = `/projects?project=${project.slug}`; c.navigate(path); return { project, path, message: `Opened ${project.name}` }; },
  "project.filter": async p => ({ projects: projects.filter(x => contains([x.status, ...x.technologies], p.value)), filter: p.value }),
  "project.openExternal": async p => { const project = findProject(p.slug); const url = project.url ?? project.repositoryUrl; if (!url) throw new CapabilityError("PROJECT_URL_NOT_FOUND", `No external URL is available for "${project.slug}".`, project.slug); return openExternal(url); },
  "experience.list": async () => ({ experience }),
  "experience.view": async p => { const item = experience.find(x => x.id === p.id); if (!item) throw new CapabilityError("EXPERIENCE_NOT_FOUND", `No experience exists with ID "${p.id}".`, p.id); return { experience: item }; },
  "experience.filter": async p => ({ experience: experience.filter(x => contains([x.organisation, x.title, x.summary], p.query)), query: p.query }),
  "article.list": async () => ({ articles: articles.filter(x => x.status === "published") }),
  "article.search": async p => ({ articles: articles.filter(x => contains([x.title, x.summary, x.tags.join(" ")], p.query)), query: p.query }),
  "article.view": async (p, c) => { const article = findArticle(p.slug); const path = `/blog?article=${article.slug}`; c.navigate(path); return { article, path, message: `Opened ${article.title}` }; },
  "article.filterByTag": async p => ({ articles: articles.filter(x => x.tags.some(tag => tag.toLowerCase() === String(p.tag).toLowerCase())), tag: p.tag }),
  "article.openExternal": async p => { const article = findArticle(p.slug) as typeof articles[number] & { externalUrl?: string }; if (!article.externalUrl) throw new CapabilityError("ARTICLE_URL_NOT_FOUND", `No external URL is available for "${article.slug}".`, article.slug); return openExternal(article.externalUrl); },
  "skill.list": async () => ({ skills }),
  "skill.search": async p => ({ skills: skills.filter(x => contains([x.name, x.category, x.description], p.query)), query: p.query }),
  "skill.filterByCategory": async p => ({ skills: skills.filter(x => x.category.toLowerCase() === String(p.category).toLowerCase()), category: p.category }),
  "cv.view": async (_, c) => { c.navigate("/cv"); return { path: "/cv" }; },
  "cv.navigateSection": async (p, c) => { const path = `/cv#${p.section}`; c.navigate(path); return { path, section: p.section }; },
  "cv.exportJson": async () => { const data = { profile: { name: "Mike Ajijola", role: "Platform engineer & systems thinker" }, experience, projects, skills }; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); link.download = "mike-ajijola-cv.json"; link.click(); URL.revokeObjectURL(link.href); return data; },
  "cv.print": async () => { window.print(); return { opened: true }; },
  "inspector.getLastExecution": async (_, c) => ({ execution: c.getHistory()[0] ?? null }),
  "inspector.listHistory": async (_, c) => ({ history: c.getHistory() }),
  "inspector.filterHistory": async (p, c) => ({ history: c.getHistory().filter(x => contains([x.capabilityId, x.caller, x.status], p.query)) }),
  "accessibility.describeElement": async (_, c) => ({ element: c.getSelectedControl() }),
  "accessibility.listPageActions": async () => ({ actions: Array.from(document.querySelectorAll<HTMLElement>("[data-capability-id]")).map(node => ({ capabilityId: node.dataset.capabilityId, name: node.getAttribute("aria-label") ?? node.innerText })) }),
  "accessibility.moveFocus": async p => { const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-capability-id]")); if (!nodes.length) return { focused: null }; const current = nodes.indexOf(document.activeElement as HTMLElement); const offset = p.direction === "previous" ? -1 : 1; const target = nodes[(current + offset + nodes.length) % nodes.length]; target.focus(); return { focused: target.dataset.capabilityId }; },
  "accessibility.activateFocused": async () => { const node = document.activeElement as HTMLElement | null; if (!node?.dataset.capabilityId) throw new CapabilityError("NO_CAPABILITY_FOCUSED", "The focused element is not capability-backed.", node?.tagName, "Move focus to a registered page action first."); const params = JSON.parse(node.dataset.capabilityParams ?? "{}"); window.dispatchEvent(new CustomEvent("capability-accessibility-activate", { detail: { id: node.dataset.capabilityId, params } })); return { activated: node.dataset.capabilityId }; },
};

type Spec = Omit<CapabilityDefinition, "execute" | "examples"> & { example?: Record<string, unknown> };
const define = (spec: Spec): CapabilityDefinition => ({ ...spec, examples: [{ description: `Example for ${spec.title.toLowerCase()}.`, params: spec.example ?? {} }], execute: handlers[spec.id] });
const base = (id: string, title: string, description: string, cli: string, keyboard: readonly string[], accessibility: string, params: CapabilityParameter[] = [], example: Record<string, unknown> = {}): Spec => ({ id, schemaVersion: 1, title, description, cli: { enabled: true, command: cli }, keyboard: { template: keyboard }, actionKeys: { enabled: true, sequence: keyboard }, navigator: { enabled: false }, accessibility: { label: accessibility }, risk: "read", params, example });
const simple = (id: string, title: string, description: string, tokens: readonly string[], accessibility: string) => define(base(id, title, description, `run ${id}`, [...tokens, "ENTER"], accessibility));

export const capabilities: CapabilityDefinition[] = [
  simple("system.openCommandSurface", "Open command surface", "Open the floating agent capability console.", ["SYSTEM", "OPEN", "CONSOLE"], "Open agent capability console"),
  simple("system.closeCommandSurface", "Close command surface", "Close the floating agent capability console.", ["SYSTEM", "CLOSE", "CONSOLE"], "Close agent capability console"),
  simple("system.minimiseCommandSurface", "Minimise command surface", "Minimise the floating capability console.", ["SYSTEM", "MINIMISE", "CONSOLE"], "Minimise agent capability console"),
  simple("system.restoreCommandSurface", "Restore command surface", "Restore the floating capability console.", ["SYSTEM", "RESTORE", "CONSOLE"], "Restore agent capability console"),
  simple("system.toggleCommandSurface", "Toggle command surface", "Toggle the floating capability console.", ["SYSTEM", "TOGGLE", "CONSOLE"], "Toggle agent capability console"),
  simple("system.openTerminal", "Open Agent CLI", "Open the console on the Agent CLI tab.", ["SYSTEM", "OPEN", "TERMINAL"], "Open Agent CLI"),
  simple("system.openAiConsole", "Open deterministic search", "Open the console on the experimental deterministic natural-language search tab.", ["SYSTEM", "OPEN", "AI"], "Open deterministic capability search"),
  simple("system.openInspector", "Open capability inspector", "Open the console on the Inspector tab.", ["SYSTEM", "OPEN", "INSPECTOR"], "Open capability inspector"),
  simple("system.getApplicationInfo", "Get application info", "Describe the browser runtime and architecture.", ["SYSTEM", "INFO"], "Get application information"),
  simple("system.auditCapabilities", "Audit capabilities", "Validate registered capability definitions and invocation mappings.", ["SYSTEM", "AUDIT", "CAPABILITIES"], "Audit registered capabilities"),
  simple("system.getCapabilityDelta", "Get capability delta", "Compare the current generated manifest with the accepted baseline.", ["SYSTEM", "CAPABILITY", "DELTA"], "Compare capabilities with the accepted baseline"),
  define({ ...base("system.reportCapabilityIssue", "Report capability issue", "Store a capability issue locally in browser SQLite.", "run system.reportCapabilityIssue --reportType <reportType> --severity <severity> --details <details>", ["SYSTEM", "REPORT", "<reportType>", "<severity>", "<details>", "ENTER"], "Report a local capability issue", [
    { name: "capabilityId", description: "Related capability ID, when known.", type: "string", required: false },
    { name: "reportType", description: "Type of capability or QA issue.", type: "string", required: true },
    { name: "severity", description: "Issue severity.", type: "enum", required: true, values: ["info", "warning", "error"] },
    { name: "details", description: "Human-readable issue details.", type: "string", required: true },
    { name: "route", description: "Route where the issue occurred.", type: "string", required: false },
  ], { reportType: "qa", severity: "warning", details: "Describe the issue." }), risk: "write" }),
  simple("system.exportCapabilityReports", "Export capability reports", "Download locally stored capability reports as JSON.", ["SYSTEM", "EXPORT", "CAPABILITY", "REPORTS"], "Export local capability reports"),
  ...[["Home","/","HOME"],["Projects","/projects","PROJECTS"],["Experience","/experience","EXPERIENCE"],["Blog","/blog","BLOG"],["Cv","/cv","CV"],["Capabilities","/capabilities","CAPABILITIES"]].map(([name,,token]) => simple(`navigation.go${name}`, `Go to ${name}`, `Navigate to the ${name.toLowerCase()} page.`, ["NAVIGATION", token], `Open ${name}`)),
  simple("navigation.goBack", "Go back", "Return to the previous browser history entry.", ["NAVIGATION", "BACK"], "Go back"),
  define(base("project.list", "List projects", "Return all portfolio projects.", "run project.list", ["PROJECT", "LIST", "ENTER"], "List portfolio projects", [{ name: "featured", description: "Only featured projects.", type: "boolean", required: false }])),
  define(base("project.search", "Search projects", "Search project names, summaries, and technologies.", "run project.search --query <query>", ["PROJECT", "SEARCH", "<query>", "ENTER"], "Search portfolio projects", [text("query", "Words to search for.")], { query: "platform" })),
  define(base("project.view", "View project", "Open project details using a unique slug.", "run project.view --slug <slug>", ["PROJECT", "VIEW", "<slug>", "ENTER"], "Open project details", [text("slug", "The unique project slug.")], { slug: "atlas-platform" })),
  define(base("project.filter", "Filter projects", "Filter projects by technology or status.", "run project.filter --value <value>", ["PROJECT", "FILTER", "<value>", "ENTER"], "Filter portfolio projects", [text("value", "Technology or status.")], { value: "TypeScript" })),
  define(base("project.openExternal", "Open project website", "Open a project website or repository.", "run project.openExternal --slug <slug>", ["PROJECT", "OPEN", "EXTERNAL", "<slug>", "ENTER"], "Open project external link", [text("slug", "The project slug.")], { slug: "signal-room" })),
  simple("experience.list", "List experience", "Return professional roles.", ["EXPERIENCE", "LIST"], "List professional experience"),
  define(base("experience.view", "View experience", "Return an experience record by ID.", "run experience.view --id <id>", ["EXPERIENCE", "VIEW", "<id>", "ENTER"], "View experience details", [text("id", "Experience record ID.")], { id: "e1" })),
  define(base("experience.filter", "Filter experience", "Filter experience by role or organisation.", "run experience.filter --query <query>", ["EXPERIENCE", "FILTER", "<query>", "ENTER"], "Filter professional experience", [text("query", "Filter text.")], { query: "platform" })),
  simple("article.list", "List articles", "Return published writing.", ["ARTICLE", "LIST"], "List published articles"),
  define(base("article.search", "Search articles", "Search article titles, summaries, and tags.", "run article.search --query <query>", ["ARTICLE", "SEARCH", "<query>", "ENTER"], "Search published articles", [text("query", "Words to search for.")], { query: "local-first" })),
  define(base("article.view", "View article", "Open an article using its slug.", "run article.view --slug <slug>", ["ARTICLE", "VIEW", "<slug>", "ENTER"], "Open article", [text("slug", "The article slug.")], { slug: "capabilities-not-interfaces" })),
  define(base("article.filterByTag", "Filter articles by tag", "Return articles with a given tag.", "run article.filterByTag --tag <tag>", ["ARTICLE", "FILTER", "TAG", "<tag>", "ENTER"], "Filter articles by tag", [text("tag", "Article tag.")], { tag: "Architecture" })),
  define(base("article.openExternal", "Open external article", "Open an article external URL.", "run article.openExternal --slug <slug>", ["ARTICLE", "OPEN", "EXTERNAL", "<slug>", "ENTER"], "Open external article", [text("slug", "Article slug.")], { slug: "capabilities-not-interfaces" })),
  simple("skill.list", "List skills", "Return skills and categories.", ["SKILL", "LIST"], "List skills"),
  define(base("skill.search", "Search skills", "Search skill names and descriptions.", "run skill.search --query <query>", ["SKILL", "SEARCH", "<query>", "ENTER"], "Search skills", [text("query", "Words to search for.")], { query: "platform" })),
  define(base("skill.filterByCategory", "Filter skills by category", "Return skills in a category.", "run skill.filterByCategory --category <category>", ["SKILL", "FILTER", "CATEGORY", "<category>", "ENTER"], "Filter skills by category", [text("category", "Skill category.")], { category: "Systems" })),
  simple("cv.view", "View CV", "Open the curriculum vitae.", ["CV", "VIEW"], "View curriculum vitae"),
  define(base("cv.navigateSection", "Navigate CV section", "Open a named CV section.", "run cv.navigateSection --section <section>", ["CV", "SECTION", "<section>", "ENTER"], "Navigate CV section", [text("section", "CV section ID.")], { section: "experience" })),
  simple("cv.exportJson", "Export CV as JSON", "Download the CV as structured JSON.", ["CV", "EXPORT", "JSON"], "Export CV as JSON"),
  simple("cv.print", "Print CV", "Open the browser print dialog.", ["CV", "PRINT"], "Print curriculum vitae"),
  simple("inspector.getLastExecution", "Get latest execution", "Return the latest capability execution.", ["INSPECTOR", "LATEST"], "Get latest capability execution"),
  simple("inspector.listHistory", "List execution history", "Return local execution history.", ["INSPECTOR", "HISTORY"], "List capability history"),
  define(base("inspector.filterHistory", "Filter execution history", "Filter history by capability, caller, or status.", "run inspector.filterHistory --query <query>", ["INSPECTOR", "FILTER", "<query>", "ENTER"], "Filter capability history", [text("query", "Filter text.")], { query: "project" })),
  simple("accessibility.describeElement", "Describe selected element", "Return semantic metadata for the selected control.", ["ACCESSIBILITY", "DESCRIBE"], "Describe selected interface element"),
  simple("accessibility.listPageActions", "List page actions", "List visible capability-backed controls.", ["ACCESSIBILITY", "LIST", "ACTIONS"], "List accessible page actions"),
  define(base("accessibility.moveFocus", "Move capability focus", "Move focus between capability-backed controls.", "run accessibility.moveFocus --direction <direction>", ["ACCESSIBILITY", "FOCUS", "<direction>", "ENTER"], "Move focus between page actions", [{ name: "direction", description: "Focus direction.", type: "enum", required: true, values: ["next", "previous"] }], { direction: "next" })),
  simple("accessibility.activateFocused", "Activate focused capability", "Activate the focused capability-backed control.", ["ACCESSIBILITY", "ACTIVATE"], "Activate focused page action"),
];

if (capabilities.some(item => !handlers[item.id])) throw new Error("A capability is missing its executor.");
export const registry = new Map(capabilities.map(item => [item.id, item]));
