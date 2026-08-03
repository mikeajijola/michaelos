"use client";
import { useEffect, useRef, useState } from "react";
import { useLily } from "@/lily/context";
import { CapabilityTrace } from "./CapabilityTrace";
export function LilyConversation({ compact = false }: { compact?: boolean }) {
  const { session, submit } = useLily();
  const [input, setInput] = useState("");
  const messages = useRef<HTMLDivElement>(null);
  const latestMessage = session.messages.at(-1);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const viewport = messages.current;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [session.messages.length, latestMessage?.text, latestMessage?.status]);
  const send = () => {
    if (!input.trim()) return;
    const value = input;
    setInput("");
    void submit(value);
  };
  return (
    <div className={`lily-conversation ${compact ? "compact" : ""}`}>
      <div ref={messages} className="lily-messages" aria-live="polite">
        {session.messages.length ? (
          session.messages.map((item) => (
            <article
              key={item.id}
              className={`lily-message ${item.role} ${item.status ?? ""}`}
            >
              <span>
                {item.role === "lily"
                  ? "Navi"
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
            Ask Navi to find Mike’s projects, experience, writing or CV.
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
          Ask Navi to navigate MichaelOS
        </label>
        <div>
          <input
            id={compact ? "lily-panel-input" : "lily-console-input"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Navi to navigate…"
            autoComplete="off"
            autoFocus={compact}
          />
          <button
            disabled={!input.trim() || Boolean(session.activeRequestId)}
            aria-label="Send request to Navi"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
