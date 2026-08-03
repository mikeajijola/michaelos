import type { NaviFaceState } from "@/navi/voice/face-state";

export function NaviFace({
  state = "idle",
  voiceActive = false,
  size = "bubble",
}: {
  state?: NaviFaceState;
  voiceActive?: boolean;
  size?: "small" | "bubble" | "voice";
}) {
  return (
    <span
      className={`navi-face navi-face-${size} navi-face-${state}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" focusable="false">
        <g className="navi-face-ring">
          <path
            className="navi-face-ring-base"
            pathLength="100"
            d="M32 5 C47.1 5 59 17 59 32 C59 47.1 47 59 32 59 C16.9 59 5 47 5 32 C5 16.9 17 5 32 5 Z"
          />
          <path
            className="navi-face-ring-ripple"
            pathLength="100"
            d="M32 5 C47.1 5 59 17 59 32 C59 47.1 47 59 32 59 C16.9 59 5 47 5 32 C5 16.9 17 5 32 5 Z"
          />
        </g>
        <g className="navi-face-portrait">
          <g className="navi-face-eyes">
            <ellipse cx="22" cy="26" rx="2.65" ry="3.2" />
            <ellipse cx="42" cy="26" rx="2.65" ry="3.2" />
            <g className="navi-face-lashes">
              <path d="m19.8 24-1.4-1.1m.7 2.4-1.6-.1" />
              <path d="m44.2 24 1.4-1.1m-.7 2.4 1.6-.1" />
            </g>
          </g>
          <g className="navi-face-cheeks">
            <path d="M18.5 32h2.5M43 32h2.5" />
          </g>
          <g className="navi-face-mouth">
            <path d="M23 38.5c4 5 14 5 18 0" />
          </g>
        </g>
      </svg>
      {voiceActive && (
        <span className="navi-face-mic">
          <svg viewBox="0 0 16 16" focusable="false">
            <rect x="6" y="2" width="4" height="7" rx="2" />
            <path d="M4.5 7.5a3.5 3.5 0 0 0 7 0M8 11v3M6 14h4" />
          </svg>
        </span>
      )}
    </span>
  );
}
