import type { MetadataRoute } from "next";
import { articles, projects } from "@/data/content";

const SITE_URL = "https://mikeajijola.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects", "/experience", "/blog", "/capabilities"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects?project=${project.slug}`,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog?article=${article.slug}`,
    })),
  ];
}
