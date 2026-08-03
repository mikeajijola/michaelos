import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { CapabilityProvider } from "@/capabilities/context";
import { SiteShell } from "@/components/layout/SiteShell";
import { AgentSurface } from "@/components/agent/AgentSurface";
import { LilyProvider } from "@/lily/context";
import { HighlightProvider } from "@/highlight/context";
import { ThemeProvider } from "@/theme/context";
import "@xterm/xterm/css/xterm.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mike Ajijola — Enterprise Solutions Architect",
  description:
    "Enterprise architecture, AI strategy, platform engineering and product innovation—presented through a browser-native capability environment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Suspense>
          <CapabilityProvider>
            <LilyProvider>
              <ThemeProvider>
                <HighlightProvider>
                  <SiteShell>{children}</SiteShell>
                  <AgentSurface />
                </HighlightProvider>
              </ThemeProvider>
            </LilyProvider>
          </CapabilityProvider>
        </Suspense>
      </body>
    </html>
  );
}
