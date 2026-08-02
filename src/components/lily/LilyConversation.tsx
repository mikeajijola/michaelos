"use client";
import { useState } from "react";
import { useLily } from "@/lily/context";
import { CapabilityTrace } from "./CapabilityTrace";
export function LilyConversation({ compact = false }: { compact?: boolean }) {
  const { session, submit } = useLily();
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    const value = input;
    setInput("");
    void submit(value);
  };
  return (
    <div className={`lily-conversation ${compact ? "compact" : ""}`}>
      <div className="lily-messages" aria-live="polite">
        {session.messages.length ? (
          session.messages.map((item) => (
            <article
              key={item.id}
              className={`lily-message ${item.role} ${item.status ?? ""}`}
            >
              <span>
                {item.role === "lily"
                  ? "Lily"
                  : item.role === "user"
                    ? "You"
                    : "System"}
              </span>
              <p>{item.text}</p>
              {item.clarificationOptions && (
                <div className="lily-options">
                  {item.clarificationOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => submit(option.request)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {item.capabilityTrace && (
                <CapabilityTrace entries={item.capabilityTrace} />
              )}
            </article>
          ))
        ) : (
          <p className="lily-empty">
            Ask Lily to find Mike’s projects, experience, writing or CV.
          </p>
        )}
      </div>
      <form
        className="lily-input"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label htmlFor={compact ? "lily-panel-input" : "lily-console-input"}>
          Ask Lily to navigate MichaelOS
        </label>
        <div>
          <input
            id={compact ? "lily-panel-input" : "lily-console-input"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Lily to navigate…"
            autoComplete="off"
          />
          <button
            disabled={!input.trim() || Boolean(session.activeRequestId)}
            aria-label="Send request to Lily"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
