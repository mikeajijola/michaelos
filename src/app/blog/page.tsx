"use client";
import { articles } from "@/data/content";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { useHighlight } from "@/highlight/context";
export default function Blog() {
  const { view, matches } = useHighlight();
  return (
    <div className="page-shell">
      <div className="page-head">
        <div className="eyebrow">Field notes</div>
        <h1 className="page-title">Thinking in public.</h1>
        <p>
          A publication index about platforms, local-first software, technical
          leadership and understandable systems.
        </p>
      </div>
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
                    <span>{a.publishedAt}</span>
                    <span>
                      {a.status} · {a.readTime}
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
