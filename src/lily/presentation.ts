import type { LilyPresentationState } from "./types";

export function restoredLilyPresentation(
  route: string,
  saved: LilyPresentationState,
): LilyPresentationState {
  if (route === "/") return "landing-idle";
  return saved === "landing-idle" ? "bubble-collapsed" : saved;
}

export function completedLilyPresentation(
  startedOnHomepage: boolean,
  navigated: boolean,
  keepPanelOpen = false,
): LilyPresentationState {
  if (keepPanelOpen) return "bubble-open";
  if (!startedOnHomepage) return "bubble-open";
  return navigated ? "morphing-to-bubble" : "landing-idle";
}

export function shouldShowLilyCompanion(route: string) {
  return Boolean(route);
}

export function shouldOpenLilyPanel(
  route: string,
  presentation: LilyPresentationState,
  activeRequestId?: string,
) {
  if (presentation === "bubble-open") return true;
  if (route === "/") return false;
  return (
    presentation === "morphing-to-bubble" ||
    (Boolean(activeRequestId) &&
      (presentation === "landing-resolving" ||
        presentation === "landing-navigating"))
  );
}
