import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CapabilityProvider } from "@/capabilities/context";
import { SiteShell } from "@/components/layout/SiteShell";
export const metadata: Metadata = { title: "Mike Ajijola — Platform engineer & systems thinker", description: "A portfolio and browser-native capability application." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Suspense><CapabilityProvider><SiteShell>{children}</SiteShell></CapabilityProvider></Suspense></body></html>}
