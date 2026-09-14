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

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_MIKEOS_REVISION: revision },
};

export default withEve(nextConfig);
