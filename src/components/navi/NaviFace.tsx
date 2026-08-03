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
            pathLength="100"
            d="M27 6 Q32 4 37 6 Q42 8 46.9 10.1 Q51.8 12.2 53.9 17.1 Q56 22 58 27 Q60 32 58 37 Q56 42 53.9 46.9 Q51.8 51.8 46.9 53.9 Q42 56 37 58 Q32 60 27 58 Q22 56 17.1 53.9 Q12.2 51.8 10.1 46.9 Q8 42 6 37 Q4 32 6 27 Q8 22 10.1 17.1 Q12.2 12.2 17.1 10.1 Q22 8 27 6 Z"
          />
        </g>
        <g className="navi-face-portrait">
          <g className="navi-face-hair">
            <path d="M15.5 29.5c-1-9.5 6-16 16-16s15.5 5.5 17 14.5" />
            <path d="M31.5 14c-4 3-6.5 7-7 11.5" />
            <path d="M38.5 16c-4 2-7 5-9 8" />
          </g>
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
