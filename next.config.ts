import type { NextConfig } from "next";
import { withEve } from "eve/next";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const gitSubject = () => {
  try {
    execFileSync(
      "git",
      ["diff-index", "--quiet", "HEAD", "--", ".", ":(exclude)package-lock.json"],
      { stdio: "ignore" },
    );
    return {
      revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
      reason: "",
    };
  } catch {
    return { revision: "", reason: "SUBJECT_REVISION_UNAVAILABLE" };
  }
};
const suppliedRevision = process.env.MIKEOS_REVISION || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
const localSubject = gitSubject();
const revision = localSubject.reason === "WORKTREE_DIRTY" ? "" : suppliedRevision || localSubject.revision;
const revisionReason = revision ? "" : localSubject.reason;
const conformanceTimestamp = process.env.MIKEOS_CONFORMANCE_TIMESTAMP || new Date().toISOString();
const conformanceArtifact = () => {
  try {
    return readFileSync("capabilities/conformance.json", "utf8");
  } catch {
    return "";
  }
};

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_MIKEOS_REVISION: revision,
    NEXT_PUBLIC_MIKEOS_REVISION_REASON: revisionReason,
    NEXT_PUBLIC_MIKEOS_CONFORMANCE_TIMESTAMP: conformanceTimestamp,
    NEXT_PUBLIC_MIKEOS_CI_EVIDENCE_URL: process.env.CI_EVIDENCE_URL || "",
    NEXT_PUBLIC_MIKEOS_CONFORMANCE_ARTIFACT: conformanceArtifact(),
  },
};

export default withEve(nextConfig);
