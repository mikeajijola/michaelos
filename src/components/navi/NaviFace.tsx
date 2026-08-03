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
        <g className="navi-face-eyes">
          <path d="M20 25.5h3" />
          <path d="M41 25.5h3" />
        </g>
        <g className="navi-face-mouth">
          <path d="M13 40c4-9 8 9 12 0s8-9 12 0 8 9 14 0" />
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
