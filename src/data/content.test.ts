import { describe, expect, it, vi } from "vitest";
import { registry } from "@/capabilities/registry";
import {
  aliases,
  articles,
  experience,
  profile,
  projects,
  recognition,
} from "./content";
import type { CapabilityContext } from "@/capabilities/types";

const context = {} as CapabilityContext;

describe("real portfolio content", () => {
  it("contains no fictional public records and leads with approved work", () => {
    const publicData = JSON.stringify({ projects, experience, articles });
    for (const placeholder of [
      "Northstar Systems",
      "Common Thread",
      "Atlas Platform",
      "Signal Room",
      "Civic Data Kit",
    ])
      expect(publicData).not.toContain(placeholder);

    expect(projects.map((project) => project.slug)).toEqual([
      "lawneeds",
      "aeroknite",
      "nexus-backstage",
      "omnicede-ui",
      "michaelos",
    ]);
    expect(experience[0]).toMatchObject({
      organisation: "The Access Group",
      title: "Enterprise Solutions Architect",
    });
    expect(profile.headline).toContain("AI Strategy");
    expect(recognition[0].title).toContain("innovation endorsements");
  });

  it("publishes Semantic Alerts while keeping the existing essays in development", () => {
    expect(articles).toHaveLength(6);
    expect(articles.find((article) => article.slug === "semantic-alerts")?.status)
      .toBe("published");
    expect(
      articles
        .filter((article) => article.slug !== "semantic-alerts")
        .every((article) => article.status === "draft"),
    ).toBe(true);
    expect(articles.every((article) => article.sections.length >= 4)).toBe(true);
  });

  it("keeps editorial instructions out of canonical public content", () => {
    const publicData = JSON.stringify({
      profile,
      projects,
      experience,
      articles,
      recognition,
    });
    for (const draftingTerm of [
      "TODO",
      "TBC",
      "TBD",
      "pending verified",
      "approved account",
      "Mike to confirm",
      "Michael to confirm",
      "insert detail",
      "add source",
    ])
      expect(publicData.toLowerCase()).not.toContain(draftingTerm.toLowerCase());
  });

  it("gives every article a visible evidence basis", () => {
    expect(
      articles.every(
        (article) => article.sources.length > 0 || Boolean(article.evidenceNote),
      ),
    ).toBe(true);
    const nexus = articles.find(
      (article) =>
        article.slug === "backstage-platform-engineering-as-a-product",
    );
    expect(nexus?.sources).toContainEqual(
      expect.objectContaining({
        publisher: "Spotify Backstage",
        relationship: "primary-evidence",
      }),
    );
  });

  it("labels all five Company as Code schemas as illustrative", () => {
    const company = articles.find(
      (article) => article.slug === "company-as-code",
    );
    const examples = company?.sections.flatMap(
      (section) => section.examples ?? [],
    );
    expect(examples).toHaveLength(5);
    expect(examples?.every((example) => example.label === "Illustrative example"))
      .toBe(true);
  });

  it.each([
    ["Open the LawNeeds project", "lawneeds"],
    ["Show me Mike’s work with Aeroknite", "aeroknite"],
    ["Show me his platform-engineering work", "nexus-backstage"],
    ["Explain Omnicede UI", "omnicede-ui"],
    ["What is MikeOS?", "michaelos"],
  ])("grounds project search %s", async (query, expectedSlug) => {
    const result = (await registry
      .get("project.search")!
      .execute({ query }, context)) as { projects: typeof projects };
    expect(result.projects.map((project) => project.slug)).toContain(
      expectedSlug,
    );
  });

  it.each([
    ["Show me the article about CEOclaw", "from-ceoclaw-to-omnicede-ui"],
    ["Explain Company as Code", "company-as-code"],
    ["Explain semantic alerts", "semantic-alerts"],
    [
      "platform engineering Backstage",
      "backstage-platform-engineering-as-a-product",
    ],
  ])("grounds article search %s", async (query, expectedSlug) => {
    const result = (await registry
      .get("article.search")!
      .execute({ query }, context)) as { articles: typeof articles };
    expect(result.articles.map((article) => article.slug)).toContain(
      expectedSlug,
    );
  });

  it("keeps misspellings resolver-only", () => {
    expect(aliases.aeroknite).toContain("aeronite");
    expect(JSON.stringify({ projects, experience, articles })).not.toContain(
      "aeronite",
    );
  });

  it("links the CEOclaw origin story to Company as Code", () => {
    const origin = articles.find(
      (article) => article.slug === "from-ceoclaw-to-omnicede-ui",
    );
    const company = articles.find((article) => article.slug === "company-as-code");
    expect(origin?.continuesWith).toContain("company-as-code");
    expect(company?.originArticle).toBe("from-ceoclaw-to-omnicede-ui");
  });

  it("links Semantic Alerts and Company as Code in both directions", () => {
    const company = articles.find((article) => article.slug === "company-as-code");
    const semantic = articles.find((article) => article.slug === "semantic-alerts");
    expect(company?.relatedArticleIds).toContain("semantic-alerts");
    expect(semantic?.relatedArticleIds).toContain("company-as-code");
    expect(semantic?.sources).toContainEqual(
      expect.objectContaining({ url: "/blog?article=company-as-code" }),
    );
  });

  it("opens Semantic Alerts through the shared article capability", async () => {
    const navigate = vi.fn();
    const result = await registry.get("article.view")!.execute(
      { slug: "semantic-alerts" },
      { navigate } as unknown as CapabilityContext,
    );
    expect(navigate).toHaveBeenCalledWith("/blog?article=semantic-alerts");
    expect(result).toMatchObject({
      article: { slug: "semantic-alerts", title: "Semantic Alerts" },
      path: "/blog?article=semantic-alerts",
    });
  });
});
