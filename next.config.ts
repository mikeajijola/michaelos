import type { NextConfig } from "next";
import { withEve } from "eve/next";
import { execFileSync } from "node:child_process";

const gitRevision = () => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};
const revision = process.env.MIKEOS_REVISION || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || gitRevision();
const conformanceTimestamp = process.env.MIKEOS_CONFORMANCE_TIMESTAMP || new Date().toISOString();

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_MIKEOS_REVISION: revision,
    NEXT_PUBLIC_MIKEOS_CONFORMANCE_TIMESTAMP: conformanceTimestamp,
    NEXT_PUBLIC_MIKEOS_CI_EVIDENCE_URL: process.env.CI_EVIDENCE_URL || "",
  },
};

export default withEve(nextConfig);
