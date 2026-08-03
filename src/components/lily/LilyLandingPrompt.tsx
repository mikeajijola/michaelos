"use client";
import { useState } from "react";
import { useLily } from "@/lily/context";
import { useCapabilities } from "@/capabilities/context";
import { CapabilityTrace } from "./CapabilityTrace";
export function LilyLandingPrompt() {
  const { session, submit } = useLily();
  const runtime = useCapabilities();
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
      className={`lily-landing lily-chat-composer ${active ? session.presentation : ""}`}
      aria-label="Chat with Navi"
    >
      <div className="lily-landing-content">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label htmlFor="lily-landing-input">Message Navi</label>
          <div className="lily-composer-field">
            <button
              type="button"
              className="lily-composer-avatar"
              aria-label="Start Navi Voice Mode"
              title="Start Navi Voice Mode"
              onClick={() => void runtime.execute("navi.startVoice")}
            >
              <span aria-hidden="true">🎙</span>
            </button>
            <textarea
              id="lily-landing-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Message Navi…"
              autoComplete="off"
              rows={4}
            />
            <button
              disabled={!value.trim() || Boolean(session.activeRequestId)}
              aria-label="Send message to Navi"
            >
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </form>
        {latestResponse && (
          <div className="lily-landing-response" aria-live="polite">
            <span>Navi</span>
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
            Navi is resolving your request through registered capabilities…
          </p>
        )}
      </div>
    </section>
  );
}
