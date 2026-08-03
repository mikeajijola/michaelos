"use client";
import { useState } from "react";
import { useLily } from "@/lily/context";
import { CapabilityTrace } from "./CapabilityTrace";
const examples = [
  "Show me his AI work",
  "Open his CV",
  "Find his platform-engineering projects",
  "Show me his latest role",
];
export function LilyLandingPrompt() {
  const { session, submit } = useLily();
  const [value, setValue] = useState("");
  const active = session.presentation !== "landing-idle";
  const latestResponse = [...session.messages]
    .reverse()
    .find((message) => message.role === "lily" && message.status !== "pending");
  const send = (text = value) => {
    if (!text.trim()) return;
    setValue("");
    void submit(text);
  };
  return (
    <section
      className={`lily-landing ${active ? session.presentation : ""}`}
      aria-labelledby="meet-lily"
    >
      <div className="lily-mark" aria-hidden="true">
        L
      </div>
      <div className="lily-landing-content">
        <div className="eyebrow">Meet Lily</div>
        <h2 id="meet-lily">Ask Lily to navigate MichaelOS.</h2>
        <p>
          Lily can take you through Mike’s projects, experience, writing and CV
          using registered MichaelOS capabilities.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label htmlFor="lily-landing-input">
            What would you like to find?
          </label>
          <div>
            <input
              id="lily-landing-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Show me Mike’s platform-engineering work…"
            />
            <button
              disabled={!value.trim() || Boolean(session.activeRequestId)}
            >
              Send
            </button>
          </div>
        </form>
        <div className="lily-examples" aria-label="Example requests">
          {examples.map((example) => (
            <button key={example} onClick={() => send(example)}>
              {example}
            </button>
          ))}
        </div>
        {latestResponse && (
          <div className="lily-landing-response" aria-live="polite">
            <span>Lily</span>
            <p>{latestResponse.text}</p>
            {latestResponse.clarificationOptions && (
              <div className="lily-options">
                {latestResponse.clarificationOptions.map((option) => (
                  <button key={option.id} onClick={() => send(option.request)}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {latestResponse.capabilityTrace && (
              <CapabilityTrace entries={latestResponse.capabilityTrace} />
            )}
          </div>
        )}
        {session.activeRequestId && (
          <p className="lily-status" role="status">
            Lily is resolving your request through registered capabilities…
          </p>
        )}
      </div>
    </section>
  );
}
