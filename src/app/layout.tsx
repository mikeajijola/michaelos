import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CapabilityProvider } from "@/capabilities/context";
import { SiteShell } from "@/components/layout/SiteShell";
import { AgentSurface } from "@/components/agent/AgentSurface";
import { LilyProvider } from "@/lily/context";
import "@xterm/xterm/css/xterm.css";
export const metadata: Metadata = { title: "Mike Ajijola — Platform engineer & systems thinker", description: "A portfolio and browser-native capability application." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Suspense><CapabilityProvider><LilyProvider><SiteShell>{children}</SiteShell><AgentSurface/></LilyProvider></CapabilityProvider></Suspense></body></html>}
