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
import { NaviVoiceProvider } from "@/navi/voice/context";
import { THEME_STORAGE_KEY } from "@/theme/mode";
import "@xterm/xterm/css/xterm.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Mike Ajijola — Enterprise Solutions Architect, AI Strategist and Platform Leader",
  description:
    "Mike Ajijola designs enterprise platforms, AI adoption strategies and capability-led operating systems for large organisations and emerging ventures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="dark"
      style={{ colorScheme: "dark" }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const mode=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(mode==="light"||mode==="dark"){document.documentElement.dataset.theme=mode;document.documentElement.style.colorScheme=mode}}catch{}`,
          }}
        />
      </head>
      <body>
        <Suspense>
          <CapabilityProvider>
            <LilyProvider>
              <NaviVoiceProvider>
                <ThemeProvider>
                  <HighlightProvider>
                    <SiteShell>{children}</SiteShell>
                    <AgentSurface />
                  </HighlightProvider>
                </ThemeProvider>
              </NaviVoiceProvider>
            </LilyProvider>
          </CapabilityProvider>
        </Suspense>
      </body>
    </html>
  );
}
