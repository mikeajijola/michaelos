"use client";
import { useMemo, useState } from "react";
import { capabilities, registry } from "@/capabilities/registry";
import { resolveCli, resolveTemplate } from "@/capabilities/protocol";
import { useCapabilities } from "@/capabilities/context";
import { ExecutionInspector } from "@/components/agent/AgentSurface";

export function ArchitectureWorkbench() {
  const runtime = useCapabilities();
  const [selected, setSelected] = useState("project.view");
  const [search, setSearch] = useState("");
  const [params, setParams] = useState<Record<string, string>>({
    slug: "nexus-backstage",
  });
  const current = registry.get(selected)!;
  const list = useMemo(
    () =>
      capabilities.filter((c) =>
        (c.id + " " + c.description)
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  return (
    <>
      <GovernanceWorkbench />
      <div className="cap-grid">
        <aside className="cap-list">
          <div className="panel-title">
            Registry <span>{capabilities.length}</span>
          </div>
          <input
            className="cap-search"
            placeholder="Search capabilities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {list.map((c) => (
            <button
              key={c.id}
              className={selected === c.id ? "selected" : ""}
              onClick={() => {
                setSelected(c.id);
                setParams(
                  Object.fromEntries(
                    c.params.map((p) => [
                      p.name,
                      String(p.default ?? c.examples[0]?.params[p.name] ?? ""),
                    ]),
                  ),
                );
              }}
            >
              <span>{c.id}</span>
              <small>{c.risk}</small>
            </button>
          ))}
        </aside>
        <section className="cap-detail">
          <div className="cap-id">
            <span className={`risk ${current.risk}`}>{current.risk}</span>
            <code>{current.id}</code>
          </div>
          <h2>{current.title}</h2>
          <p>{current.description}</p>
          <div className="definition">
            <b>Parameters</b>
            {current.params.length ? (
              current.params.map((p) => (
                <div className="param" key={p.name}>
                  <code>{p.name}</code>
                  <span>
                    {p.type}
                    {p.required ? " · required" : " · optional"}
                  </span>
                  <small>{p.description}</small>
                </div>
              ))
            ) : (
              <span className="muted">No parameters</span>
            )}
          </div>
          <div className="definition">
            <b>Invocation mapping</b>
            <div className="protocol">
              <span>CLI</span>
              <code>{resolveCli(current, params)}</code>
            </div>
            <div className="protocol">
              <span>ACTION KEYS</span>
              <code>{resolveTemplate(current.keyboard.template, params)}</code>
            </div>
            <div className="protocol">
              <span>A11Y</span>
              <code>{current.accessibility.label}</code>
            </div>
          </div>
          <div className="definition">
            <b>Example</b>
            <pre>{JSON.stringify(current.examples[0], null, 2)}</pre>
          </div>
          <div className="try">
            <b>Try capability</b>
            {current.params.map((p) => (
              <label key={p.name}>
                {p.name}
                <input
                  value={params[p.name] ?? ""}
                  onChange={(e) =>
                    setParams((x) => ({ ...x, [p.name]: e.target.value }))
                  }
                />
              </label>
            ))}
            <button
              data-capability-id={current.id}
              onClick={() => runtime.execute(current.id, params, "ui")}
            >
              Execute capability ↗
            </button>
          </div>
        </section>
      </div>
      <div className="tools-grid">
        <section className="registry-console-callout">
          <div>
            <div className="eyebrow">Global client</div>
            <h2>Agent CLI is available everywhere.</h2>
            <p>
              Open the Agent Console through Navi, or launch Action Key Mode
              with Ctrl+Alt+K (Command+Option+K on macOS).
            </p>
            <button onClick={() => runtime.execute("system.openTerminal")}>
              Open Agent CLI
            </button>
          </div>
          <div className="protocol-example">
            <b>Action Key Mode</b>
            <code>PROJECT VIEW nexus-backstage ENTER</code>
            <span>
              Both CLI and Action Key clients resolve to{" "}
              <code>project.view</code>.
            </span>
          </div>
        </section>
        <aside className="evidence">
          <section className="inspector">
            <div className="panel-title">Latest execution</div>
            <ExecutionInspector compact />
          </section>
          <Accessibility />
        </aside>
      </div>
    </>
  );
}
function GovernanceWorkbench() {
  const { execute } = useCapabilities();
  const [output, setOutput] = useState<unknown>(null);
  const [details, setDetails] = useState("");
  const run = async (id: string, params: Record<string, unknown> = {}) => {
    const event = await execute(id, params, "ui");
    setOutput(event.result ?? event.error);
  };
  return (
    <section
      className="governance-workbench"
      aria-label="Capability governance"
    >
      <div>
        <h2>Capability Health</h2>
        <p>Validate the live registry and all invocation mappings.</p>
        <button
          data-capability-id="system.auditCapabilities"
          onClick={() => void run("system.auditCapabilities")}
        >
          Run capability audit
        </button>
      </div>
      <div>
        <h2>Capability Delta</h2>
        <p>Compare the generated manifest with the accepted baseline.</p>
        <button
          data-capability-id="system.getCapabilityDelta"
          onClick={() => void run("system.getCapabilityDelta")}
        >
          View capability delta
        </button>
      </div>
      <div>
        <h2>Local Reports</h2>
        <input
          aria-label="Capability issue details"
          placeholder="Describe a local issue"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
        <button
          data-capability-id="system.reportCapabilityIssue"
          disabled={!details.trim()}
          onClick={() =>
            void run("system.reportCapabilityIssue", {
              reportType: "qa",
              severity: "warning",
              details,
              route: location.pathname,
            })
          }
        >
          Save local report
        </button>
        <button
          data-capability-id="system.exportCapabilityReports"
          onClick={() => void run("system.exportCapabilityReports")}
        >
          Export reports as JSON
        </button>
      </div>
      <div>
        <h2>QA Evidence</h2>
        <p>
          Audit and delta results use the shared Inspector and execution
          history. Baseline evidence is versioned in{" "}
          <code>docs/hermes-qa-baseline.md</code>.
        </p>
      </div>
      {output !== null && <pre>{JSON.stringify(output, null, 2)}</pre>}
    </section>
  );
}
function Accessibility() {
  const { selectedElement } = useCapabilities();
  if (!selectedElement)
    return (
      <section className="a11y">
        <div className="panel-title">Accessibility explorer</div>
        <p className="empty">
          Focus or hover a capability-backed control to inspect its semantic
          mapping.
        </p>
      </section>
    );
  const cap = registry.get(selectedElement.capabilityId);
  return (
    <section className="a11y">
      <div className="panel-title">Accessibility explorer</div>
      <dl>
        <dt>Visible text</dt>
        <dd>{selectedElement.text}</dd>
        <dt>Role</dt>
        <dd>{selectedElement.role}</dd>
        <dt>Focus state</dt>
        <dd>{selectedElement.focused ? "focused" : "not focused"}</dd>
        <dt>Accessible name</dt>
        <dd>{selectedElement.accessibleName}</dd>
        <dt>Capability</dt>
        <dd>
          <code>{selectedElement.capabilityId}</code>
        </dd>
        <dt>Parameters</dt>
        <dd>
          <code>{JSON.stringify(selectedElement.params)}</code>
        </dd>
        <dt>CLI</dt>
        <dd>
          <code>{cap ? resolveCli(cap, selectedElement.params) : "—"}</code>
        </dd>
        <dt>Action Keys</dt>
        <dd>
          <code>
            {cap
              ? resolveTemplate(cap.keyboard.template, selectedElement.params)
              : "—"}
          </code>
        </dd>
      </dl>
      <div className="throughline">
        <span>Visible control</span>
        <b>→</b>
        <span>Capability</span>
        <b>→</b>
        <span>Any client</span>
      </div>
    </section>
  );
}
