"use client";

import { usePathname } from "next/navigation";
import { CapabilityButton } from "@/components/common/CapabilityInfo";
import { nextThemeMode } from "@/theme/mode";
import { useTheme } from "@/theme/context";

const nav = [
  ["Projects", "navigation.goProjects"],
  ["Experience", "navigation.goExperience"],
  ["Writing", "navigation.goBlog"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode } = useTheme();
  const targetMode = nextThemeMode(mode);
  return (
    <>
      <header className="site-header">
        <div className="page-shell nav">
          <div className="brand-cluster">
            <CapabilityButton
              capabilityId="navigation.goHome"
              label="Go to homepage"
              buttonClassName="brand"
            >
              <span className="brand-mark">MA</span>
              <span>MichaelOS</span>
            </CapabilityButton>
            <CapabilityButton
              capabilityId="theme.setMode"
              params={{ mode: targetMode }}
              label={`Switch to ${targetMode} mode`}
              className="theme-capability"
              buttonClassName="theme-toggle"
            >
              <span aria-hidden="true">{mode === "dark" ? "☀" : "◐"}</span>
              <span>{mode === "dark" ? "Light" : "Dark"}</span>
            </CapabilityButton>
          </div>
          <nav className="links" aria-label="Primary navigation">
            {nav.map(([label, id]) => (
              <CapabilityButton
                key={id}
                capabilityId={id}
                label={`Open ${label}`}
                buttonClassName={
                  pathname.toLowerCase().includes(label.toLowerCase())
                    ? "active"
                    : ""
                }
              >
                {label}
              </CapabilityButton>
            ))}
          </nav>
          <div className="header-tools">
            <CapabilityButton
              capabilityId="navigation.goCapabilities"
              label="Open capability explorer"
              buttonClassName="nav-cta"
            >
              Capabilities
            </CapabilityButton>
          </div>
        </div>
      </header>
      <main key={pathname} className="page-transition">
        {children}
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell">
        <div className="footer-grid">
          <div>
            <h2>Mike Ajijola</h2>
            <p>
              Mike works across enterprise architecture, AI strategy, platform
              engineering and product innovation.
            </p>
          </div>
          <div>
            <b>Explore</b>
            <CapabilityButton
              capabilityId="navigation.goProjects"
              label="Open Projects"
            >
              Projects
            </CapabilityButton>
            <CapabilityButton
              capabilityId="navigation.goExperience"
              label="Open Experience"
            >
              Experience
            </CapabilityButton>
            <CapabilityButton
              capabilityId="navigation.goBlog"
              label="Open Writing"
            >
              Writing
            </CapabilityButton>
          </div>
          <div>
            <b>System</b>
            <CapabilityButton
              capabilityId="navigation.goCapabilities"
              label="Open capability registry"
            >
              Capability registry
            </CapabilityButton>
            <CapabilityButton
              capabilityId="cv.exportJson"
              label="Export CV data as JSON"
            >
              Export CV data
            </CapabilityButton>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Mike Ajijola</span>
          <span>Browser-native · local-first · capability-driven</span>
        </div>
      </div>
    </footer>
  );
}
