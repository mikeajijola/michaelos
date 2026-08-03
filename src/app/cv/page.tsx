"use client";

import {
  education,
  experience,
  links,
  profile,
  projects,
  recognition,
  skills,
} from "@/data/content";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { useHighlight } from "@/highlight/context";
import { HighlightControl } from "@/highlight/HighlightControl";

export default function CV() {
  const { view, matches } = useHighlight();
  return (
    <div className="page-shell">
      <header className="page-head cv-head">
        <div>
          <div className="eyebrow">Curriculum vitae</div>
          <h1 className="page-title">Mike Ajijola</h1>
          <p className="professional-headline">
            Enterprise Architecture · Platform Engineering · Agentic AI
          </p>
          <div className="profile-meta">
            <span>{profile.location}</span>
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
        <div className="actions cv-actions">
          <HighlightControl />
          <CapabilityButton
            capabilityId="cv.exportJson"
            label="Export CV as JSON"
            buttonClassName="secondary"
          >
            Export JSON
          </CapabilityButton>
          <CapabilityButton
            capabilityId="cv.print"
            label="Print or export curriculum vitae as PDF"
            buttonClassName="primary"
          >
            Print / export PDF
          </CapabilityButton>
        </div>
      </header>
      <article className="cv-sheet">
        <section
          className="cv-section"
          id="profile"
          data-highlight-item
          data-highlight-match={
            view === "all"
              ? undefined
              : matches([
                  "enterprise architecture",
                  "platform engineering",
                  "agentic ai",
                  "technical strategy",
                ])
          }
        >
          <h2 className="section-title">Profile</h2>
          <p className="lead">
            Strategic technical adviser and enterprise architect working
            across platform engineering, AI adoption, M&A integration and
            product innovation.
          </p>
        </section>
        <section className="cv-section" id="experience">
          <h2 className="section-title">Experience</h2>
          <div>
            {experience.map((item) => (
              <article
                className="cv-entry"
                key={item.id}
                data-highlight-item
                data-highlight-match={
                  view === "all"
                    ? undefined
                    : matches([
                        item.title,
                        item.organisation,
                        item.summary,
                        ...item.achievements,
                      ])
                }
              >
                <div className="meta">
                  <time>{item.period}</time>
                  <span>{item.location}</span>
                </div>
                <h3>{item.title}</h3>
                <b>{item.organisation}</b>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="cv-section" id="projects">
          <h2 className="section-title">Selected work</h2>
          <div>
            {projects.slice(0, 3).map((project) => (
              <article
                className="cv-entry"
                key={project.id}
                data-highlight-item
                data-highlight-match={
                  view === "all"
                    ? undefined
                    : matches([
                        project.name,
                        project.summary,
                        project.role,
                        ...project.technologies,
                      ])
                }
              >
                <div className="meta">
                  <span>{project.status}</span>
                  <time>{project.year}</time>
                </div>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="cv-section" id="skills">
          <h2 className="section-title">Capabilities</h2>
          <div className="tags">
            {skills.map((skill) => (
              <span className="tag" key={skill.id}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
        <section className="cv-section" id="recognition">
          <h2 className="section-title">Recognition</h2>
          {recognition.map((item) => (
            <article className="cv-entry" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              {item.source && (
                <a href={item.source.url} target="_blank" rel="noreferrer">
                  {item.source.label} ↗
                </a>
              )}
            </article>
          ))}
        </section>
        <section className="cv-section" id="education">
          <h2 className="section-title">Education</h2>
          {education.map((item) => (
            <article className="cv-entry" key={item.id}>
              <h3>{item.qualification}</h3>
              <p>{item.institution}</p>
            </article>
          ))}
        </section>
      </article>
    </div>
  );
}
