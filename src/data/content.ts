export type ExternalSource = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  formalName: string;
  location: string;
  headline: string;
  compactHeadline: string;
  summary: string;
  longSummary: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  organisation?: string;
  summary: string;
  description: string;
  role: string;
  technologies: string[];
  themes: string[];
  status: string;
  featured: boolean;
  year: string;
  accent: string;
  url?: string;
  repositoryUrl?: string;
  externalSources?: ExternalSource[];
};

export type Experience = {
  id: string;
  organisation: string;
  title: string;
  summary: string;
  period: string;
  location: string;
  achievements: string[];
  relatedProjectIds?: string[];
  externalSources?: ExternalSource[];
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  alternativeTitle?: string;
  excerpt: string;
  summary: string;
  publishedAt?: string;
  status: "draft" | "published";
  readingMinutes?: number;
  readTime: string;
  tags: string[];
  sections: ArticleSection[];
  relatedProjectIds: string[];
  externalSources?: ExternalSource[];
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  proficiency: string;
};

export type Recognition = {
  id: string;
  title: string;
  detail: string;
  source?: ExternalSource;
};

export type Education = {
  id: string;
  qualification: string;
  institution: string;
};

export const links = {
  github: "https://github.com/mikeajijola",
  michaelosRepository: "https://github.com/mikeajijola/michaelos",
  michaelosLive: "https://michaelos-nine.vercel.app/",
  lawneeds: "https://lawneeds.co.uk/",
  aeroknite: "https://www.aeroknite.com/",
  spotifyBackstage:
    "https://backstage.spotify.com/discover/blog/the-access-group-evolves-with-insights",
} as const;

export const profile: Profile = {
  name: "Mike Ajijola",
  formalName: "Michael Ajijola",
  location: "London, United Kingdom",
  headline: "Enterprise Solutions Architect · AI Strategy · Platform Engineering",
  compactHeadline: "Enterprise architect · Product strategist · Systems thinker",
  summary:
    "Mike Ajijola is an enterprise solutions architect and strategic technical adviser working across platform engineering, AI adoption, M&A integration and product innovation. He helps large organisations and early-stage ventures turn ambiguous business goals into adoptable systems, operating models and technical roadmaps.",
  longSummary:
    "Mike works where architecture, organisational change and product strategy meet. His experience spans enterprise developer platforms, cloud infrastructure, automation, acquisition integration, agentic AI and startup product design. He has led initiatives inside one of the UK’s largest privately held software companies and advised ventures that went on to receive UK innovation endorsements.",
};

export const aliases: Record<string, string[]> = {
  lawneeds: ["law needs", "legal startup", "legal ai"],
  aeroknite: ["aeronite", "aero knite", "drone startup", "wildfire drone"],
  "uk-innovation-endorsements": [
    "innovation endorsements",
    "endorsed innovation",
    "endorsed ventures",
    "lawneeds",
    "aeroknite",
  ],
  "nexus-backstage": [
    "spotify backstage",
    "backstage",
    "nexus",
    "developer portal",
    "developer platform",
  ],
  "omnicede-ui": [
    "omni seed ui",
    "omnicede",
    "unicede",
    "agentic organisation",
    "capability-led organisation",
  ],
  michaelos: [
    "michael os",
    "browser operating system",
    "browser-native portfolio",
  ],
  ceoclaw: ["ceo claw", "imperial competition"],
};

export const projects: Project[] = [
  {
    id: "uk-innovation-endorsements",
    slug: "uk-innovation-endorsements",
    name: "Turning ambitious products into endorsed innovation",
    subtitle: "LawNeeds and Aeroknite",
    summary:
      "Product architecture and innovation strategy for two ventures that subsequently secured UK innovation endorsements.",
    description:
      "Mike advised LawNeeds and Aeroknite as they developed their propositions, technical architecture and innovation narratives. The work involved clarifying the problem being solved, connecting product features to a defensible innovation thesis, shaping technical roadmaps and helping each venture explain how its approach differed meaningfully from existing alternatives.",
    role: "Adviser · Product architecture · Innovation strategy",
    technologies: ["AI", "Product architecture", "Innovation strategy"],
    themes: [
      "Startup advisory",
      "UK innovation",
      "Legal technology",
      "Autonomous systems",
    ],
    status: "Advisory · Public recognition",
    featured: true,
    year: "2024–2025",
    accent: "yellow",
    externalSources: [
      { label: "Visit LawNeeds", url: links.lawneeds },
      { label: "Visit Aeroknite", url: links.aeroknite },
    ],
  },
  {
    id: "nexus-backstage",
    slug: "nexus-backstage",
    name: "Nexus: platform engineering as a product, not a policy",
    organisation: "The Access Group",
    summary:
      "A Backstage-based internal developer platform designed to create shared value across an acquisition-led organisation.",
    description:
      "Mike helped shape and grow Nexus, The Access Group’s internal developer platform. The work created a shared developer experience across a diverse organisation without forcing every business onto one rigid toolchain, using leadership advocacy, social-technical engagement and inner sourcing to build adoption.",
    role: "Enterprise Solutions Architect",
    technologies: ["Backstage", "Spotify Insights", "Platform engineering"],
    themes: [
      "Developer experience",
      "M&A integration",
      "Inner sourcing",
      "Knowledge sharing",
      "Organisational adoption",
    ],
    status: "Enterprise platform engineering",
    featured: true,
    year: "2022–Present",
    accent: "blue",
    externalSources: [
      {
        label: "Read the Spotify Backstage case study",
        url: links.spotifyBackstage,
      },
    ],
  },
  {
    id: "omnicede-ui",
    slug: "omnicede-ui",
    name: "Omnicede UI",
    subtitle: "A capability-led operating interface for organisations",
    summary:
      "Active research into governed organisational capabilities, work products, context, decisions and KPI loops.",
    description:
      "Omnicede UI explores how organisations can be represented as governed capabilities, work products, data, decisions and KPI loops rather than disconnected applications. People and agents use the same capability layer through different clients while preserving permissions, provenance and inspectable history.",
    role: "Founder · Research and product development",
    technologies: ["Agentic systems", "Capability registries", "Browser-native"],
    themes: [
      "Capability-led organisations",
      "KPI and feedback loops",
      "Work products",
      "Governed execution",
      "Organisational context",
      "Inspectable agent actions",
    ],
    status: "Active research and product development",
    featured: true,
    year: "Active",
    accent: "violet",
  },
  {
    id: "michaelos",
    slug: "michaelos",
    name: "MichaelOS",
    subtitle: "A browser-native capability operating environment",
    summary:
      "An interactive portfolio in which the UI, Navi, Agent CLI, Action Keys and Inspector share one capability registry.",
    description:
      "MichaelOS demonstrates a pattern in which software describes what it can do before deciding which interface a human or agent must use. It combines conversational navigation, Capability Trace, browser-local state, accessibility clients and governed capability execution.",
    role: "Creator",
    technologies: ["Next.js", "SQLite WASM", "Local-first", "Agentic UI"],
    themes: [
      "Navi conversational and realtime voice navigation",
      "Capability Trace",
      "Agent CLI and Action Keys",
      "Browser-agent discovery",
      "Accessibility",
    ],
    status: "Active",
    featured: true,
    year: "2026",
    accent: "green",
    url: links.michaelosLive,
    repositoryUrl: links.michaelosRepository,
    externalSources: [
      { label: "View MichaelOS source", url: links.michaelosRepository },
      { label: "Open the live site", url: links.michaelosLive },
    ],
  },
];

export const experience: Experience[] = [
  {
    id: "access-group",
    organisation: "The Access Group",
    title: "Enterprise Solutions Architect",
    period: "May 2022–Present",
    location: "United Kingdom",
    summary:
      "Enterprise architecture, platform engineering and strategic technology leadership across a large, acquisition-led software group.",
    achievements: [
      "Helped shape Nexus, the Group’s Backstage developer platform, as a product rather than a central mandate.",
      "Worked across diverse businesses and technology estates on shared platforms, cloud architecture, automation and integration patterns.",
      "Supported organisation-wide AI consultation and adoption, translating business priorities into architecture and delivery practices.",
    ],
    relatedProjectIds: ["nexus-backstage"],
    externalSources: [
      {
        label: "Read the Spotify Backstage case study",
        url: links.spotifyBackstage,
      },
    ],
  },
  {
    id: "solo-levelling",
    organisation: "Solo-Levelling Ltd",
    title: "Founder · Startup and AI Adviser",
    period: "2024–Present",
    location: "United Kingdom",
    summary:
      "Advises early-stage ventures on agentic AI, product architecture, technical strategy, innovation positioning and go-to-market readiness.",
    achievements: [
      "Advised LawNeeds and Aeroknite, two ventures that subsequently gained UK innovation endorsements.",
      "Developed Omnicede and Omnicede UI concepts around agentic memory and capability-led organisational systems.",
    ],
    relatedProjectIds: ["uk-innovation-endorsements", "omnicede-ui"],
  },
  {
    id: "wso-consulting",
    organisation: "WSO Consulting",
    title: "Founder · Strategic AI Adviser",
    period: "August 2023–February 2024",
    location: "United Kingdom",
    summary:
      "Advised organisations and product teams on AI strategy, automation and product innovation, including work connected to media, entertainment and emerging agentic experiences.",
    achievements: [
      "Connected emerging AI capabilities to practical product and operating-model decisions.",
    ],
  },
  {
    id: "staff-one",
    organisation: "Staff One",
    title: "AI and Automation Lead",
    period: "October 2021–March 2022",
    location: "United Kingdom",
    summary:
      "Designed AI-supported content and workflow automation, connecting product experimentation with audience and operational outcomes.",
    achievements: [
      "Developed automation approaches without exposing private performance metrics or internal systems.",
    ],
  },
  {
    id: "fdm-group",
    organisation: "FDM Group",
    title: "IT Consultant",
    period: "March 2019–May 2021",
    location: "United Kingdom",
    summary:
      "Worked in embedded cloud and infrastructure consulting roles across Azure, Kubernetes and enterprise delivery environments supporting public-sector and national-scale organisations.",
    achievements: [
      "Supported cloud architecture and infrastructure delivery in complex enterprise environments.",
    ],
  },
];

export const articles: Article[] = [
  {
    id: "lawneeds-from-need-to-innovation",
    slug: "lawneeds-from-need-to-innovation",
    title: "LawNeeds: turning an urgent problem into an endorsed product",
    alternativeTitle:
      "What LawNeeds taught me about designing AI for real legal needs",
    excerpt:
      "LawNeeds began with a problem that was easy to recognise but difficult to structure: people frequently know that something is wrong before they know what kind of legal help they need.",
    summary:
      "Turning ambiguity around access to legal support into a product, an architecture and an innovation case.",
    status: "draft",
    readingMinutes: 8,
    readTime: "8 min",
    tags: ["Legal technology", "AI", "Startup advisory", "Product strategy", "Innovation"],
    relatedProjectIds: ["uk-innovation-endorsements"],
    externalSources: [{ label: "Visit LawNeeds", url: links.lawneeds }],
    sections: [
      {
        heading: "The problem was not simply legal search",
        paragraphs: [
          "People often recognise the urgency of a legal problem before they can name its category. I approached LawNeeds as a problem of guided understanding: help someone express their need, recognise the boundary between information and professional judgement, and move toward appropriate support.",
        ],
      },
      {
        heading: "Designing around the need",
        paragraphs: [
          "My advisory work focused on connecting the user problem, product proposition and technical architecture. The important design question was not how much AI could be added, but how the system could make a high-trust journey clearer and more explainable.",
          "TODO: add Mike’s approved account of the precise product and technical decisions he shaped with the founding team.",
        ],
      },
      {
        heading: "Building an innovation argument",
        paragraphs: [
          "An innovation narrative has to connect meaningful difference to an implementable roadmap. I helped frame the product’s features as part of a coherent system, rather than a collection of claims, and supported the venture as it developed its case for UK innovation endorsement.",
        ],
      },
      {
        heading: "What I learned about high-trust AI",
        paragraphs: [
          "High-trust products must be unusually clear about what the system knows, what it is helping with and where professional judgement begins. LawNeeds reinforced my view that adoption depends as much on understandable boundaries as it does on model capability.",
          "The venture subsequently received a UK innovation endorsement. The endorsement body, dates and private application material are intentionally not published here pending an approved public record.",
        ],
      },
    ],
  },
  {
    id: "aeroknite-autonomous-systems-innovation",
    slug: "aeroknite-autonomous-systems-innovation",
    title: "Aeroknite: designing an innovation story for autonomous wildfire response",
    alternativeTitle:
      "From an ambitious drone concept to an endorsed autonomous-systems venture",
    excerpt:
      "Aeroknite’s ambition was never just to manufacture another drone. The harder question was how autonomous aircraft, sensing, wildfire intelligence and operational response could become one credible system.",
    summary:
      "Connecting autonomous aircraft, sensing, prediction and operational response into an understandable product roadmap.",
    status: "draft",
    readingMinutes: 8,
    readTime: "8 min",
    tags: ["Autonomous systems", "Drones", "Wildfire technology", "AI", "Product architecture", "Innovation"],
    relatedProjectIds: ["uk-innovation-endorsements"],
    externalSources: [{ label: "Visit Aeroknite", url: links.aeroknite }],
    sections: [
      {
        heading: "Starting with the operational problem",
        paragraphs: [
          "Deep-tech propositions become credible when the engineering is organised around an operational problem. With Aeroknite, I looked beyond the aircraft to the wider response system: sensing conditions, understanding risk, deploying assets and supporting decisions in environments that are dangerous for people.",
        ],
      },
      {
        heading: "Why the product is more than the aircraft",
        paragraphs: [
          "Aeroknite publicly presents autonomous UAV systems, a fire-extinguishing drone, automatic reloading and swarm operation. Its FireScan proposition connects fire detection, AI prediction, drone control and analysis. The product story only becomes coherent when those elements are explained as one operating system for response rather than isolated features.",
        ],
      },
      {
        heading: "Turning ambition into a roadmap",
        paragraphs: [
          "My role as a strategic and product adviser was to help make ambitious engineering legible: identify the sequence of capabilities, connect technical decisions to user outcomes and build an innovation narrative that could withstand scrutiny.",
          "TODO: add Mike’s approved account of the specific technical and commercial decisions he personally shaped.",
        ],
      },
      {
        heading: "What this taught me",
        paragraphs: [
          "Deep-tech strategy is an exercise in disciplined translation. The vision must remain ambitious, but each part needs a reason to exist in the wider system and a plausible route to delivery. Aeroknite subsequently secured a UK innovation endorsement; private endorsement material is not reproduced here.",
        ],
      },
    ],
  },
  {
    id: "backstage-platform-engineering-as-a-product",
    slug: "backstage-platform-engineering-as-a-product",
    title: "What building Nexus taught me about platform engineering at organisational scale",
    alternativeTitle: "Platform engineering as a product, not a policy",
    excerpt:
      "The difficult part of platform engineering in an acquisition-led organisation is not choosing a portal. It is creating enough shared value that independent teams choose to participate.",
    summary:
      "A personal retrospective on Nexus, Backstage and creating voluntary platform adoption across a diverse organisation.",
    status: "draft",
    readingMinutes: 10,
    readTime: "10 min",
    tags: ["Platform engineering", "Backstage", "Developer experience", "M&A", "Organisational change"],
    relatedProjectIds: ["nexus-backstage"],
    externalSources: [
      {
        label: "Read the original Spotify Backstage case study",
        url: links.spotifyBackstage,
      },
    ],
    sections: [
      {
        heading: "Growth creates fragmentation",
        paragraphs: [
          "In an organisation that grows through acquisitions, teams arrive with working technology, established practices and their own priorities. A central migration can consume the time it is meant to save. Nexus began from a different question: what shared value would make independent teams want to participate?",
        ],
      },
      {
        heading: "Building shared value instead of enforcing conformity",
        paragraphs: [
          "We treated platform engineering as a product rather than a policy. Leadership became advocates rather than enforcers, and the platform combined technical capabilities with visible places for knowledge, contribution and discussion. Inner sourcing made organisational ownership part of the design.",
        ],
      },
      {
        heading: "Using evidence to guide adoption",
        paragraphs: [
          "Spotify Insights helped us understand use and sentiment rather than relying on launch activity as proof of adoption. The Spotify-published case study reports an engineering organisation of more than 2,500 developers and approximately 20% month-on-month active-user growth.",
          "That publication also describes the decision to integrate the open-source Qeta plugin instead of purchasing a knowledge-sharing SaaS product, with a potential seven-figure saving. Those figures belong to the published case study and are not expanded beyond it here.",
        ],
      },
      {
        heading: "What I would carry forward",
        paragraphs: [
          "A portal does not create a platform culture by itself. The enduring work is to design participation: make value visible, let teams retain useful autonomy, create routes for contribution and treat adoption as an evolving product problem.",
        ],
      },
    ],
  },
  {
    id: "from-ceoclaw-to-omnicede-ui",
    slug: "from-ceoclaw-to-omnicede-ui",
    title: "I won CEOclaw. Here’s what I built next.",
    alternativeTitle:
      "From CEOclaw to Omnicede UI: designing the capability-led organisation",
    excerpt:
      "Winning CEOclaw was not the conclusion of an idea. It was the point at which thoughts about agents, organisations, memory and work began to form into a coherent operating model.",
    summary:
      "From a national-track win at Imperial College London to the active development of a capability-led organisational interface.",
    status: "draft",
    readingMinutes: 10,
    readTime: "10 min",
    tags: ["Agentic organisations", "Omnicede UI", "Capabilities", "Organisational design", "AI strategy"],
    relatedProjectIds: ["omnicede-ui", "michaelos"],
    sections: [
      {
        heading: "The CEOclaw starting point",
        paragraphs: [
          "I was a national-track winner at CEOclaw at Imperial College London. I treat that as a starting point rather than a finished product: it gave a collection of ideas about agents, organisational memory and work a sharper direction.",
          "TODO: add the verified competition year and formal track wording when an approved source is available.",
        ],
      },
      {
        heading: "Organisations are not collections of applications",
        paragraphs: [
          "Most software mirrors departmental boundaries and asks people to reconstruct context across tools. I am exploring a different representation: an organisation as a governed network of capabilities, work products, context, decisions and KPI loops.",
        ],
      },
      {
        heading: "Capabilities as organisational contracts",
        paragraphs: [
          "A capability registry makes the organisation’s permitted actions inspectable. People and agents can use different interfaces without duplicating the underlying business logic. Conflicting objectives can then be treated more like visible merge conflicts than invisible political friction.",
        ],
      },
      {
        heading: "Omnicede UI and MichaelOS",
        paragraphs: [
          "Omnicede UI is the active research and product direction for that operating interface. MichaelOS is the personal-scale demonstrator: one capability system, multiple interfaces, persistent context, governed agent navigation and an execution trace that shows what happened.",
          "The work remains active research and development. The next step is to test how composable workspaces, organisational memory and KPI feedback can operate without turning the interface into another rigid dashboard.",
        ],
      },
    ],
  },
];

export const skills: Skill[] = [
  { id: "enterprise-architecture", name: "Enterprise and solution architecture", category: "Architecture", description: "Connecting business goals, operating models, systems and delivery roadmaps", proficiency: "Principal practice" },
  { id: "platform-engineering", name: "Platform engineering and developer experience", category: "Platforms", description: "Shared developer platforms, Backstage and product-led adoption", proficiency: "Principal practice" },
  { id: "ai-strategy", name: "AI strategy and adoption", category: "AI", description: "Turning emerging AI capabilities into governed, adoptable programmes", proficiency: "Strategic practice" },
  { id: "ma-integration", name: "M&A technology integration", category: "Architecture", description: "Creating shared value across acquired products and diverse technology estates", proficiency: "Strategic practice" },
  { id: "product-innovation", name: "Product and innovation strategy", category: "Product", description: "Shaping propositions, roadmaps and defensible innovation narratives", proficiency: "Strategic practice" },
  { id: "automation", name: "Automation and operating-model design", category: "Operations", description: "Connecting workflow automation to measurable organisational outcomes", proficiency: "Advanced practice" },
  { id: "cloud-architecture", name: "Cloud architecture", category: "Technology", description: "Azure, Kubernetes and enterprise infrastructure environments", proficiency: "Advanced practice" },
  { id: "agentic-systems", name: "Agentic systems and organisational capabilities", category: "AI", description: "Governed capabilities, organisational context and shared human-agent interfaces", proficiency: "Active research" },
];

export const recognition: Recognition[] = [
  {
    id: "innovation-endorsements",
    title: "UK innovation endorsements",
    detail:
      "LawNeeds and Aeroknite achieved UK innovation endorsements with Mike’s advisory support. The endorsement issuers and private application materials are not published.",
  },
  {
    id: "spotify-case-study",
    title: "Published Spotify Backstage case study",
    detail:
      "Author of the public case study on how The Access Group evolves Nexus through product-led adoption and Spotify Insights.",
    source: {
      label: "Read the Spotify Backstage case study",
      url: links.spotifyBackstage,
    },
  },
  {
    id: "ceoclaw",
    title: "CEOclaw national-track winner",
    detail:
      "National-track winner at CEOclaw at Imperial College London. Date and formal track wording remain pending verified public evidence.",
  },
];

export const education: Education[] = [
  {
    id: "sheffield-aerospace",
    qualification: "BEng Aerospace Engineering",
    institution: "University of Sheffield",
  },
];
