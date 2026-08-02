"use client";
import { useEffect, useRef } from "react";
import { useCapabilities } from "@/capabilities/context";
import { CapabilityInfo } from "@/components/common/CapabilityInfo";
import { runCommand } from "@/terminal/commands";
import type { SurfaceTab } from "@/capabilities/types";
import { LilyConversation } from "@/components/lily/LilyConversation";
import { LilyCompanion } from "@/components/lily/LilyCompanion";

function SurfaceAction({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  const { execute } = useCapabilities();
  return (
    <span className="surface-action">
      <button
        data-capability-id={id}
        aria-label={label}
        onClick={() => execute(id)}
      >
        {children}
      </button>
      <CapabilityInfo capabilityId={id} controlLabel={label} />
    </span>
  );
}

function TerminalClient() {
  const runtime = useCapabilities();
  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;
  const host = useRef<HTMLDivElement>(null);
  const terminal = useRef<import("@xterm/xterm").Terminal | null>(null);
  const line = useRef("");
  useEffect(() => {
    let disposed = false;
    void Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")]).then(
      ([xterm, fitModule]) => {
        if (disposed || !host.current) return;
        const instance = new xterm.Terminal({
          cursorBlink: true,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          theme: {
            background: "#15201b",
            foreground: "#dfe8e2",
            cursor: "#d4f05d",
            green: "#d4f05d",
          },
          convertEol: true,
          scrollback: 1000,
        });
        const fit = new fitModule.FitAddon();
        instance.loadAddon(fit);
        instance.open(host.current);
        fit.fit();
        terminal.current = instance;
        instance.onData((data) => {
          if (data === "\r") {
            const command = line.current;
            line.current = "";
            const active = runtimeRef.current;
            active.appendTranscript(`› ${command}`);
            void runCommand(command, {
              caller: "terminal",
              execute: active.execute,
              history: active.history,
              clear: active.clearTranscript,
            }).then((output) => {
              if (output) runtimeRef.current.appendTranscript(output);
            });
          } else if (data === "\u007F") {
            if (line.current) {
              line.current = line.current.slice(0, -1);
              instance.write("\b \b");
            }
          } else if (data === "\u0003") {
            line.current = "";
            instance.write("^C\r\n› ");
          } else if (data >= " ") {
            line.current += data;
            instance.write(data);
          }
        });
        const resize = () => fit.fit();
        window.addEventListener("resize", resize);
        instance.write("› ");
      },
    );
    return () => {
      disposed = true;
      terminal.current?.dispose();
      terminal.current = null;
    };
  }, []);
  useEffect(() => {
    const instance = terminal.current;
    if (!instance) return;
    instance.clear();
    instance.write("\x1b[H");
    if (runtime.transcript.length)
      instance.writeln(runtime.transcript.join("\r\n\r\n"));
    instance.write("\r\n› ");
  }, [runtime.transcript]);
  useEffect(() => {
    if (
      runtime.surface.open &&
      !runtime.surface.minimised &&
      runtime.surface.tab === "terminal"
    ) {
      runtime.markRead();
      setTimeout(() => terminal.current?.focus(), 60);
    }
  }, [runtime.surface.open, runtime.surface.minimised, runtime.surface.tab]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="xterm-host" ref={host} aria-label="MichaelOS Agent CLI" />
  );
}

export function ExecutionInspector({ compact = false }: { compact?: boolean }) {
  const runtime = useCapabilities();
  const last =
    runtime.history.find(
      (item) => item.executionId === runtime.inspectedExecutionId,
    ) ?? runtime.last;
  if (!last)
    return (
      <div className="global-inspector empty">
        Run a capability from any client to inspect its shared execution event.
      </div>
    );
  return (
    <div className={`global-inspector ${compact ? "compact" : ""}`}>
      <dl>
        <dt>Capability</dt>
        <dd>
          <code>{last.capabilityId}</code>
        </dd>
        <dt>Caller</dt>
        <dd>
          <span className="caller">{last.caller}</span>
        </dd>
        <dt>Status</dt>
        <dd className={last.status}>{last.status}</dd>
        <dt>Parameters</dt>
        <dd>
          <code>{JSON.stringify(last.params)}</code>
        </dd>
        <dt>Duration</dt>
        <dd>{last.durationMs} ms</dd>
        <dt>CLI</dt>
        <dd>
          <code>{last.resolvedCli}</code>
        </dd>
        <dt>Action Keys</dt>
        <dd>
          <code>
            {last.resolvedActionKeys ?? last.resolvedProtocol ?? "UNRESOLVED"}
          </code>
        </dd>
        <dt>Accessible name</dt>
        <dd>{last.accessibilityLabel}</dd>
        <dt>Timestamp</dt>
        <dd>{new Date(last.timestamp).toLocaleString()}</dd>
        {!compact && (
          <>
            <dt>Result</dt>
            <dd>
              <pre>{JSON.stringify(last.result ?? last.error, null, 2)}</pre>
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

export function AgentSurface() {
  const runtime = useCapabilities();
  const tab = runtime.surface.tab;
  const select = (next: SurfaceTab) =>
    runtime
      .execute(
        next === "terminal"
          ? "system.openTerminal"
          : next === "lily"
            ? "lily.openConsole"
            : "system.openInspector",
      )
      .then(() => undefined);
  return (
    <>
      <div
        className={`protocol-hud ${runtime.protocol.active ? "active" : ""}`}
        role="status"
        aria-live="assertive"
      >
        <b>ACTION KEYS ACTIVE</b>
        <span>{runtime.protocol.buffer || "Enter an Action Key…"}</span>
        <small>Enter to execute · Escape to cancel</small>
      </div>
      {runtime.toast && (
        <div className={`cap-toast ${runtime.toast.status}`} role="status">
          <b>{runtime.toast.title}</b>
          {runtime.toast.detail && <span>{runtime.toast.detail}</span>}
        </div>
      )}
      <LilyCompanion />
      {runtime.surface.open && (
        <section
          className={`agent-surface ${runtime.surface.minimised ? "minimised" : ""}`}
          aria-label="Agent Console"
        >
          <header>
            <div>
              <i />
              Agent Console
            </div>
            <div className="surface-window-actions">
              <SurfaceAction
                id="system.minimiseCommandSurface"
                label="Minimise Agent Console"
              >
                _
              </SurfaceAction>
              <SurfaceAction
                id="system.closeCommandSurface"
                label="Close Agent Console"
              >
                ×
              </SurfaceAction>
            </div>
          </header>
          {!runtime.surface.minimised && (
            <>
              <nav aria-label="Agent Console clients">
                <button
                  className={tab === "lily" ? "active" : ""}
                  onClick={() => select("lily")}
                >
                  Lily
                </button>
                <button
                  className={tab === "terminal" ? "active" : ""}
                  onClick={() => select("terminal")}
                >
                  Agent CLI
                </button>
                <button
                  className={tab === "inspector" ? "active" : ""}
                  onClick={() => select("inspector")}
                >
                  Inspector
                </button>
                <button
                  onClick={() => runtime.execute("navigation.goCapabilities")}
                >
                  History &amp; Full Registry ↗
                </button>
              </nav>
              <div className="surface-content">
                {tab === "lily" ? (
                  <LilyConversation />
                ) : tab === "terminal" ? (
                  <TerminalClient />
                ) : (
                  <ExecutionInspector />
                )}
              </div>
              <footer>
                {runtime.last
                  ? `Last: ${runtime.last.capabilityId} · ${runtime.last.caller} · ${runtime.last.durationMs} ms`
                  : "No capability executed in this browser yet"}
              </footer>
            </>
          )}
        </section>
      )}
    </>
  );
}
