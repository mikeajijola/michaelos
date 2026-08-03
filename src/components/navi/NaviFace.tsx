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
            d="M32 4 C35 5 38 3 41 5 C44 7 47 6 49 9 C51 12 54 13 54 17 C54 20 57 22 56 26 C55 29 58 32 56 35 C54 38 56 42 53 44 C50 46 51 50 47 51 C44 52 43 56 39 55 C36 55 34 58 31 56 C28 55 25 58 22 56 C19 54 16 56 14 53 C12 50 8 50 8 46 C8 43 4 41 6 37 C7 34 4 31 6 28 C7 25 4 22 7 19 C9 16 7 13 10 11 C13 9 13 5 17 6 C20 7 22 3 25 5 C28 6 29 3 32 4 Z"
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
