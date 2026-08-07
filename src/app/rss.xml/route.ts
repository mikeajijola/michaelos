import { articles } from "@/data/content";

const SITE_URL = "https://mikeajijola.com";

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = articles
    .filter((article) => article.status === "published")
    .map((article) => {
      const url = `${SITE_URL}/blog?article=${article.slug}`;
      return `<item><title>${xml(article.title)}</title><link>${xml(url)}</link><guid>${xml(url)}</guid><description>${xml(article.excerpt)}</description></item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Mike Ajijola — Writing</title><link>${SITE_URL}/blog</link><description>Writing on enterprise architecture, AI strategy and capability-led systems.</description>${items}</channel></rss>`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
