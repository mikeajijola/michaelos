import { describe, expect, it } from "vitest";
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
      "uk-innovation-endorsements",
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

  it("keeps all four essays explicitly in development", () => {
    expect(articles).toHaveLength(4);
    expect(articles.every((article) => article.status === "draft")).toBe(true);
    expect(articles.every((article) => article.sections.length >= 4)).toBe(true);
  });

  it.each([
    ["Open the LawNeeds project", "uk-innovation-endorsements"],
    ["Show me Mike’s work with Aeroknite", "uk-innovation-endorsements"],
    ["Show me his platform-engineering work", "nexus-backstage"],
    ["Explain Omnicede UI", "omnicede-ui"],
    ["What is MichaelOS?", "michaelos"],
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
});
