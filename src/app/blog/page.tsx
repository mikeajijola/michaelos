"use client";
import { articles } from "@/data/content";
import { useSearchParams } from "next/navigation";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { useHighlight } from "@/highlight/context";
export default function Blog() {
  const { view, matches } = useHighlight();
  const query = useSearchParams();
  const selected = articles.find((article) => article.slug === query.get("article"));
  return (
    <div className="page-shell">
      <div className="page-head">
        <div className="eyebrow">Writing</div>
        <h1 className="page-title">Ideas tested through real work.</h1>
        <p>
          Notes on platform engineering, startup innovation, agentic
          organisations and the systems that help people work together.
        </p>
      </div>
      {selected && (
        <article className="detail-banner article-detail">
          <div className="eyebrow">
            {selected.status === "draft" ? "In development" : selected.publishedAt}
            {` · ${selected.readTime}`}
          </div>
          <h2>{selected.title}</h2>
          <p className="lead">{selected.excerpt}</p>
          {selected.externalSources?.map((source) => (
            <a
              className="text-link"
              href={source.url}
              key={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.label} ↗
            </a>
          ))}
          {selected.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
      )}
      <section className="editorial-section">
        <h2 className="section-title">Writing index</h2>
        <div className="writing-index">
          {articles.map((a) => (
            <div
              key={a.id}
              data-highlight-item
              data-highlight-match={
                view === "all"
                  ? undefined
                  : matches([a.title, a.summary, ...a.tags])
              }
            >
              <CapabilityButton
                className="article-control"
                buttonClassName="article"
                capabilityId="article.view"
                params={{ slug: a.slug }}
                label={`Open ${a.title}`}
              >
                <>
                  <div className="meta">
                    <span>{a.publishedAt ?? "In development"}</span>
                    <span>
                      {a.status === "draft" ? "Draft" : "Published"} · {a.readTime}
                    </span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.summary}</p>
                  <div className="tags">
                    {a.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              </CapabilityButton>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
