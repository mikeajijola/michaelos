export type Project = { id: string; slug: string; name: string; summary: string; description: string; role: string; technologies: string[]; status: string; featured: boolean; year: string; accent: string; url?: string; repositoryUrl?: string };
export type Experience = { id: string; organisation: string; title: string; summary: string; period: string; location: string; achievements: string[] };
export type Article = { id: string; slug: string; title: string; summary: string; publishedAt: string; readTime: string; tags: string[]; status: string };
export type Skill = { id: string; name: string; category: string; description: string; proficiency: string };

export const projects: Project[] = [
  { id: "p1", slug: "atlas-platform", name: "Atlas Platform", summary: "A paved-road developer platform that turns infrastructure into a product.", description: "Atlas gives engineering teams a consistent route from a new repository to a production service—with golden paths, service ownership, scorecards and progressive delivery built in.", role: "Staff Platform Engineer", technologies: ["Kubernetes", "Backstage", "TypeScript", "OpenTelemetry"], status: "In production", featured: true, year: "2025", accent: "blue", repositoryUrl: "https://github.com/" },
  { id: "p2", slug: "signal-room", name: "Signal Room", summary: "An observability workspace designed around decisions, not dashboards.", description: "Signal Room brings service health, incident context and deployment changes into one calm operational view.", role: "Product & Engineering", technologies: ["React", "ClickHouse", "WebAssembly"], status: "Case study", featured: true, year: "2024", accent: "coral", url: "https://example.com" },
  { id: "p3", slug: "local-first-notes", name: "Field Notes", summary: "Private, resilient research notes that work wherever the work happens.", description: "A local-first writing environment exploring CRDTs, browser databases and durable offline software.", role: "Independent maker", technologies: ["SQLite WASM", "OPFS", "React"], status: "Active", featured: true, year: "2025", accent: "green" },
  { id: "p4", slug: "civic-data-kit", name: "Civic Data Kit", summary: "Clear public-data tools for people who do not speak in schemas.", description: "Reusable data ingestion and visualisation primitives for small civic organisations.", role: "Technical lead", technologies: ["Python", "PostgreSQL", "D3"], status: "Open source", featured: false, year: "2023", accent: "violet", repositoryUrl: "https://github.com/" },
];

export const experience: Experience[] = [
  { id: "e1", organisation: "Northstar Systems", title: "Staff Platform Engineer", period: "2023 — Present", location: "London · Remote", summary: "Building the systems and practices that let product teams ship safely without carrying infrastructure complexity.", achievements: ["Led a developer platform used by 40+ teams", "Reduced median service setup from five days to 22 minutes", "Introduced organisation-wide service ownership and SLOs"] },
  { id: "e2", organisation: "Common Thread", title: "Principal Software Engineer", period: "2020 — 2023", location: "London, UK", summary: "Led cross-functional teams through cloud modernisation and the move to an internal-platform model.", achievements: ["Designed an event platform processing 1.2B monthly events", "Cut deployment recovery time by 68%", "Mentored senior engineers across four product groups"] },
  { id: "e3", organisation: "Independent", title: "Engineer & Product Advisor", period: "2017 — 2020", location: "United Kingdom", summary: "Helped early-stage teams turn ambiguous product ideas into durable systems and capable engineering organisations.", achievements: ["Shipped products in climate, mobility and public-interest technology", "Established technical direction for three seed-stage teams"] },
];

export const articles: Article[] = [
  { id: "a1", slug: "capabilities-not-interfaces", title: "Capabilities, not interfaces", summary: "What changes when software describes what it can do before deciding how people will do it.", publishedAt: "18 Jul 2026", readTime: "8 min", tags: ["Architecture", "AI"], status: "published" },
  { id: "a2", slug: "local-first-is-a-product-decision", title: "Local-first is a product decision", summary: "Offline resilience is less about storage technology and more about what kind of relationship a product has with its user.", publishedAt: "04 Jun 2026", readTime: "6 min", tags: ["Local-first", "Product"], status: "published" },
  { id: "a3", slug: "platforms-are-promises", title: "Platforms are promises", summary: "The useful unit of platform engineering is not infrastructure. It is a promise a team can depend on.", publishedAt: "21 Apr 2026", readTime: "7 min", tags: ["Platforms", "Engineering"], status: "published" },
];

export const skills: Skill[] = [
  { id: "s1", name: "Platform engineering", category: "Systems", description: "Golden paths, service platforms and developer experience", proficiency: "Expert" },
  { id: "s2", name: "Distributed systems", category: "Systems", description: "Reliable, observable, event-driven architectures", proficiency: "Expert" },
  { id: "s3", name: "Technical strategy", category: "Leadership", description: "Turning product direction into executable system choices", proficiency: "Expert" },
  { id: "s4", name: "TypeScript & React", category: "Engineering", description: "Accessible, resilient web products", proficiency: "Advanced" },
  { id: "s5", name: "Cloud native", category: "Engineering", description: "Kubernetes, delivery platforms and observability", proficiency: "Advanced" },
  { id: "s6", name: "Team development", category: "Leadership", description: "Mentoring, coaching and healthy technical culture", proficiency: "Expert" },
];
