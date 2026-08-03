"use client";

import { experience } from "@/data/content";
import { useHighlight } from "@/highlight/context";

export default function Experience() {
  const { view, matches } = useHighlight();
  return (
    <div className="page-shell">
      <div className="page-head">
        <div className="eyebrow">Experience</div>
        <h1 className="page-title">Building leverage, not just software.</h1>
        <p>
          Technical leadership where architecture, platforms, product strategy
          and organisational change meet.
        </p>
      </div>
      <section className="editorial-section">
        <h2 className="section-title">Professional experience</h2>
        <div className="experience-index">
          {experience.map((item) => {
            const highlighted = matches([
              item.title,
              item.organisation,
              item.summary,
              ...item.achievements,
            ]);
            return (
              <article
                className="experience-entry"
                key={item.id}
                data-highlight-item
                data-highlight-match={view === "all" ? undefined : highlighted}
              >
                <div className="experience-meta">
                  <time>{item.period}</time>
                  <span>{item.location}</span>
                </div>
                <div>
                  <h2>{item.title}</h2>
                  <p className="experience-org">{item.organisation}</p>
                  <p>{item.summary}</p>
                  <ul className="bullet-list">
                    {item.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
