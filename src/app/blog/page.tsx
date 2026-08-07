"use client";
import { articles } from "@/data/content";
import { use } from "react";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { useHighlight } from "@/highlight/context";
export default function Blog({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const { view, matches } = useHighlight();
  const query = use(searchParams);
  const selected = articles.find((article) => article.slug === query.article);
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: selected.title,
                description: selected.socialDescription ?? selected.excerpt,
                author: {
                  "@type": "Person",
                  name: "Mike Ajijola",
                  url: "https://mikeajijola.com/",
                },
                mainEntityOfPage: `https://mikeajijola.com/blog?article=${selected.slug}`,
                keywords: selected.tags.join(", "),
              }).replace(/</g, "\\u003c"),
            }}
          />
          <div className="eyebrow">
            {selected.status === "draft"
              ? "In development"
              : (selected.publishedAt ?? "Published")}
            {` · ${selected.readTime}`}
          </div>
          <h2>{selected.title}</h2>
          {selected.alternativeTitle && (
            <p className="professional-headline">{selected.alternativeTitle}</p>
          )}
          <p className="lead">{selected.excerpt}</p>
          {selected.sources
            .filter((source) => source.relationship === "primary-evidence")
            .map((source) => (
              <a
                className="primary-evidence-link"
                href={source.url}
                key={source.url}
                target="_blank"
                rel="noreferrer"
              >
                Read {source.title} ↗
              </a>
            ))}
          {selected.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.pullQuote && (
                <blockquote className="article-pull-quote">
                  {section.pullQuote}
                </blockquote>
              )}
              {section.items?.length ? (
                <dl className="article-concept-list">
                  {section.items.map((item) => (
                    <div key={item.title}>
                      <dt>{item.title}</dt>
                      <dd>{item.body}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {section.examples?.map((example) => (
                <figure className="article-schema" key={example.title}>
                  <figcaption>
                    <span>{example.label}</span>
                    <strong>{example.title}</strong>
                  </figcaption>
                  <pre>
                    <code>{JSON.stringify(example.value, null, 2)}</code>
                  </pre>
                </figure>
              ))}
            </section>
          ))}
          {selected.relatedArticleIds?.length ? (
            <section>
              <h3>Continue reading</h3>
              <div className="actions">
                {selected.relatedArticleIds.map((slug) => {
                  const related = articles.find((article) => article.slug === slug);
                  return related ? (
                    <CapabilityButton
                      key={slug}
                      capabilityId="article.view"
                      params={{ slug }}
                      label={`Open ${related.title}`}
                      buttonClassName="secondary"
                    >
                      {related.title}
                    </CapabilityButton>
                  ) : null;
                })}
              </div>
            </section>
          ) : null}
          <section className="article-evidence">
            <h3>Evidence and references</h3>
            {selected.evidenceNote && <p>{selected.evidenceNote}</p>}
            {selected.sources.length ? (
              <ul>
                {selected.sources.map((source) => {
                  const external = /^https?:\/\//.test(source.url);
                  return (
                    <li key={`${source.relationship}:${source.url}`}>
                      <span>
                        {source.relationship === "primary-evidence"
                          ? "Primary evidence"
                          : source.relationship === "project-site"
                            ? "Project site"
                            : source.relationship === "background"
                              ? "Background"
                              : "Related work"}
                      </span>
                      <a
                        href={source.url}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {source.title}
                        {source.publisher ? ` — ${source.publisher}` : ""}
                        {external ? " ↗" : " →"}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
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
                    <span>
                      {a.publishedAt ??
                        (a.status === "published" ? "Published" : "In development")}
                    </span>
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
