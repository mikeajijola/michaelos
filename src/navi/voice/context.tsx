"use client";

import { createContext, useContext } from "react";
import { useLily } from "@/lily/context";
import { useNaviVoice } from "./use-navi-voice";

type NaviVoiceRuntime = ReturnType<typeof useNaviVoice>;

const NaviVoiceContext = createContext<NaviVoiceRuntime | null>(null);

export function NaviVoiceProvider({ children }: { children: React.ReactNode }) {
  const lily = useLily();
  const voice = useNaviVoice(async (request) => {
    const result = await lily.submit(request, {
      maxCapabilitySteps: 3,
      keepPanelOpen: true,
    });
    return (
      result ?? {
        text: "I’m ready for another request.",
        trace: [],
        failed: false,
      }
    );
  });

  return (
    <NaviVoiceContext.Provider value={voice}>
      {children}
    </NaviVoiceContext.Provider>
  );
}

export function useNaviVoiceRuntime() {
  const value = useContext(NaviVoiceContext);
  if (!value) throw new Error("NaviVoiceProvider missing");
  return value;
}
