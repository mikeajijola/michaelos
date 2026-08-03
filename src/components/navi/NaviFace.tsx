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
        <g className="navi-face-eyes">
          <path d="M18.5 26q3.5-4 7 0" />
          <path d="M38.5 26q3.5-4 7 0" />
          <g className="navi-face-lashes">
            <path d="m19.2 23.8-2.1-1.7m1.2 3.4-2.5-.2" />
            <path d="m44.8 23.8 2.1-1.7m-1.2 3.4 2.5-.2" />
          </g>
        </g>
        <g className="navi-face-cheeks">
          <path d="M16.5 33.5h3M44.5 33.5h3" />
        </g>
        <g className="navi-face-mouth">
          <path d="M16 40c4-3.5 7 3.5 11 0s7-3.5 11 0 7 3.5 11 0" />
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
