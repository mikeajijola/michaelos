"use client";
import { articles, experience, projects, skills } from "@/data/content";
import { ProjectCard } from "@/components/common/ProjectCard";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { LilyLandingPrompt } from "@/components/lily/LilyLandingPrompt";
import { useHighlight } from "@/highlight/context";
export default function Home() {
  const { view, matches } = useHighlight();
  return (
    <>
      <div className="shell home-lily-stage">
        <div className="home-lily-intro">
          <div className="eyebrow">Your MichaelOS guide</div>
          <h1>Chat with Lily.</h1>
          <p>
            Ask about Mike’s projects, experience, writing or CV. Lily can
            answer, take you to the right place and show the capability she
            used.
          </p>
        </div>
        <LilyLandingPrompt />
      </div>
      <div className="shell hero hero-supporting">
        <div>
          <div className="eyebrow">Mike Ajijola</div>
          <h1>
            Enterprise architecture. Platform engineering. <em>Agentic AI.</em>
          </h1>
        </div>
        <div className="hero-aside">
          <p className="lead">
            I help complex organisations turn architecture, platforms and AI
            into systems people can understand, adopt and build upon.
          </p>
          <div className="actions">
            <CapabilityButton
              capabilityId="navigation.goProjects"
              label="Open selected projects"
              buttonClassName="primary"
            >
              See selected work
            </CapabilityButton>
            <CapabilityButton
              capabilityId="navigation.goExperience"
              label="Open professional experience"
              buttonClassName="secondary"
            >
              About my work
            </CapabilityButton>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow">Selected work</div>
              <h2 className="section-title">Selected work</h2>
            </div>
            <CapabilityButton
              capabilityId="navigation.goProjects"
              label="Open all projects"
              buttonClassName="text-link"
            >
              All projects →
            </CapabilityButton>
          </div>
          <div className="grid3">
            {projects
              .filter((p) => p.featured)
              .map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow">Experience</div>
              <h2 className="section-title">Experience</h2>
            </div>
            <p className="section-kicker">
              I work where systems, teams and product strategy meet—turning
              recurring friction into dependable foundations.
            </p>
          </div>
          {experience.slice(0, 2).map((x) => (
            <div
              className="exp-row"
              key={x.id}
              data-highlight-item
              data-highlight-match={
                view === "all"
                  ? undefined
                  : matches([
                      x.title,
                      x.organisation,
                      x.summary,
                      ...x.achievements,
                    ])
              }
            >
              <span className="muted">{x.period}</span>
              <div>
                <h3>{x.title}</h3>
                <span className="muted">{x.organisation}</span>
              </div>
              <p className="muted">{x.summary}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow">Recent writing</div>
              <h2 className="section-title">Recent writing</h2>
            </div>
            <CapabilityButton
              capabilityId="navigation.goBlog"
              label="Open all writing"
              buttonClassName="text-link"
            >
              Read the journal →
            </CapabilityButton>
          </div>
          <div className="articles">
            {articles.map((a) => (
              <ArticleControl key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow">Practice</div>
              <h2 className="section-title">Capabilities</h2>
            </div>
          </div>
          <div className="skills-grid">
            {skills.map((s) => (
              <div
                className="skill"
                key={s.id}
                data-highlight-item
                data-highlight-match={
                  view === "all"
                    ? undefined
                    : matches([s.name, s.category, s.description])
                }
              >
                <b>{s.name}</b>
                <span className="muted">{s.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function ArticleControl({
  article: a,
}: {
  article: (typeof articles)[number];
}) {
  const { view, matches } = useHighlight();
  return (
    <div
      data-highlight-item
      data-highlight-match={
        view === "all" ? undefined : matches([a.title, a.summary, ...a.tags])
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
            <span>{a.tags[0]}</span>
            <span>{a.readTime}</span>
          </div>
          <h3>{a.title}</h3>
          <p>{a.summary}</p>
        </>
      </CapabilityButton>
    </div>
  );
}
