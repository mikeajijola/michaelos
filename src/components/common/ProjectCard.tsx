"use client";
import type { Project } from "@/data/content";
import { useCapabilities } from "@/capabilities/context";
import { CapabilityInfo } from "./CapabilityInfo";
import { useHighlight } from "@/highlight/context";
export function ProjectCard({ project }: { project: Project }) {
  const { execute, selectElement } = useCapabilities();
  const { view, matches } = useHighlight();
  const params = { slug: project.slug };
  const label = `Open ${project.name} project details`;
  const highlighted = matches([
    project.name,
    project.summary,
    project.description,
    project.role,
    ...project.technologies,
    ...project.themes,
  ]);
  return (
    <div
      className="project-card-wrap"
      data-highlight-item
      data-highlight-match={view === "all" ? undefined : highlighted}
    >
      <button
        className="project-card"
        data-capability-id="project.view"
        data-capability-params={JSON.stringify(params)}
        aria-label={label}
        onFocus={() =>
          selectElement({
            text: `View ${project.name} project`,
            role: "button",
            accessibleName: label,
            capabilityId: "project.view",
            params,
            focused: true,
          })
        }
        onMouseEnter={() =>
          selectElement({
            text: `View ${project.name} project`,
            role: "button",
            accessibleName: label,
            capabilityId: "project.view",
            params,
          })
        }
        onClick={() => execute("project.view", params, "ui")}
      >
        <span className="project-top">
          <span className="project-status">{project.status}</span>
          <span>{project.year}</span>
        </span>
        <h3>{project.name}</h3>
        {project.subtitle && <span className="muted">{project.subtitle}</span>}
        <p>{project.summary}</p>
        <dl className="project-facts">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Capability</dt>
            <dd>{project.technologies.slice(0, 2).join(" · ")}</dd>
          </div>
        </dl>
        <div className="tags">
          {project.technologies.slice(0, 3).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
          <span className="arrow">↗</span>
        </div>
      </button>
      <CapabilityInfo
        capabilityId="project.view"
        params={params}
        controlLabel={label}
      />
    </div>
  );
}
