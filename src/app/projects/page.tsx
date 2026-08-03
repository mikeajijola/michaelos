"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { projects, type Project } from "@/data/content";
import { ProjectCard } from "@/components/common/ProjectCard";
import { useCapabilities } from "@/capabilities/context";
import {
  CapabilityInfo,
  CapabilityButton,
} from "@/components/common/CapabilityInfo";

export default function Projects() {
  const runtime = useCapabilities();
  const queryParams = useSearchParams();
  const selected = projects.find(
    (project) => project.slug === queryParams.get("project"),
  );
  const [q, setQ] = useState("");
  const [shown, setShown] = useState<Project[]>(projects);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const search = async () => {
    if (!q) {
      setShown(projects);
      setStatus(`Showing all ${projects.length} projects`);
      return;
    }
    setLoading(true);
    setStatus("Searching projects…");
    const event = await runtime.execute("project.search", { query: q }, "ui");
    if (event.status === "success") {
      const rows = (event.result as { projects: Project[] }).projects;
      setShown(rows);
      setStatus(
        `${rows.length} relevant ${rows.length === 1 ? "project" : "projects"} found`,
      );
    } else setStatus("Project search could not be completed");
    setLoading(false);
  };
  return (
    <div className="page-shell">
      <div className="page-head">
        <div className="eyebrow">Selected work</div>
        <h1 className="page-title">Systems made useful.</h1>
        <p>
          Editorial case studies in platforms, products and public-interest
          technology.
        </p>
        <div className="toolbar">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void search();
            }}
            placeholder="Search projects…"
            aria-label="Project search query"
          />
          <button
            className="primary"
            disabled={loading}
            data-capability-id="project.search"
            data-capability-params={JSON.stringify({ query: q })}
            onClick={search}
          >
            {loading ? "Searching…" : "Search"}
          </button>
          <CapabilityInfo
            capabilityId="project.search"
            params={{ query: q }}
            controlLabel="Search portfolio projects"
          />
        </div>
        <p className="interaction-status" aria-live="polite">
          {status}
        </p>
      </div>
      {selected && (
        <section className="detail-banner">
          <div className="eyebrow">
            {selected.status} · {selected.year}
          </div>
          <h2>{selected.name}</h2>
          <p>{selected.description}</p>
          <div className="tags">
            {selected.technologies.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <CapabilityButton
              capabilityId="navigation.goProjects"
              label="Return to all projects"
              buttonClassName="secondary"
            >
              Back to all projects
            </CapabilityButton>
          </div>
        </section>
      )}
      <section className="editorial-section">
        <h2 className="section-title">Project index</h2>
        <div className="projects-index">
          {shown.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
