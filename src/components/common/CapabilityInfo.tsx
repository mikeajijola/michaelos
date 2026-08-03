"use client";

import { useState } from "react";
import { useCapabilities } from "@/capabilities/context";
import { resolveCli, resolveTemplate } from "@/capabilities/protocol";
import { registry } from "@/capabilities/registry";

export function CapabilityInfo({
  capabilityId,
  params = {},
  controlLabel,
}: {
  capabilityId: string;
  params?: Record<string, unknown>;
  controlLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const capability = registry.get(capabilityId);
  const { selectElement, execute } = useCapabilities();
  if (!capability) return null;
  const metadata = {
    text: controlLabel,
    role: "button",
    accessibleName: controlLabel,
    capabilityId,
    params,
    focused: false,
  };
  return (
    <>
      <button
        className="cap-info-button"
        aria-label={`Show Action Key and CLI details for ${controlLabel}`}
        title="Show capability details"
        onFocus={() => selectElement({ ...metadata, focused: true })}
        onMouseEnter={() => selectElement(metadata)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        ⓘ
      </button>
      {open && (
        <div
          className="cap-info-backdrop"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <section
            className="cap-info-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Capability details for ${controlLabel}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="cap-info-close"
              aria-label="Close capability details"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div className="eyebrow">Capability details</div>
            <h2>{capabilityId}</h2>
            <p>{capability.description}</p>
            <dl>
              <dt>Parameters</dt>
              <dd>
                <code>{JSON.stringify(params, null, 2)}</code>
              </dd>
              <dt>CLI</dt>
              <dd>
                <code>{resolveCli(capability, params)}</code>
              </dd>
              <dt>Action Keys</dt>
              <dd>
                <code>
                  {resolveTemplate(capability.keyboard.template, params)}
                </code>
              </dd>
              <dt>Accessible label</dt>
              <dd>{controlLabel}</dd>
              <dt>Risk</dt>
              <dd>{capability.risk}</dd>
            </dl>
            <div className="gateway-note">
              <b>Action Key Mode</b>
              <code>Ctrl + Alt + K</code>
              <code>⌘ + Option + K</code>
              <span>
                Open the labelled command input, then enter the Action Key
                above.
              </span>
              <button onClick={() => execute("system.openActionKeyMode")}>
                Open Action Key Mode
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function CapabilityButton({
  capabilityId,
  params = {},
  label,
  children,
  className = "",
  buttonClassName = "",
}: {
  capabilityId: string;
  params?: Record<string, unknown>;
  label: string;
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}) {
  const { execute, selectElement } = useCapabilities();
  const selected = {
    text: typeof children === "string" ? children : label,
    role: "button",
    accessibleName: label,
    capabilityId,
    params,
  };
  return (
    <span className={`cap-control ${className}`}>
      <button
        className={buttonClassName}
        data-capability-id={capabilityId}
        data-capability-params={JSON.stringify(params)}
        aria-label={label}
        onFocus={() => selectElement({ ...selected, focused: true })}
        onMouseEnter={() => selectElement(selected)}
        onClick={() => execute(capabilityId, params, "ui")}
      >
        {children}
      </button>
      <CapabilityInfo
        capabilityId={capabilityId}
        params={params}
        controlLabel={label}
      />
    </span>
  );
}
