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
            <path d="M14.5 30c-1-10 6.5-17 16.5-16.5 9 .5 16 5.5 18 14.5-5-5-10-7.5-16-8-7-.5-12.5 3-16 9" />
            <path d="M31 14c-4 4-6.5 8-7 12 4.5-3 10-5.5 17-5.5" />
          </g>
          <g className="navi-face-eyes">
            <ellipse cx="22" cy="26" rx="2.65" ry="3.2" />
            <ellipse cx="42" cy="26" rx="2.65" ry="3.2" />
            <g className="navi-face-lashes">
              <path d="m19.8 23.6-2-1.5m1.2 3.2-2.4-.1" />
              <path d="m44.2 23.6 2-1.5m-1.2 3.2 2.4-.1" />
            </g>
          </g>
          <g className="navi-face-cheeks">
            <path d="M16.5 33.5h3M44.5 33.5h3" />
          </g>
          <g className="navi-face-mouth">
            <path d="M22 38.5c4.5 5.5 15.5 5.5 20 0" />
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
