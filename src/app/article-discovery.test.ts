import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { GET as rss } from "./rss.xml/route";

describe("article discovery", () => {
  it("includes the consumer essay in the sitemap", () => {
    expect(sitemap()).toContainEqual({
      url: "https://mikeajijola.com/blog?article=ai-new-class-of-consumer",
    });
  });

  it("includes published articles in RSS", async () => {
    const response = rss();
    const body = await response.text();
    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    expect(body).toContain("AI Becomes a New Class of Consumer");
    expect(body).toContain("ai-new-class-of-consumer");
    expect(body).not.toContain("Company as Code</title>");
  });
});
