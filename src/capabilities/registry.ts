import {
  aliases,
  articles,
  education,
  experience,
  profile,
  projects,
  recognition,
  skills,
} from "@/data/content";
import type {
  CapabilityContext,
  CapabilityDefinition,
  CapabilityManifestEntry,
  CapabilityParameter,
} from "./types";
import { CapabilityError } from "./types";
import {
  auditCapabilities,
  generateCapabilityManifest,
  getCapabilityDelta,
} from "./governance";
import baselineManifest from "../../capabilities/baseline-manifest.json";

type Handler = (
  params: Record<string, unknown>,
  context: CapabilityContext,
) => Promise<unknown>;
const text = (name: string, description: string): CapabilityParameter => ({
  name,
  description,
  type: "string",
  required: true,
});
const findProject = (slug: unknown) => {
  const item = projects.find((project) => project.slug === String(slug));
  if (!item)
    throw new CapabilityError(
      "PROJECT_NOT_FOUND",
      `No project exists with the slug "${slug}".`,
      slug,
      "Run project.list to see available project slugs.",
    );
  return item;
};
const findArticle = (slug: unknown) => {
  const item = articles.find((article) => article.slug === String(slug));
  if (!item)
    throw new CapabilityError(
      "ARTICLE_NOT_FOUND",
      `No article exists with the slug "${slug}".`,
      slug,
      "Run article.list to see available article slugs.",
    );
  return item;
};
const searchStopWords = new Set([
  "about",
  "anything",
  "did",
  "does",
  "explain",
  "find",
  "his",
  "michael",
  "mike",
  "open",
  "project",
  "projects",
  "show",
  "take",
  "the",
  "what",
  "with",
  "work",
]);
const normaliseSearch = (value: unknown) =>
  String(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const contains = (values: string[], query: unknown) => {
  const haystack = normaliseSearch(values.join(" "));
  const phrase = normaliseSearch(query);
  if (!phrase) return true;
  if (haystack.includes(phrase)) return true;
  const terms = phrase
    .split(" ")
    .filter((term) => term.length > 2 && !searchStopWords.has(term));
  return terms.length > 0 && terms.some((term) => haystack.includes(term));
};
const entityAliases = (id: string) => aliases[id] ?? [];
const openExternal = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
  return { url };
};

const handlers: Record<string, Handler> = {
  "system.openCommandSurface": async (_, c) => {
    c.surface.open("terminal");
    return { open: true, tab: "terminal" };
  },
  "system.closeCommandSurface": async (_, c) => {
    c.surface.close();
    return { open: false };
  },
  "system.minimiseCommandSurface": async (_, c) => {
    c.surface.minimise();
    return { minimised: true };
  },
  "system.restoreCommandSurface": async (_, c) => {
    c.surface.restore();
    return { minimised: false };
  },
  "system.toggleCommandSurface": async (_, c) => {
    c.surface.toggle();
    return { toggled: true };
  },
  "system.openTerminal": async (_, c) => {
    c.surface.open("terminal");
    return { open: true, tab: "terminal" };
  },
  "system.openAiConsole": async (_, c) => {
    c.surface.open("lily");
    return { open: true, tab: "lily" };
  },
  "system.openInspector": async (_, c) => {
    c.surface.open("inspector");
    return { open: true, tab: "inspector" };
  },
  "system.openHistory": async (_, c) => {
    c.surface.open("history");
    return { open: true, tab: "history" };
  },
  "system.openActionKeyMode": async () => {
    window.dispatchEvent(new CustomEvent("action-key-mode-open"));
    return { open: true, mode: "action-keys" };
  },
  "system.closeActionKeyMode": async () => {
    window.dispatchEvent(new CustomEvent("action-key-mode-close"));
    return { open: false, mode: "action-keys" };
  },
  "navi.open": async () => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "open" } }),
    );
    return { open: true };
  },
  "navi.close": async () => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "close" } }),
    );
    return { open: false };
  },
  "navi.clearConversation": async () => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "clear" } }),
    );
    return { cleared: true };
  },
  "navi.resetPosition": async () => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "reset-position" } }),
    );
    return { reset: true };
  },
  "navi.openConsole": async (_, c) => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "close" } }),
    );
    c.surface.open("lily");
    return { open: true, tab: "lily" };
  },
  "navi.startVoice": async () => {
    window.dispatchEvent(
      new CustomEvent("lily-control", { detail: { action: "open" } }),
    );
    window.dispatchEvent(
      new CustomEvent("navi-voice-control", { detail: { action: "start" } }),
    );
    return { requested: true, message: "Navi Voice Mode requested." };
  },
  "navi.endVoice": async () => {
    window.dispatchEvent(
      new CustomEvent("navi-voice-control", { detail: { action: "stop" } }),
    );
    return { ended: true, message: "Navi Voice Mode ended." };
  },
  "system.getApplicationInfo": async () => ({
    runtime: "browser",
    architecture: "capability-first",
    persistence: "SQLite WASM + OPFS",
    backend: false,
    version: "2.0.0",
  }),
  "system.auditCapabilities": async () => auditCapabilities(capabilities),
  "system.getCapabilityDelta": async () =>
    getCapabilityDelta(
      generateCapabilityManifest(capabilities),
      baselineManifest as unknown as CapabilityManifestEntry[],
    ),
  "system.reportCapabilityIssue": async (p, c) => {
    const report = {
      id: `report_${crypto.randomUUID()}`,
      capability_id: p.capabilityId ? String(p.capabilityId) : null,
      report_type: String(p.reportType),
      severity: String(p.severity),
      details: String(p.details),
      caller: c.caller,
      route: p.route ? String(p.route) : null,
      created_at: new Date().toISOString(),
    };
    await c.database.exec(
      "INSERT INTO capability_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      Object.values(report),
    );
    return { report };
  },
  "system.exportCapabilityReports": async (_, c) => {
    const reports = await c.database.query<Record<string, unknown>>(
      "SELECT * FROM capability_reports ORDER BY created_at DESC",
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { exportedAt: new Date().toISOString(), reports },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    link.download = "michaelos-capability-reports.json";
    link.click();
    URL.revokeObjectURL(link.href);
    return { reports, count: reports.length };
  },
  "navigation.goHome": async (_, c) => {
    c.navigate("/");
    return { path: "/" };
  },
  "navigation.goProjects": async (_, c) => {
    c.navigate("/projects");
    return { path: "/projects" };
  },
  "navigation.goExperience": async (_, c) => {
    c.navigate("/experience");
    return { path: "/experience" };
  },
  "navigation.goBlog": async (_, c) => {
    c.navigate("/blog");
    return { path: "/blog" };
  },
  "navigation.goCv": async (_, c) => {
    c.navigate("/cv");
    return { path: "/cv" };
  },
  "navigation.goCapabilities": async (_, c) => {
    c.navigate("/capabilities");
    return { path: "/capabilities" };
  },
  "navigation.goBack": async (_, c) => {
    c.back();
    return { back: true };
  },
  "project.list": async (p) => {
    const rows = p.featured ? projects.filter((x) => x.featured) : projects;
    return { projects: rows, count: rows.length };
  },
  "project.search": async (p) => {
    const rows = projects.filter((x) =>
      contains(
        [
          x.name,
          x.subtitle ?? "",
          x.summary,
          x.description,
          x.role,
          x.technologies.join(" "),
          x.themes.join(" "),
          entityAliases(x.slug).join(" "),
        ],
        p.query,
      ),
    );
    return { projects: rows, count: rows.length, query: p.query };
  },
  "project.view": async (p, c) => {
    const project = findProject(p.slug);
    const path = `/projects?project=${project.slug}`;
    c.navigate(path);
    return { project, path, message: `Opened ${project.name}` };
  },
  "project.filter": async (p) => ({
    projects: projects.filter((x) =>
      contains([x.status, ...x.technologies], p.value),
    ),
    filter: p.value,
  }),
  "project.openExternal": async (p) => {
    const project = findProject(p.slug);
    const url =
      project.url ?? project.repositoryUrl ?? project.externalSources?.[0]?.url;
    if (!url)
      throw new CapabilityError(
        "PROJECT_URL_NOT_FOUND",
        `No external URL is available for "${project.slug}".`,
        project.slug,
      );
    return openExternal(url);
  },
  "experience.list": async () => ({ experience }),
  "experience.view": async (p, c) => {
    const item = experience.find((x) => x.id === p.id);
    if (!item)
      throw new CapabilityError(
        "EXPERIENCE_NOT_FOUND",
        `No experience exists with ID "${p.id}".`,
        p.id,
      );
    const path = `/experience?experience=${item.id}`;
    c.navigate(path);
    return { experience: item, path, message: `Opened ${item.title}` };
  },
  "experience.filter": async (p) => ({
    experience: experience.filter((x) =>
      contains(
        [x.organisation, x.title, x.summary, x.achievements.join(" ")],
        p.query,
      ),
    ),
    query: p.query,
  }),
  "article.list": async () => ({ articles }),
  "article.search": async (p) => ({
    articles: articles.filter((x) =>
      contains(
        [
          x.title,
          x.alternativeTitle ?? "",
          x.summary,
          x.excerpt,
          x.tags.join(" "),
          x.sections.map((section) => section.heading).join(" "),
          entityAliases(x.slug).join(" "),
          x.slug.includes("ceoclaw") ? entityAliases("ceoclaw").join(" ") : "",
        ],
        p.query,
      ),
    ),
    query: p.query,
  }),
  "article.view": async (p, c) => {
    const article = findArticle(p.slug);
    const path = `/blog?article=${article.slug}`;
    c.navigate(path);
    return { article, path, message: `Opened ${article.title}` };
  },
  "article.filterByTag": async (p) => ({
    articles: articles.filter((x) =>
      x.tags.some((tag) => tag.toLowerCase() === String(p.tag).toLowerCase()),
    ),
    tag: p.tag,
  }),
  "article.openExternal": async (p) => {
    const article = findArticle(p.slug);
    const url = article.externalSources?.[0]?.url;
    if (!url)
      throw new CapabilityError(
        "ARTICLE_URL_NOT_FOUND",
        `No external URL is available for "${article.slug}".`,
        article.slug,
      );
    return openExternal(url);
  },
  "skill.list": async () => ({ skills }),
  "skill.search": async (p) => ({
    skills: skills.filter((x) =>
      contains([x.name, x.category, x.description], p.query),
    ),
    query: p.query,
  }),
  "skill.filterByCategory": async (p) => ({
    skills: skills.filter(
      (x) => x.category.toLowerCase() === String(p.category).toLowerCase(),
    ),
    category: p.category,
  }),
  "cv.view": async (_, c) => {
    c.navigate("/cv");
    return { path: "/cv" };
  },
  "cv.navigateSection": async (p, c) => {
    const path = `/cv#${p.section}`;
    c.navigate(path);
    return { path, section: p.section };
  },
  "cv.exportJson": async () => {
    const data = {
      profile: {
        ...profile,
      },
      experience,
      projects,
      skills,
      recognition,
      education,
    };
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    link.download = "mike-ajijola-cv.json";
    link.click();
    URL.revokeObjectURL(link.href);
    return data;
  },
  "cv.print": async () => {
    window.print();
    return {
      opened: true,
      message: "Print dialog opened — choose Save as PDF to export the CV.",
    };
  },
  "theme.setMode": async (p) => {
    const mode = String(p.mode);
    window.dispatchEvent(
      new CustomEvent("theme-control", { detail: { mode } }),
    );
    return {
      mode,
      message: mode === "dark" ? "Dark mode enabled." : "Light mode enabled.",
    };
  },
  "inspector.getLastExecution": async (_, c) => ({
    execution: c.getHistory()[0] ?? null,
  }),
  "inspector.listHistory": async (_, c) => ({ history: c.getHistory() }),
  "inspector.filterHistory": async (p, c) => ({
    history: c
      .getHistory()
      .filter((x) => contains([x.capabilityId, x.caller, x.status], p.query)),
  }),
  "accessibility.describeElement": async (_, c) => ({
    element: c.getSelectedControl(),
  }),
  "accessibility.listPageActions": async () => ({
    actions: Array.from(
      document.querySelectorAll<HTMLElement>("[data-capability-id]"),
    ).map((node) => ({
      capabilityId: node.dataset.capabilityId,
      name: node.getAttribute("aria-label") ?? node.innerText,
    })),
  }),
  "accessibility.moveFocus": async (p) => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-capability-id]"),
    );
    if (!nodes.length) return { focused: null };
    const current = nodes.indexOf(document.activeElement as HTMLElement);
    const offset = p.direction === "previous" ? -1 : 1;
    const target = nodes[(current + offset + nodes.length) % nodes.length];
    target.focus();
    return { focused: target.dataset.capabilityId };
  },
  "accessibility.activateFocused": async () => {
    const node = document.activeElement as HTMLElement | null;
    if (!node?.dataset.capabilityId)
      throw new CapabilityError(
        "NO_CAPABILITY_FOCUSED",
        "The focused element is not capability-backed.",
        node?.tagName,
        "Move focus to a registered page action first.",
      );
    const params = JSON.parse(node.dataset.capabilityParams ?? "{}");
    window.dispatchEvent(
      new CustomEvent("capability-accessibility-activate", {
        detail: { id: node.dataset.capabilityId, params },
      }),
    );
    return { activated: node.dataset.capabilityId };
  },
};

type Spec = Omit<CapabilityDefinition, "execute" | "examples"> & {
  example?: Record<string, unknown>;
};
const navigatorIds = new Set([
  "theme.setMode",
  "navigation.goHome",
  "navigation.goProjects",
  "navigation.goExperience",
  "navigation.goBlog",
  "navigation.goCv",
  "navigation.goCapabilities",
  "project.list",
  "project.search",
  "project.view",
  "experience.list",
  "experience.filter",
  "experience.view",
  "article.list",
  "article.search",
  "article.view",
  "skill.list",
  "skill.search",
  "cv.view",
  "cv.navigateSection",
  "cv.exportJson",
  "inspector.getLastExecution",
  "inspector.listHistory",
]);
const define = (spec: Spec): CapabilityDefinition => ({
  ...spec,
  examples: [
    {
      description: `Example for ${spec.title.toLowerCase()}.`,
      params: spec.example ?? {},
    },
  ],
  execute: handlers[spec.id],
});
const base = (
  id: string,
  title: string,
  description: string,
  cli: string,
  keyboard: readonly string[],
  accessibility: string,
  params: CapabilityParameter[] = [],
  example: Record<string, unknown> = {},
): Spec => ({
  id,
  schemaVersion: 1,
  title,
  description,
  cli: { enabled: true, command: cli },
  keyboard: { template: keyboard },
  actionKeys: { enabled: true, sequence: keyboard },
  navigator: { enabled: navigatorIds.has(id) },
  accessibility: { label: accessibility },
  risk: "read",
  params,
  example,
});
const simple = (
  id: string,
  title: string,
  description: string,
  tokens: readonly string[],
  accessibility: string,
) =>
  define(
    base(
      id,
      title,
      description,
      `run ${id}`,
      [...tokens, "ENTER"],
      accessibility,
    ),
  );

export const capabilities: CapabilityDefinition[] = [
  define(
    base(
      "theme.setMode",
      "Set colour mode",
      "Switch MichaelOS between its light and dark colour modes.",
      "run theme.setMode --mode <mode>",
      ["THEME", "SET", "<mode>", "ENTER"],
      "Set MichaelOS colour mode",
      [
        {
          name: "mode",
          description: "Colour mode to apply.",
          type: "enum",
          required: true,
          values: ["light", "dark"],
        },
      ],
      { mode: "dark" },
    ),
  ),
  simple(
    "navi.open",
    "Open Navi",
    "Open the compact Navi Panel.",
    ["NAVI", "OPEN"],
    "Open Navi",
  ),
  simple(
    "navi.close",
    "Close Navi",
    "Close the compact Navi Panel.",
    ["NAVI", "CLOSE"],
    "Close Navi",
  ),
  simple(
    "navi.clearConversation",
    "Clear Navi conversation",
    "Clear the locally stored Navi conversation.",
    ["NAVI", "CLEAR"],
    "Clear Navi conversation",
  ),
  simple(
    "navi.resetPosition",
    "Reset Navi position",
    "Reset the Navi Bubble to its default safe position.",
    ["NAVI", "RESET", "POSITION"],
    "Reset Navi position",
  ),
  simple(
    "navi.openConsole",
    "Open full Agent Console",
    "Open the Agent Console with the shared Navi conversation.",
    ["NAVI", "OPEN", "CONSOLE"],
    "Open full Agent Console",
  ),
  simple(
    "navi.startVoice",
    "Start Navi Voice Mode",
    "Request microphone permission and start a bounded Navi voice session.",
    ["NAVI", "VOICE", "START"],
    "Start Navi Voice Mode",
  ),
  simple(
    "navi.endVoice",
    "End Navi Voice Mode",
    "Stop microphone capture, playback and the active Navi voice connection.",
    ["NAVI", "VOICE", "END"],
    "End Navi Voice Mode",
  ),
  simple(
    "system.openCommandSurface",
    "Open command surface",
    "Open the floating agent capability console.",
    ["SYSTEM", "OPEN", "CONSOLE"],
    "Open agent capability console",
  ),
  simple(
    "system.closeCommandSurface",
    "Close command surface",
    "Close the floating agent capability console.",
    ["SYSTEM", "CLOSE", "CONSOLE"],
    "Close agent capability console",
  ),
  simple(
    "system.minimiseCommandSurface",
    "Minimise command surface",
    "Minimise the floating capability console.",
    ["SYSTEM", "MINIMISE", "CONSOLE"],
    "Minimise agent capability console",
  ),
  simple(
    "system.restoreCommandSurface",
    "Restore command surface",
    "Restore the floating capability console.",
    ["SYSTEM", "RESTORE", "CONSOLE"],
    "Restore agent capability console",
  ),
  simple(
    "system.toggleCommandSurface",
    "Toggle command surface",
    "Toggle the floating capability console.",
    ["SYSTEM", "TOGGLE", "CONSOLE"],
    "Toggle agent capability console",
  ),
  simple(
    "system.openTerminal",
    "Open Agent CLI",
    "Open the console on the Agent CLI tab.",
    ["SYSTEM", "OPEN", "TERMINAL"],
    "Open Agent CLI",
  ),
  simple(
    "system.openAiConsole",
    "Open Navi (legacy alias)",
    "Open the Agent Console on the Navi tab. Retained for history compatibility.",
    ["SYSTEM", "OPEN", "AI"],
    "Open Navi in the Agent Console",
  ),
  simple(
    "system.openInspector",
    "Open capability inspector",
    "Open the console on the Inspector tab.",
    ["SYSTEM", "OPEN", "INSPECTOR"],
    "Open capability inspector",
  ),
  simple(
    "system.openHistory",
    "Open execution history",
    "Open the Agent Console on the shared History tab.",
    ["SYSTEM", "OPEN", "HISTORY"],
    "Open capability execution history",
  ),
  simple(
    "system.openActionKeyMode",
    "Open Action Key Mode",
    "Open the accessible Action Key command input.",
    ["SYSTEM", "OPEN", "ACTION", "KEYS"],
    "Open Action Key Mode",
  ),
  simple(
    "system.closeActionKeyMode",
    "Close Action Key Mode",
    "Close the Action Key command input and restore focus.",
    ["SYSTEM", "CLOSE", "ACTION", "KEYS"],
    "Close Action Key Mode",
  ),
  simple(
    "system.getApplicationInfo",
    "Get application info",
    "Describe the browser runtime and architecture.",
    ["SYSTEM", "INFO"],
    "Get application information",
  ),
  simple(
    "system.auditCapabilities",
    "Audit capabilities",
    "Validate registered capability definitions and invocation mappings.",
    ["SYSTEM", "AUDIT", "CAPABILITIES"],
    "Audit registered capabilities",
  ),
  simple(
    "system.getCapabilityDelta",
    "Get capability delta",
    "Compare the current generated manifest with the accepted baseline.",
    ["SYSTEM", "CAPABILITY", "DELTA"],
    "Compare capabilities with the accepted baseline",
  ),
  define({
    ...base(
      "system.reportCapabilityIssue",
      "Report capability issue",
      "Store a capability issue locally in browser SQLite.",
      "run system.reportCapabilityIssue --reportType <reportType> --severity <severity> --details <details>",
      ["SYSTEM", "REPORT", "<reportType>", "<severity>", "<details>", "ENTER"],
      "Report a local capability issue",
      [
        {
          name: "capabilityId",
          description: "Related capability ID, when known.",
          type: "string",
          required: false,
        },
        {
          name: "reportType",
          description: "Type of capability or QA issue.",
          type: "string",
          required: true,
        },
        {
          name: "severity",
          description: "Issue severity.",
          type: "enum",
          required: true,
          values: ["info", "warning", "error"],
        },
        {
          name: "details",
          description: "Human-readable issue details.",
          type: "string",
          required: true,
        },
        {
          name: "route",
          description: "Route where the issue occurred.",
          type: "string",
          required: false,
        },
      ],
      { reportType: "qa", severity: "warning", details: "Describe the issue." },
    ),
    risk: "write",
  }),
  simple(
    "system.exportCapabilityReports",
    "Export capability reports",
    "Download locally stored capability reports as JSON.",
    ["SYSTEM", "EXPORT", "CAPABILITY", "REPORTS"],
    "Export local capability reports",
  ),
  ...[
    ["Home", "/", "HOME"],
    ["Projects", "/projects", "PROJECTS"],
    ["Experience", "/experience", "EXPERIENCE"],
    ["Blog", "/blog", "BLOG"],
    ["Cv", "/cv", "CV"],
    ["Capabilities", "/capabilities", "CAPABILITIES"],
  ].map(([name, , token]) =>
    simple(
      `navigation.go${name}`,
      `Go to ${name}`,
      `Navigate to the ${name.toLowerCase()} page.`,
      ["NAVIGATION", token],
      `Open ${name}`,
    ),
  ),
  simple(
    "navigation.goBack",
    "Go back",
    "Return to the previous browser history entry.",
    ["NAVIGATION", "BACK"],
    "Go back",
  ),
  define(
    base(
      "project.list",
      "List projects",
      "Return all portfolio projects.",
      "run project.list",
      ["PROJECT", "LIST", "ENTER"],
      "List portfolio projects",
      [
        {
          name: "featured",
          description: "Only featured projects.",
          type: "boolean",
          required: false,
        },
      ],
    ),
  ),
  define(
    base(
      "project.search",
      "Search projects",
      "Search project names, summaries, and technologies.",
      "run project.search --query <query>",
      ["PROJECT", "SEARCH", "<query>", "ENTER"],
      "Search portfolio projects",
      [text("query", "Words to search for.")],
      { query: "platform" },
    ),
  ),
  define(
    base(
      "project.view",
      "View project",
      "Open project details using a unique slug.",
      "run project.view --slug <slug>",
      ["PROJECT", "VIEW", "<slug>", "ENTER"],
      "Open project details",
      [text("slug", "The unique project slug.")],
      { slug: "nexus-backstage" },
    ),
  ),
  define(
    base(
      "project.filter",
      "Filter projects",
      "Filter projects by technology or status.",
      "run project.filter --value <value>",
      ["PROJECT", "FILTER", "<value>", "ENTER"],
      "Filter portfolio projects",
      [text("value", "Technology or status.")],
      { value: "TypeScript" },
    ),
  ),
  define(
    base(
      "project.openExternal",
      "Open project website",
      "Open a project website or repository.",
      "run project.openExternal --slug <slug>",
      ["PROJECT", "OPEN", "EXTERNAL", "<slug>", "ENTER"],
      "Open project external link",
      [text("slug", "The project slug.")],
      { slug: "michaelos" },
    ),
  ),
  simple(
    "experience.list",
    "List experience",
    "Return professional roles.",
    ["EXPERIENCE", "LIST"],
    "List professional experience",
  ),
  define(
    base(
      "experience.view",
      "View experience",
      "Return an experience record by ID.",
      "run experience.view --id <id>",
      ["EXPERIENCE", "VIEW", "<id>", "ENTER"],
      "View experience details",
      [text("id", "Experience record ID.")],
      { id: "e1" },
    ),
  ),
  define(
    base(
      "experience.filter",
      "Filter experience",
      "Filter experience by role or organisation.",
      "run experience.filter --query <query>",
      ["EXPERIENCE", "FILTER", "<query>", "ENTER"],
      "Filter professional experience",
      [text("query", "Filter text.")],
      { query: "platform" },
    ),
  ),
  simple(
    "article.list",
    "List articles",
    "Return Mike’s available writing, including clearly labelled drafts.",
    ["ARTICLE", "LIST"],
    "List available articles",
  ),
  define(
    base(
      "article.search",
      "Search articles",
      "Search article titles, summaries, and tags.",
      "run article.search --query <query>",
      ["ARTICLE", "SEARCH", "<query>", "ENTER"],
      "Search available articles",
      [text("query", "Words to search for.")],
      { query: "platform engineering" },
    ),
  ),
  define(
    base(
      "article.view",
      "View article",
      "Open an article using its slug.",
      "run article.view --slug <slug>",
      ["ARTICLE", "VIEW", "<slug>", "ENTER"],
      "Open article",
      [text("slug", "The article slug.")],
      { slug: "backstage-platform-engineering-as-a-product" },
    ),
  ),
  define(
    base(
      "article.filterByTag",
      "Filter articles by tag",
      "Return articles with a given tag.",
      "run article.filterByTag --tag <tag>",
      ["ARTICLE", "FILTER", "TAG", "<tag>", "ENTER"],
      "Filter articles by tag",
      [text("tag", "Article tag.")],
      { tag: "Architecture" },
    ),
  ),
  define(
    base(
      "article.openExternal",
      "Open external article",
      "Open an article external URL.",
      "run article.openExternal --slug <slug>",
      ["ARTICLE", "OPEN", "EXTERNAL", "<slug>", "ENTER"],
      "Open external article",
      [text("slug", "Article slug.")],
      { slug: "backstage-platform-engineering-as-a-product" },
    ),
  ),
  simple(
    "skill.list",
    "List skills",
    "Return skills and categories.",
    ["SKILL", "LIST"],
    "List skills",
  ),
  define(
    base(
      "skill.search",
      "Search skills",
      "Search skill names and descriptions.",
      "run skill.search --query <query>",
      ["SKILL", "SEARCH", "<query>", "ENTER"],
      "Search skills",
      [text("query", "Words to search for.")],
      { query: "platform" },
    ),
  ),
  define(
    base(
      "skill.filterByCategory",
      "Filter skills by category",
      "Return skills in a category.",
      "run skill.filterByCategory --category <category>",
      ["SKILL", "FILTER", "CATEGORY", "<category>", "ENTER"],
      "Filter skills by category",
      [text("category", "Skill category.")],
      { category: "Systems" },
    ),
  ),
  simple(
    "cv.view",
    "View CV",
    "Open the curriculum vitae.",
    ["CV", "VIEW"],
    "View curriculum vitae",
  ),
  define(
    base(
      "cv.navigateSection",
      "Navigate CV section",
      "Open a named CV section.",
      "run cv.navigateSection --section <section>",
      ["CV", "SECTION", "<section>", "ENTER"],
      "Navigate CV section",
      [text("section", "CV section ID.")],
      { section: "experience" },
    ),
  ),
  simple(
    "cv.exportJson",
    "Export CV as JSON",
    "Download the CV as structured JSON.",
    ["CV", "EXPORT", "JSON"],
    "Export CV as JSON",
  ),
  simple(
    "cv.print",
    "Print or export CV as PDF",
    "Open the browser print dialog to print the CV or save it as a PDF.",
    ["CV", "PRINT"],
    "Print or export curriculum vitae as PDF",
  ),
  simple(
    "inspector.getLastExecution",
    "Get latest execution",
    "Return the latest capability execution.",
    ["INSPECTOR", "LATEST"],
    "Get latest capability execution",
  ),
  simple(
    "inspector.listHistory",
    "List execution history",
    "Return local execution history.",
    ["INSPECTOR", "HISTORY"],
    "List capability history",
  ),
  define(
    base(
      "inspector.filterHistory",
      "Filter execution history",
      "Filter history by capability, caller, or status.",
      "run inspector.filterHistory --query <query>",
      ["INSPECTOR", "FILTER", "<query>", "ENTER"],
      "Filter capability history",
      [text("query", "Filter text.")],
      { query: "project" },
    ),
  ),
  simple(
    "accessibility.describeElement",
    "Describe selected element",
    "Return semantic metadata for the selected control.",
    ["ACCESSIBILITY", "DESCRIBE"],
    "Describe selected interface element",
  ),
  simple(
    "accessibility.listPageActions",
    "List page actions",
    "List visible capability-backed controls.",
    ["ACCESSIBILITY", "LIST", "ACTIONS"],
    "List accessible page actions",
  ),
  define(
    base(
      "accessibility.moveFocus",
      "Move capability focus",
      "Move focus between capability-backed controls.",
      "run accessibility.moveFocus --direction <direction>",
      ["ACCESSIBILITY", "FOCUS", "<direction>", "ENTER"],
      "Move focus between page actions",
      [
        {
          name: "direction",
          description: "Focus direction.",
          type: "enum",
          required: true,
          values: ["next", "previous"],
        },
      ],
      { direction: "next" },
    ),
  ),
  simple(
    "accessibility.activateFocused",
    "Activate focused capability",
    "Activate the focused capability-backed control.",
    ["ACCESSIBILITY", "ACTIVATE"],
    "Activate focused page action",
  ),
];

if (capabilities.some((item) => !handlers[item.id]))
  throw new Error("A capability is missing its executor.");
export const registry = new Map(capabilities.map((item) => [item.id, item]));
