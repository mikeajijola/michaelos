import { ArchitectureWorkbench } from "@/components/capabilities/ArchitectureWorkbench";
import "./workbench.css";
import "./workbench-v2.css";
export default function CapabilityPage() {
  return (
    <div className="shell capability-page">
      <div className="page-head work-head">
        <div>
          <div className="eyebrow">Application architecture</div>
          <h1 className="page-title">Capability explorer</h1>
          <p>
            MichaelOS describes each action once, then makes it available to
            every approved interface.
          </p>
        </div>
        <div className="runtime">
          <i /> Browser runtime <span>SQLite · OPFS</span>
        </div>
      </div>
      <ArchitectureWorkbench />
      <div className="manifesto">
        “The browser is the runtime. The capability registry is the
        application.”
        <span>
          The graphical interface, Navi, Agent CLI, Action Keys and
          accessibility tools all execute through the same capability registry.
        </span>
      </div>
    </div>
  );
}
