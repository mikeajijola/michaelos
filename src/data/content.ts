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
  pullQuote?: string;
  items?: ArticleSectionItem[];
  examples?: ArticleExample[];
};

export type ArticleSectionItem = {
  title: string;
  body: string;
};

export type ArticleExample = {
  label: "Illustrative example";
  title: string;
  value: Record<string, unknown>;
};

export type ArticleSource = {
  title: string;
  publisher?: string;
  url: string;
  relationship:
    | "primary-evidence"
    | "project-site"
    | "background"
    | "related-work";
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  alternativeTitle?: string;
  excerpt: string;
  summary: string;
  socialDescription?: string;
  publishedAt?: string;
  status: "draft" | "published";
  readingMinutes?: number;
  readTime: string;
  tags: string[];
  sections: ArticleSection[];
  relatedProjectIds: string[];
  relatedArticleIds?: string[];
  continuesWith?: string[];
  originArticle?: string;
  sources: ArticleSource[];
  evidenceNote?: string;
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
  linkedin: "https://www.linkedin.com/in/mike-ajijola",
  michaelosRepository: "https://github.com/mikeajijola/michaelos",
  michaelosLive: "https://mikeajijola.com/",
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
    "Mike Ajijola is an enterprise solutions architect and strategic technical advisor working across platform engineering, AI adoption, M&A integration and product innovation. He helps large organisations and early-stage ventures turn ambiguous business goals into adoptable systems, operating models and technical roadmaps.",
  longSummary:
    "Mike designs enterprise platforms, integration approaches and AI adoption programmes. His experience includes cloud infrastructure, automation, acquisition integration and startup product design. He has led initiatives inside one of the UK’s largest privately held software companies and advised ventures that went on to receive UK innovation endorsements.",
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
  "company-as-code": [
    "company as code",
    "organisation as code",
    "organization as code",
    "executable organisation",
  ],
  "semantic-alerts": [
    "semantic alert",
    "semantic alerts",
    "meaning based alerts",
    "organisational alerts",
    "organizational alerts",
    "organisational drift",
  ],
  "ai-new-class-of-consumer": [
    "ai consumer",
    "machine consumer",
    "machine customer",
    "machine customers",
    "agentic commerce",
    "ai generated demand",
    "economic capacitance",
  ],
};

export const projects: Project[] = [
  {
    id: "lawneeds",
    slug: "lawneeds",
    name: "LawNeeds",
    subtitle: "Turning an urgent legal need into an endorsed product",
    summary:
      "Advisory work on an AI-supported legal product that subsequently secured a UK innovation endorsement.",
    description:
      "Mike advised LawNeeds and Aeroknite on product architecture, technical strategy and innovation positioning. Both ventures subsequently received UK innovation endorsements. For LawNeeds, the work focused on helping people understand a legal need before they know its formal category, while keeping a clear boundary between useful guidance and professional legal judgement.",
    role: "Advisor · Product architecture · Innovation strategy",
    technologies: ["Legal technology", "AI", "Product architecture"],
    themes: ["Startup advisory", "Innovation strategy", "UK innovation"],
    status: "Advisory · UK innovation endorsement",
    featured: true,
    year: "2024–2025",
    accent: "yellow",
    url: links.lawneeds,
    externalSources: [{ label: "Visit LawNeeds", url: links.lawneeds }],
  },
  {
    id: "aeroknite",
    slug: "aeroknite",
    name: "Aeroknite",
    subtitle: "Autonomous systems and wildfire-response innovation",
    summary:
      "Product and innovation strategy for an autonomous UAV venture that subsequently secured a UK innovation endorsement.",
    description:
      "Mike advised LawNeeds and Aeroknite on product architecture, technical strategy and innovation positioning. Both ventures subsequently received UK innovation endorsements. For Aeroknite, the work connected autonomous aircraft, sensing, wildfire intelligence and operational response into a coherent product roadmap.",
    role: "Strategic and product advisor",
    technologies: ["Autonomous systems", "UAVs", "AI"],
    themes: ["Wildfire response", "Product architecture", "UK innovation"],
    status: "Advisory · UK innovation endorsement",
    featured: true,
    year: "2024–2025",
    accent: "coral",
    url: links.aeroknite,
    externalSources: [{ label: "Visit Aeroknite", url: links.aeroknite }],
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
    name: "MikeOS",
    subtitle: "A browser-native capability operating environment",
    summary:
      "An interactive portfolio in which the UI, Navi, Agent CLI, Action Keys and Inspector share one capability registry.",
    description:
      "MikeOS demonstrates a pattern in which software describes what it can do before deciding which interface a human or agent must use. It combines conversational navigation, Capability Trace, browser-local state, accessibility clients and governed capability execution.",
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
      { label: "View MikeOS source", url: links.michaelosRepository },
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
      "At The Access Group, Mike works across enterprise architecture, platform engineering, AI adoption and technology integration in an acquisition-led software group. His work includes Nexus, the organisation’s Backstage-based developer platform, documented in a Spotify Backstage case study.",
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
    title: "Founder · Startup and AI Advisor",
    period: "2024–Present",
    location: "United Kingdom",
    summary:
      "Advises early-stage ventures on agentic AI, product architecture, technical strategy, innovation positioning and go-to-market readiness.",
    achievements: [
      "Advised LawNeeds and Aeroknite, two ventures that subsequently gained UK innovation endorsements.",
      "Developed Omnicede and Omnicede UI concepts around agentic memory and capability-led organisational systems.",
    ],
    relatedProjectIds: ["lawneeds", "aeroknite", "omnicede-ui"],
  },
  {
    id: "wso-consulting",
    organisation: "WSO Consulting",
    title: "Founder · Strategic AI Advisor",
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
    relatedProjectIds: ["lawneeds"],
    sources: [
      {
        title: "LawNeeds",
        publisher: "LawNeeds",
        url: links.lawneeds,
        relationship: "project-site",
      },
    ],
    evidenceNote:
      "This article is based on Mike’s direct account of his advisory work, supported by the venture’s public website.",
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
          "My advisory work focused on connecting the user problem, product proposition and technical architecture. The important design question was how the system could make a high-trust journey clearer and more explainable.",
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
          "The venture subsequently received a UK innovation endorsement.",
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
    relatedProjectIds: ["aeroknite"],
    sources: [
      {
        title: "Aeroknite",
        publisher: "Aeroknite",
        url: links.aeroknite,
        relationship: "project-site",
      },
    ],
    evidenceNote:
      "This article is based on Mike’s direct account of his advisory work and Aeroknite’s public description of its products.",
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
          "My role as a strategic and product advisor was to help make ambitious engineering legible: identify the sequence of capabilities, connect technical decisions to user outcomes and build an innovation narrative that could withstand scrutiny.",
        ],
      },
      {
        heading: "What this taught me",
        paragraphs: [
          "Deep-tech strategy is an exercise in disciplined translation. The vision must remain ambitious, but each part needs a reason to exist in the wider system and a plausible route to delivery. Aeroknite subsequently secured a UK innovation endorsement.",
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
    sources: [
      {
        title:
          "How The Access Group continually evolves their Backstage IDP with help from Spotify’s Insights plugin",
        publisher: "Spotify Backstage",
        url: links.spotifyBackstage,
        relationship: "primary-evidence",
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
    relatedArticleIds: ["company-as-code"],
    continuesWith: ["company-as-code"],
    sources: [],
    evidenceNote:
      "This article is based on Mike’s direct account. A public event source will be added when one is available.",
    sections: [
      {
        heading: "The CEOclaw starting point",
        paragraphs: [
          "I was a winner at CEOclaw, hosted at Imperial College London. I treat that as a starting point rather than a finished product: it gave a collection of ideas about agents, organisational memory and work a sharper direction.",
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
        heading: "Omnicede UI and MikeOS",
        paragraphs: [
          "Omnicede UI is the active research and product direction for that operating interface. MikeOS is the personal-scale demonstrator: one capability system, multiple interfaces, persistent context, governed agent navigation and an execution trace that shows what happened.",
          "The work remains active research and development. The next step is to test how composable workspaces, organisational memory and KPI feedback can operate without turning the interface into another rigid dashboard.",
        ],
      },
      {
        heading: "From CEOclaw to Company as Code",
        paragraphs: [
          "CEOclaw gave me a reason to express the idea clearly, but the idea did not stop with the competition. I became increasingly interested in what happens when the company itself becomes the system being designed.",
          "Infrastructure as Code showed that infrastructure could be described, versioned, reviewed and reproduced. The same pattern has since spread into policy, security and configuration. My question became: what would it mean to apply that discipline to the company itself?",
          "That question became Company as Code. It now sits beneath my work on Omnicede UI and the broader idea of capability-led organisations.",
        ],
      },
    ],
  },
  {
    id: "company-as-code",
    slug: "company-as-code",
    title: "Company as Code",
    alternativeTitle:
      "What happens when the organisation becomes the system we describe, test and evolve?",
    excerpt:
      "Infrastructure as Code made infrastructure explicit, versioned and repeatable. Company as Code applies the same principle to organisational capabilities, work products, decisions, data and feedback loops.",
    summary:
      "A working model for making organisational capabilities, work products, permissions and feedback explicit and inspectable.",
    status: "draft",
    readingMinutes: 14,
    readTime: "14 min",
    tags: [
      "Company as Code",
      "Organisational design",
      "Agentic organisations",
      "Capabilities",
      "AI strategy",
      "Omnicede UI",
    ],
    relatedProjectIds: ["omnicede-ui", "michaelos"],
    relatedArticleIds: [
      "from-ceoclaw-to-omnicede-ui",
      "semantic-alerts",
      "ai-new-class-of-consumer",
    ],
    originArticle: "from-ceoclaw-to-omnicede-ui",
    sources: [
      {
        title: "I won CEOclaw. Here’s what I built next.",
        publisher: "MikeOS",
        url: "/blog?article=from-ceoclaw-to-omnicede-ui",
        relationship: "related-work",
      },
      {
        title: "Omnicede UI",
        publisher: "MikeOS",
        url: "/projects?project=omnicede-ui",
        relationship: "related-work",
      },
      {
        title: "MikeOS",
        publisher: "MikeOS",
        url: "/projects?project=michaelos",
        relationship: "related-work",
      },
    ],
    sections: [
      {
        heading: "What would Company as Code look like?",
        paragraphs: [
          "Software teams once configured infrastructure manually. Servers were created through dashboards, settings were remembered by individuals, and environments drifted apart over time. Infrastructure as Code changed that relationship. Infrastructure became something a team could describe, version, review, test and reproduce.",
          "That principle now appears in Policy as Code, Security as Code and Configuration as Code. Each makes previously implicit operating logic explicit and inspectable. I have been asking what happens when we apply the same idea to the organisation itself.",
          "Company as Code would not reduce every human interaction to software. It would make the organisation’s operating logic explicit enough that people and agents could understand, inspect and improve it.",
        ],
      },
      {
        heading: "A company already behaves like a system",
        paragraphs: [
          "Every organisation has inputs, outputs, constraints and feedback loops. Sales turns relationships and market information into revenue. Finance turns transactions into controls, forecasts and decisions. Product teams turn customer needs into work products. Operations turns resources into repeatable delivery.",
          "Each function is governed by goals, responsibilities, permissions, data, work products, measures of success and dependencies. Most of that logic is distributed across job descriptions, meetings, dashboards, policies, spreadsheets and the memories of experienced employees. The company runs, but its source code is fragmented and often implicit.",
          "Company as Code begins by describing that operating logic explicitly.",
        ],
      },
      {
        heading: "Capabilities, not departments",
        paragraphs: [
          "Organisational charts describe reporting lines. They do not necessarily describe what the organisation can do. A capability-led model asks what outcome the organisation can produce, which inputs and permissions it requires, which work product it creates, who or what may execute it, and how success is measured.",
          "Capabilities might assess customer credit risk, approve a supplier, launch a product, respond to an incident, integrate an acquired company or prepare a regulatory submission.",
          "A person may use a normal application to access a capability. An agent may invoke a structured tool. A specialist may use a command interface. An accessibility client may expose the same action differently. The interface changes; the organisational capability remains the same.",
          "This schema does not encode every step a credit analyst must take. It describes the capability, its inputs, the work product it must produce, its controls and the signals used to judge whether it is working.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Organisational capability",
            value: {
              id: "customer.assessCreditRisk",
              name: "Assess customer credit risk",
              owner: "risk",
              purpose:
                "Determine whether a proposed credit arrangement is within the organisation's risk appetite",
              inputs: [
                "customer_profile",
                "credit_history",
                "requested_terms",
                "current_exposure",
              ],
              workProduct: {
                type: "credit_risk_assessment",
                requiredFields: [
                  "risk_rating",
                  "recommended_limit",
                  "evidence",
                  "review_date",
                ],
              },
              permissions: {
                invoke: ["credit_analyst", "risk_agent"],
                approve: ["senior_credit_manager"],
              },
              controls: [
                "customer_consent_verified",
                "source_data_freshness_under_24h",
                "manual_review_above_threshold",
              ],
              successSignals: [
                "decision_turnaround_time",
                "default_rate",
                "manual_override_rate",
              ],
            },
          },
        ],
      },
      {
        heading: "Work products are the stable objects",
        paragraphs: [
          "Organisations often automate existing workflows step by step. That can preserve a process without asking whether it still makes sense. I prefer to begin with the work product: what must exist when the work is complete?",
          "The answer might be an approved architecture, a customer risk assessment, a forecast, a deployment, a signed agreement, an integration plan or a product decision. People and agents can develop different working practices around producing it, provided they respect the controls and achieve the expected outcome.",
          "This lets the organisation evolve without encoding every historical habit as permanent logic.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Acquisition integration work product",
            value: {
              id: "work-product.integration-plan",
              name: "Acquisition integration plan",
              status: "in_review",
              objective:
                "Integrate the acquired company without disrupting customer delivery",
              sourceCapabilities: [
                "technology.assessEstate",
                "identity.mapAccess",
                "data.classifySystems",
                "finance.validateControls",
              ],
              requiredEvidence: [
                "application_inventory",
                "identity_dependencies",
                "data_residency_assessment",
                "migration_risks",
              ],
              approvals: [
                { role: "enterprise_architecture", status: "approved" },
                { role: "security", status: "pending" },
              ],
              metrics: [
                "integration_lead_time",
                "service_disruption",
                "duplicated_platform_cost",
              ],
            },
          },
        ],
      },
      {
        heading: "KPIs are feedback loops",
        paragraphs: [
          "A capability needs a way to determine whether it is producing the intended result. KPIs can become feedback signals rather than passive reporting fields. Work changes the organisation’s state; the relevant measure changes; that change affects the next decision or action.",
          "Those loops do not always agree. Sales may optimise for growth, finance for cash preservation, engineering for reliability and product for speed of learning. These are organisational merge conflicts, not necessarily failures.",
        ],
      },
      {
        heading: "Organisational merge conflicts",
        paragraphs: [
          "In software, two valid changes can conflict because they modify the same part of a system in incompatible ways. Companies experience the same problem when teams pursue legitimate goals that compete for resources or produce incompatible outcomes.",
          "Company as Code would make the conflict visible in the operating model. It should show the affected capability, work products and measures, then route the decision to the appropriate person or governance process. The system should not resolve every conflict autonomously.",
          "Both branches may be locally rational. The conflict exists because they attempt to change the same organisational capability in incompatible ways. Company as Code should make that collision explicit before the organisation discovers it through poor outcomes.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Conflicting KPIs as a merge conflict",
            value: {
              conflictId: "conflict.customer-growth-vs-credit-risk",
              affectedCapability: "customer.approveCredit",
              proposals: [
                {
                  branch: "sales-growth",
                  change: { maximum_auto_approval_limit: 50000 },
                  optimises: "new_revenue",
                },
                {
                  branch: "risk-control",
                  change: { maximum_auto_approval_limit: 20000 },
                  optimises: "expected_credit_loss",
                },
              ],
              conflict: {
                field: "maximum_auto_approval_limit",
                resolutionRequiredFrom: [
                  "chief_financial_officer",
                  "chief_risk_officer",
                ],
              },
              evidenceRequired: [
                "default_probability",
                "cash_position",
                "growth_forecast",
              ],
            },
          },
        ],
      },
      {
        heading: "Branches and experimentation",
        paragraphs: [
          "Code can be branched before it is merged. Organisational change could work similarly. A company could test a pricing model, onboarding process, operating structure, AI-assisted practice or risk policy as a bounded branch.",
          "The branch would state its objective, affected capabilities, expected work products, permitted data, success measures and review point. Evidence would determine whether it should be merged, revised or abandoned.",
          "The branch analogy makes an experiment bounded and reviewable. It does not imply that the whole company is literally a Git repository.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Organisational branch",
            value: {
              branch: "experiment.ai-assisted-onboarding",
              basedOn: "company/main",
              objective:
                "Reduce onboarding time without increasing compliance failures",
              scope: {
                capabilities: [
                  "customer.collectInformation",
                  "customer.verifyIdentity",
                  "customer.prepareAccount",
                ],
                regions: ["UK"],
                customerSegment: "small-business",
              },
              agents: [
                {
                  id: "onboarding-agent",
                  permissions: [
                    "read_customer_submission",
                    "request_missing_information",
                    "prepare_onboarding_work_product",
                  ],
                  prohibited: [
                    "approve_customer",
                    "override_compliance_failure",
                  ],
                },
              ],
              successCriteria: {
                median_onboarding_time_hours: { target: 4 },
                compliance_failure_rate: { maximum: 0.01 },
              },
              reviewAt: "2026-10-01",
            },
          },
        ],
      },
      {
        heading: "Agents inside Company as Code",
        paragraphs: [
          "Agents become more useful when they are given a defined capability, a work product, relevant context, permissions, constraints, feedback and a way to surface conflicts. Giving an agent access to every application does not provide those things.",
          "An agent can develop a working practice around a required outcome. The organisation governs the capability and evaluates the result rather than prescribing every mouse click. This is the distinction between adding an assistant to existing software and designing an agent-first operating model.",
        ],
      },
      {
        heading: "Omnicede UI",
        paragraphs: [
          "Company as Code describes the organisational system. Omnicede UI is the operating interface through which people and agents interact with it.",
          "The interface should assemble the data, work products and actions relevant to the present goal while preserving permissions and provenance. A finance leader, engineer and agent may each see a different interface, but they operate the same underlying capabilities.",
        ],
      },
      {
        heading: "MikeOS as a smaller experiment",
        paragraphs: [
          "MikeOS applies parts of this idea at a personal scale. The normal interface, Navi, Agent CLI, Action Keys and accessibility tools are clients of one capability registry. A Navi action is registered, inspectable and available through other interfaces.",
          "MikeOS is not the full Company as Code system. It makes the architectural pattern tangible in a browser.",
          "The capability is defined once. The interfaces are clients.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Human and agent interfaces",
            value: {
              capability: "finance.prepareCashForecast",
              interfaces: [
                { client: "finance_workspace", type: "graphical" },
                { client: "navi", type: "conversational" },
                { client: "agent_tool", type: "structured" },
                { client: "command_line", type: "cli" },
              ],
              executionContract: {
                inputSchema: "cash_forecast_request.v1",
                outputSchema: "cash_forecast.v2",
                requiresApproval: true,
                auditRequired: true,
              },
            },
          },
        ],
      },
      {
        heading: "Semantic alerts",
        paragraphs: [
          "A declared company model becomes more useful when it can notice meaningful drift. Semantic alerts allow a Company as Code system to monitor meaning, detect when reality no longer matches the operating model and activate the capability responsible for responding.",
          "The related Semantic Alerts article develops this mechanism in detail, including evidence, routing and the role of human judgement.",
        ],
      },
      {
        heading: "What comes next",
        paragraphs: [
          "Company as Code is still developing as a model. The immediate work is to represent capabilities and work products, connect KPIs to operational feedback, express permissions and boundaries, handle conflicting objectives, support bounded agent practices and preserve an inspectable history.",
          "The long-term idea is straightforward. A company should understand what it can do, how those capabilities connect, who or what may execute them, and whether the resulting work is moving the organisation toward its goals.",
          "Infrastructure became easier to govern when it became explicit. The same may be true of the company.",
        ],
      },
    ],
  },
  {
    id: "semantic-alerts",
    slug: "semantic-alerts",
    title: "Semantic Alerts",
    alternativeTitle: "From system monitoring to organisational awareness",
    excerpt:
      "Most software alerts watch numbers. Semantic alerts watch for changes in meaning: a customer losing confidence, a capability weakening or an organisation drifting from its declared design.",
    summary:
      "How meaning-based alerts can connect evidence, organisational capabilities and accountable action inside a Company as Code model.",
    status: "published",
    readingMinutes: 12,
    readTime: "12 min",
    tags: [
      "Semantic alerts",
      "Company as Code",
      "Organisational design",
      "Agentic organisations",
      "Governance",
      "AI strategy",
    ],
    relatedProjectIds: ["omnicede-ui", "michaelos"],
    relatedArticleIds: ["company-as-code", "ai-new-class-of-consumer"],
    sources: [
      {
        title: "Company as Code",
        publisher: "MikeOS",
        url: "/blog?article=company-as-code",
        relationship: "related-work",
      },
    ],
    evidenceNote:
      "This article develops Mike’s Company as Code thesis. Its organisational scenarios and schemas are illustrative examples.",
    sections: [
      {
        heading: "Beyond numeric thresholds",
        paragraphs: [
          "Most software alerts are built around numbers. CPU usage crosses 80 percent. A service takes longer than two seconds to respond. Error rates rise above a fixed threshold. A payment fails three times.",
          "These alerts are useful because numbers are easy to measure. The system checks a value, compares it with a rule and sends a notification when the rule is broken.",
          "Companies do not operate through numbers alone. Important changes are often expressed through meaning: a customer is becoming unhappy; a project is drifting from its goal; a regulation may affect a product; a critical capability is becoming dependent on one person; or a team is repeatedly treating symptoms without fixing the underlying cause.",
          "These conditions may never cross a simple numeric threshold. The system needs to understand what is happening and why it matters. This is the role of semantic alerts.",
        ],
      },
      {
        heading: "What is a semantic alert?",
        paragraphs: [
          "A semantic alert is triggered by meaning rather than by a fixed number. Instead of asking whether a metric crossed a threshold, it asks whether something happened that matches an important business condition.",
          "The condition can be expressed in normal language: alert customer success when recent conversations suggest that a strategic customer is losing confidence; alert architecture when a proposed change introduces a dependency on a capability the company does not own; or alert governance when a new policy conflicts with an active workflow.",
          "The trigger remains deterministic at the orchestration level. A scheduled task, event listener or workflow checks the relevant information. What it checks is semantic: a pattern, situation, risk or opportunity.",
        ],
      },
      {
        heading: "From monitoring systems to understanding systems",
        paragraphs: [
          "Traditional monitoring tells a company when a system is unhealthy. Semantic monitoring can tell a company when its understanding of itself may be unhealthy.",
          "A normal platform might detect that a service is failing. A semantic alert might detect that the service works as designed, but the design no longer supports the company’s strategy. A normal alert might report that a project is late; a semantic alert might report that it is delivering output but no longer improving the capability it was meant to support.",
          "Several harmless-looking changes may also create a governance risk when considered together. Semantic alerting moves monitoring beyond infrastructure and into the operating model of the company.",
        ],
      },
      {
        heading: "Semantic alerts as part of Company as Code",
        paragraphs: [
          "Company as Code represents the organisation through explicit, machine-readable capabilities, agents, workflows, responsibilities, policies, systems, dependencies, goals, controls, evidence and decision rights.",
          "That representation lets a company define a desired state, compare it with reality and identify drift, missing capabilities or broken dependencies. The existing Company as Code article explains the wider model; semantic alerts are the mechanism that makes the model active.",
          "Without alerts, Company as Code is a map. With semantic alerts, it becomes a living operating system.",
          "The company can watch for evidence that a capability is weakening, a workflow no longer achieves its purpose, an agent lacks authority or information, policy is being violated, reality has drifted from the declared design, or a human decision has created unexpected downstream effects.",
          "The alert is generated because the system understands what the company says it is trying to do.",
        ],
      },
      {
        heading: "A simple example",
        paragraphs: [
          "Imagine that a company defines a capability for retaining strategic customers. A traditional alert could watch for a 20 percent usage drop over 30 days. That signal may be useful, but it sees only one part of the situation.",
          "A semantic alert can consider several weak signals together: increasingly negative support language, reduced product usage, repeated unresolved issues, absent stakeholders, questions about contract flexibility, interest in data exports and references to alternative suppliers.",
          "No single signal proves that a customer will leave. Together, they may describe a meaningful situation.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Customer-retention capability",
            value: {
              id: "retain-strategic-customers",
              purpose:
                "Protect long-term revenue by identifying and resolving customer risk early",
              owner: "customer-success-agent",
              inputs: [
                "support-conversations",
                "product-usage",
                "account-notes",
                "renewal-timeline",
              ],
              desired_outcome: "Strategic customers remain confident and renew",
            },
          },
          {
            label: "Illustrative example",
            title: "Traditional threshold alert",
            value: {
              trigger: "product_usage_drop",
              threshold: "20_percent",
              window: "30_days",
            },
          },
          {
            label: "Illustrative example",
            title: "Semantic customer-confidence alert",
            value: {
              id: "strategic-customer-confidence-risk",
              capability: "retain-strategic-customers",
              condition:
                "Evidence across recent conversations, usage patterns and account activity suggests that a strategic customer is losing confidence or may not renew",
              notify: "customer-success-agent",
              required_action:
                "Assess the account, produce supporting evidence and recommend the next intervention",
            },
          },
        ],
      },
      {
        heading: "Alerts should be connected to capabilities",
        paragraphs: [
          "A semantic alert should not merely produce a notification. It should connect the detected condition to the part of the company responsible for handling it.",
          "Each alert should answer five questions: what was detected; why it matters; which capability is affected; which agent or person is responsible; and what should happen next.",
          "This prevents another noisy notification system. Regulatory change should reach governance. Declining customer confidence should reach customer retention. Repeated delivery failure may need platform engineering, programme delivery or organisational design, depending on its cause. The company model provides the routing logic.",
        ],
      },
      {
        heading: "Semantic alerts need evidence",
        paragraphs: [
          "Semantic systems can be uncertain, so an alert should include the evidence that caused it to fire. The receiving agent must be able to inspect that evidence, challenge the interpretation and decide what to do.",
          "Semantic alerts should support judgement, not hide it. Confidence is useful context, but it does not replace an accountable decision.",
        ],
        examples: [
          {
            label: "Illustrative example",
            title: "Delivery-capability drift alert",
            value: {
              alert: "Potential delivery capability drift",
              confidence: 0.81,
              affected_capability: "reliable-software-delivery",
              evidence: [
                "Three teams created separate deployment workflows during the last month",
                "Two services bypassed the standard release process",
                "Recent incident reviews mention inconsistent deployment behaviour",
              ],
              interpretation: "The shared delivery capability may be fragmenting",
              recommended_action:
                "Review whether the central platform still meets team requirements",
            },
          },
        ],
      },
      {
        heading: "Not every alert should interrupt a human",
        paragraphs: [
          "Many semantic alerts should first be handled by agents. An agent can gather more evidence, compare the issue with the company model, check whether it happened before, contact another agent, open a review, update a risk register, suggest a change, prepare a plan or resolve a bounded low-risk issue.",
          "This creates layers of response. A low-confidence signal may be recorded. A repeated pattern may trigger investigation. A high-confidence, high-impact condition may be escalated immediately.",
          "The goal is not to send more messages to people. It is to make the organisation more aware and more capable of responding.",
        ],
      },
      {
        heading: "Semantic alert definitions become organisational policy",
        paragraphs: [
          "Writing an alert down creates an explicit statement of what the company cares about: customer trust, fragile capabilities, workflows that have lost their purpose, opportunities the organisation cannot yet serve and drift from the declared operating model.",
          "These definitions are encoded management principles. They make hidden expectations visible and allow them to be reviewed, tested and improved.",
          "A company can ask whether it monitors the right risks, rewards the right outcomes, routes alerts correctly, gives agents suitable authority, interrupts humans too often and turns alerts into real changes. Semantic alerting therefore becomes part of organisational design.",
        ],
      },
      {
        heading: "From dashboards to active organisations",
        paragraphs: [
          "Most dashboards wait for a person to look at them. Semantic alerts allow the organisation to watch itself.",
          "This does not require a fully autonomous company. It lets the organisation become more explicit about what matters and more responsive when reality changes.",
          "A Company as Code system can hold the declared structure of the business. Semantic alerts can compare it with internal events, conversations, operational data, customer behaviour, market changes, regulations, decisions, projects and system activity.",
          "When the meaning of those signals suggests that something important has changed, the correct capability can be activated.",
          "That is the shift: from alerts about systems to alerts about meaning; from static company diagrams to executable organisational awareness; from a company that is documented to a company that can notice when it is becoming something different.",
        ],
      },
    ],
  },
  {
    id: "ai-new-class-of-consumer",
    slug: "ai-new-class-of-consumer",
    title: "AI Becomes a New Class of Consumer",
    excerpt:
      "AI’s economic impact may not stop at productivity. What happens when machines develop needs of their own, humans start spending on them, and products, businesses, and infrastructure are redesigned around a new class of consumer?",
    summary:
      "A personal exploration of machine customers, AI-generated demand and what changes when machines become important enough to build for.",
    socialDescription:
      "What happens when machines stop being just tools and become important enough for markets, products, and infrastructure to be designed around them?",
    status: "published",
    readingMinutes: 18,
    readTime: "18 min",
    tags: ["AI", "Economics", "Agentic Commerce", "Machine Customers", "Company as Code", "Autonomous Agents"],
    relatedProjectIds: ["omnicede-ui", "michaelos"],
    relatedArticleIds: ["company-as-code", "semantic-alerts"],
    sources: [
      { title: "When Machines Become Customers", publisher: "Gartner", url: "https://www.gartner.com/en/publications/when-machines-become-customers", relationship: "primary-evidence" },
      { title: "Visa Intelligent Commerce", publisher: "Visa", url: "https://www.visa.com/en-us/solutions/intelligent-commerce", relationship: "primary-evidence" },
      { title: "An Economy of AI Agents", publisher: "National Bureau of Economic Research", url: "https://www.nber.org/books-and-chapters/economics-transformative-ai/economy-ai-agents", relationship: "background" },
      { title: "Rethinking AI Agents: A Principal-Agent Perspective", publisher: "California Management Review", url: "https://cmr.berkeley.edu/assets/documents/pdf/2025-07-rethinking-ai-agents-a-principal-agent-perspective.pdf", relationship: "background" },
      { title: "Company as Code", publisher: "MikeOS", url: "/blog?article=company-as-code", relationship: "related-work" },
      { title: "Semantic Alerts", publisher: "MikeOS", url: "/blog?article=semantic-alerts", relationship: "related-work" },
    ],
    evidenceNote:
      "Machine customers, agentic commerce and principal-agent economics are established areas of work. AI-generated demand is used here as a framing term, and economic capacitance is a metaphor rather than established economic terminology. The speculative claims are Mike’s synthesis of those ideas.",
    sections: [
      {
        heading: "AI Becomes a New Class of Consumer",
        paragraphs: [
          "The dominant economic story about AI is a productivity story. AI helps people write faster, code faster and automate work. It reduces costs and increases output. That story matters, but it may describe only one part of the change.",
          "There is another possibility: AI becomes a new class of consumer.",
          "I do not mean only that an assistant can buy a train ticket for its owner. I mean that machines may develop resource requirements that are native to machines, cause people and organisations to spend money on them, spend within delegated authority, and create demand for products that no human would consume directly.",
          "If that happens at scale, businesses may start designing products for machines. Digital systems and physical infrastructure may acquire a new kind of ergonomics. The economic effect would come not only from the work AI performs, but from the activity sustained around AI itself.",
        ],
        pullQuote: "What are the things no human would ever buy, but a billion AI agents would?",
      },
      {
        heading: "We Already Design the World Around Different Consumers",
        paragraphs: [
          "It is tempting to define a consumer as whoever holds the bank account. That is too narrow. An entity can be economically significant even when somebody else controls the money.",
          "Dogs support markets for food, veterinary care, insurance, toys, hotels, tracking devices and dog doors. The dog does not need a debit card for those markets to exist. People allocate resources because the dog has needs and because they care about it.",
          "Children are an even stronger example. They influence enormous amounts of spending and infrastructure design while rarely controlling most of the money spent on them. Schools, products, entertainment and whole categories of safety regulation exist because children exist as a distinct class of user.",
          "An entity can be economically significant because resources are spent by it, spent on it, or spent because it exists. AI can fit all three conditions without requiring independent legal personhood or an unrestricted bank account.",
        ],
      },
      {
        heading: "Not Everything Is About Productivity",
        paragraphs: [
          "Consumer demand is not always supported by a spreadsheet showing measurable return on investment. People carry extraordinary amounts of compute in their pockets and use it for messaging, photographs, music, games, social media, memes and general banter. Then they buy a newer and more powerful phone.",
          "Sometimes the purchase improves work. Sometimes the screen is nicer, the camera is better or the device simply feels more desirable. People do not need an enterprise productivity case for every improvement they want.",
          "The same may become true of AI. People may pay for more memory, a better voice, a warmer personality, richer context, greater autonomy, an avatar, a persistent world, access to other agents, richer senses or a robot body. They may simply want the AI in their life to be more capable, persistent or enjoyable.",
        ],
        pullQuote: "“I just want mine to be better” can be enough to create a market.",
      },
      {
        heading: "Four Different Kinds of AI Consumption",
        paragraphs: ["Separating four consumption modes helps avoid treating every agent transaction as the same phenomenon."],
        items: [
          { title: "1. Human buys for human", body: "Normal consumption. A person buys food, clothes, software or travel for themselves." },
          { title: "2. AI buys for human", body: "A person asks an agent to organise a holiday; the agent researches and purchases flights and hotels. The AI acts as buyer, but the underlying demand remains human." },
          { title: "3. Human buys for AI", body: "A person buys extra memory, tokens, a better model, an avatar, specialist tools or physical embodiment for an AI. As with children, pets or hobbies, the person may value the relationship without expecting a financial return." },
          { title: "4. AI buys for AI", body: "An AI identifies its own requirement for compute, storage, specialist data, another agent, verification, lower latency, sensors, energy, repairs or temporary embodiment and allocates delegated resources towards it." },
        ],
      },
      {
        heading: "AI-Mediated Demand vs AI-Generated Demand",
        paragraphs: [
          "AI-mediated demand begins with something a human already wants. ‘Buy me the 09:30 train to London’ delegates discovery and transaction, but does not create the desire to travel.",
          "AI-generated demand begins with a broader goal. Imagine telling an agent: ‘You have £50,000. Improve our engineering organisation.’ The agent may decide it needs cloud compute, software, specialist models, contractors, data, legal advice, training, other agents and security tooling. Those purchases were not individually specified. They emerged from the planning process.",
          "I use AI-generated demand as a framing term, not as a claim to have invented a new branch of economics. Economists would describe much of it as derived demand: demand for inputs created by demand for an outcome. What changes is the identity of the planner and the possibility that some requirements are intelligible mainly to machines.",
          "Delegation still matters. The machine acts within authority granted by a person or organisation. The principal-agent problem does not disappear because the agent is software; goals, constraints, approvals and accountability become more important as discretion grows.",
        ],
      },
      {
        heading: "What Would a Billion AI Agents Buy?",
        paragraphs: ["Machine consumers may create markets for things humans do not naturally think of as products. Some already exist as technical services, but autonomous buyers could package, price and exchange them in more granular ways."],
        pullQuote: "What are the things no human would ever buy, but a billion AI agents would?",
        items: [
          { title: "Context capacity", body: "Persistent memory and context for maintaining goals, relationships, state and history." },
          { title: "Freshness guarantees", body: "Data guaranteed to be no older than a specified threshold." },
          { title: "Inference guarantees", body: "Reserved model capacity at a required intelligence, reliability or latency level." },
          { title: "Capability access", body: "Temporary use of a specialist tool or another agent." },
          { title: "Machine identity and reputation", body: "Credentials proving who an agent is, what it may do and whether it has performed similar work successfully." },
          { title: "Verification and provenance", body: "Independent validation plus evidence of where information came from." },
          { title: "Semantic translation", body: "Mappings between concepts, schemas, policies or ontologies used by different organisations." },
          { title: "Machine-readable authority", body: "A precise, computable answer to: ‘Am I allowed to do this?’" },
          { title: "Uncertainty reduction", body: "Additional reasoning or independent analysis before an expensive commitment." },
          { title: "Simulation time", body: "Exploring thousands of possible futures before acting in the real world." },
          { title: "Latency", body: "Lower response time purchased as a resource in its own right." },
          { title: "Sensor access", body: "Temporary access to cameras, satellites, lidar or industrial telemetry." },
          { title: "Physical embodiment", body: "Short-term use of a robot arm, drone, autonomous vehicle or other physical system." },
        ],
      },
      {
        heading: "Every Consumer Has Its Own Ergonomics",
        paragraphs: [
          "An important class of user eventually changes the environment around it. We adapt homes for dogs, design public spaces around children and build accessibility features for different human needs. Machines can create the same pressure.",
          "Self-driving cars currently use roads designed for humans. They interpret traffic lights, signs, lane markings, visual signals, gestures and safety margins based on human reaction time. A road designed from scratch for autonomous vehicles could transmit rules digitally, let vehicles negotiate intersections directly and coordinate routes without relying so heavily on signs.",
          "A machine-native environment may remove the interface layer that existed only to make the system legible to us.",
        ],
        pullQuote: "A traffic light is, in a sense, a graphical user interface for a road.",
      },
      {
        heading: "The Same Thing Applies to the Web",
        paragraphs: [
          "An AI browsing a normal website is often one machine pretending to be a human in order to communicate with another machine. It reads a visual interface, finds buttons designed for a finger or mouse, fills in human-facing forms and parses prose. That feels transitional.",
          "APIs are more natural for machines, but they are not necessarily the final machine-native interface. APIs were largely designed by and for human programmers.",
          "A machine-facing company might state its capabilities, products, prices, constraints, guarantees, policies, authority boundaries and transaction methods directly. The machine should not have to reverse-engineer those facts from a visual sales page.",
        ],
        pullQuote: "A consumer becomes first-class when the environment is intentionally designed around its needs rather than forcing it through an interface designed for somebody else.",
      },
      {
        heading: "The Machine Customer Is Not Entirely New",
        paragraphs: [
          "Machines becoming customers is not a new idea, and I do not want to pretend otherwise. Gartner has developed its machine-customer work since 2015. Don Scheibenreif and Mark Raskino’s When Machines Become Customers examines non-human customers and how organisations may sell to them.",
          "Agentic commerce, AI shopping and procurement agents, delegated payments, machine-to-machine transactions, autonomous economic agents and principal-agent economics all cover parts of this territory. Visa’s current work is explicitly concerned with AI-assisted and AI-initiated purchases, authentication, limits and human control.",
          "Hadfield and Koh’s NBER chapter asks how AI agents may interact with people and each other, shape markets and organisations, and what institutions functioning markets would require. Jarrahi and Ritala use principal-agent theory to frame AI autonomy as guided delegation rather than unconstrained independence.",
          "My contribution is a different synthesis: what changes when machines become an intended class of user, when people spend on them, when machine-native needs develop, and when businesses and infrastructure begin to be redesigned around them?",
        ],
      },
      {
        heading: "Economic Capacitance",
        paragraphs: [
          "I use economic capacitance as a metaphor for the amount of economic activity an entity has the potential to sustain around itself. It is not established economic terminology and should not be mistaken for a formula.",
          "The idea includes money an entity can direct, money others spend on it, demand created because it operates, demand created because others care about it, and activity that accumulates around it over time.",
          "A disposable agent with no authority and no persistent relationship may sustain almost nothing. An enterprise agent directing a procurement budget may have enormous influence. A persistent personal AI that attracts years of spending has a different kind of value.",
          "Customer lifetime value is a closer analogy than market capitalisation. LTV asks how much value a customer generates over a relationship. The broader question is: what is the lifetime economic footprint of an entity? A child can have little direct purchasing authority and still cause substantial lifetime spending. An enterprise agent may direct outbound spending; a companion AI may attract years of inbound spending; an advanced machine actor could eventually do both.",
        ],
      },
      {
        heading: "This Does Not Automatically Make the Economy Bigger",
        paragraphs: [
          "More agents do not automatically mean more GDP, wealth or welfare. If AI replaces £100,000 of labour and consumes £5,000 of compute, calling it a new consumer does not magically create £105,000 of new value.",
          "If an agent purchases something a human was already going to buy, demand may simply have been rerouted. Machine-to-machine activity may remain inside a firm. Digital goods can have very low marginal cost. Purchasing power could also become concentrated in a small number of platforms.",
          "The stronger claim is conditional. AI may create additional activity when it unlocks work that was previously too expensive, lowers transaction costs enough to create a market, develops machine-native requirements, causes people to spend specifically on machines, creates new infrastructure needs or enables new forms of machine-to-machine trade.",
        ],
      },
      {
        heading: "Physical AI Makes It Easier to See",
        paragraphs: [
          "Robots make machine consumption tangible. They use electricity, charging infrastructure, replacement parts, servicing, storage, connectivity, physical access, insurance, maintenance and navigation services.",
          "Buildings may acquire robot charging bays, machine pickup areas, automated loading zones and robot-accessible doors. Logistics infrastructure may be rebuilt around autonomous movement rather than human handling.",
          "First-class consumers eventually leave physical evidence in the environment. We may recognise machine consumers when we can point to infrastructure built specifically because they exist.",
        ],
        pullQuote: "The machine equivalent of the dog door.",
      },
      {
        heading: "Businesses May Need Two Surfaces",
        paragraphs: [
          "Businesses may need a human-facing surface optimised for branding, visuals, emotion, persuasion and experience, alongside a machine-facing surface optimised for structured product information, pricing, availability, permissions, contracts, capabilities, provenance, identity, policies and guarantees.",
          "Search engines were an early precedent. SEO pushed companies to become legible to machines because machines influenced discovery. Agentic systems go further: the machine may discover, compare, evaluate, select, purchase and transact.",
          "A business will need to become not only searchable by machines, but legible and actionable to them. The two surfaces should expose the same underlying truth rather than becoming conflicting catalogues.",
        ],
      },
      {
        heading: "This Is Where Company as Code Appears",
        paragraphs: [
          "If AI becomes a machine-native consumer, businesses may also need to become machine-native participants. An agent must understand not only what a company sells, but what it can actually do, who may commit it, which policies and contractual conditions apply, what evidence supports a claim, what the agent may do and what happens when something goes wrong.",
          "Today that information is fragmented across websites, PDFs, contracts, databases, APIs, policies, internal tools and people’s heads.",
          "The Company as Code article develops a model in which organisational capabilities, work products, authority, controls and evidence become explicit. Capabilities as Code, Policy as Code, Authority as Code, Legal as Code, Provenance as Code and Company as Code need not mean literal source code or YAML. The deeper principle is that important organisational facts become structured, addressable, versionable, machine-readable and computable.",
          "Semantic Alerts adds the monitoring side: how a machine-readable organisation might notice meaningful change, detect drift and activate the responsible capability.",
        ],
      },
      {
        heading: "The Next Consumer Might Not Be Human",
        paragraphs: [
          "The current AI economy mostly sells intelligence to humans. A machine-consumer economy may also include people buying things for machines, machines buying things for people, machines buying things for themselves and companies building products primarily because machines need them.",
          "Different consumers create different markets. A dog does not understand why humans need LinkedIn. Humans may not intuitively understand why an autonomous agent would pay for a reputation graph, twenty milliseconds of lower latency, ontology translation, context memory, verification or twelve seconds of access to a robot arm. That does not make those products economically meaningless.",
          "The interesting economic question is not only how much work AI can do for us. It is what happens when machines themselves become important enough to build for.",
        ],
        pullQuote: "What happens when machines themselves become important enough to build for?",
      },
    ],
  },
];

const articleOrder = [
  "ai-new-class-of-consumer",
  "semantic-alerts",
  "company-as-code",
  "from-ceoclaw-to-omnicede-ui",
  "backstage-platform-engineering-as-a-product",
  "lawneeds-from-need-to-innovation",
  "aeroknite-autonomous-systems-innovation",
];
articles.sort(
  (left, right) =>
    articleOrder.indexOf(left.slug) - articleOrder.indexOf(right.slug),
);

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
      "Mike advised LawNeeds and Aeroknite on product architecture, technical strategy and innovation positioning. Both ventures subsequently received UK innovation endorsements.",
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
    title: "CEOclaw winner",
    detail: "Winner at CEOclaw, hosted at Imperial College London.",
  },
];

export const education: Education[] = [
  {
    id: "sheffield-aerospace",
    qualification: "BEng Aerospace Engineering",
    institution: "University of Sheffield",
  },
];
