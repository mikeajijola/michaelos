"use client";
import { useState } from "react";
import { useCapabilities } from "@/capabilities/context";
import { canonicalInvocationJson } from "@/lily/capability-trace";
import type { CapabilityTraceEntry } from "@/lily/types";
export function CapabilityTrace({
  entries,
}: {
  entries: CapabilityTraceEntry[];
}) {
  const runtime = useCapabilities();
  const [copied, setCopied] = useState("");
  const copy = async (label: string, value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(`Copied ${label}`);
    window.setTimeout(() => setCopied(""), 1800);
  };
  if (!entries.length) return null;
  return (
    <div className="lily-trace">
      <details>
        <summary>
          {entries.length === 1
            ? `Used capability: ${entries[0].capabilityId}`
            : `${entries.length} capabilities used`}
        </summary>
        <div className="lily-trace-list">
          {entries.map((entry, index) => (
            <article key={entry.executionId}>
              <b>
                Capability {index + 1} of {entries.length}
              </b>
              <p className="invoked-by">Invoked by Navi</p>
              <dl>
                <dt>Capability</dt>
                <dd>
                  <code>{entry.capabilityId}</code>
                </dd>
                <dt>Arguments</dt>
                <dd>
                  <pre>{JSON.stringify(entry.arguments, null, 2)}</pre>
                </dd>
                <dt>Action Keys</dt>
                <dd>
                  <code>{entry.actionKeys ?? "Not available"}</code>
                </dd>
                <dt>Agent CLI</dt>
                <dd>
                  <code>{entry.cliCommand ?? "Not available"}</code>
                </dd>
                <dt>Status</dt>
                <dd className={entry.status}>
                  {entry.status === "success"
                    ? `Success${entry.durationMs ? ` · ${entry.durationMs} ms` : ""}`
                    : `Error${entry.errorMessage ? ` · ${entry.errorMessage}` : ""}`}
                </dd>
              </dl>
              <div className="trace-actions">
                <button
                  onClick={() =>
                    copy("capability", canonicalInvocationJson(entry))
                  }
                >
                  Copy capability
                </button>
                <button
                  disabled={!entry.actionKeys}
                  onClick={() => copy("Action Keys", entry.actionKeys)}
                >
                  Copy Action Keys
                </button>
                <button
                  disabled={!entry.cliCommand}
                  onClick={() => copy("CLI", entry.cliCommand)}
                >
                  Copy CLI
                </button>
                <button onClick={() => runtime.inspect(entry.executionId)}>
                  Inspect
                </button>
              </div>
            </article>
          ))}
        </div>
      </details>
      <span className="copy-status" role="status" aria-live="polite">
        {copied}
      </span>
    </div>
  );
}
