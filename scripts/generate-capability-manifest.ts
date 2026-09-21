import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { capabilities } from "../src/capabilities/registry";
import { auditCapabilities, generateCapabilityManifest } from "../src/capabilities/governance";
import { createCapabilityConformance } from "../src/capabilities/conformance";

const git = (args: string[]) => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};
const trackedWorktreeDirty = () => {
  try {
    execFileSync("git", ["diff-index", "--quiet", "HEAD", "--"], {
      stdio: "ignore",
    });
    return false;
  } catch {
    return true;
  }
};
const suppliedRevision = () => process.env.MIKEOS_REVISION || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA;

async function main() {
  const check = process.argv.includes("--check");
  const requireExactRevision = process.argv.includes("--require-exact-revision") || Boolean(process.env.CI);
  const outputArg = process.argv.find((argument) => argument.startsWith("--output="));
  const artifactPath = outputArg?.slice("--output=".length) ||
    "capabilities/conformance.json";
  const head = git(["rev-parse", "HEAD"]);
  const worktreeDirty = trackedWorktreeDirty();
  const provided = suppliedRevision();
  if (requireExactRevision && !provided) throw new Error("MIKEOS_REVISION, GITHUB_SHA, or VERCEL_GIT_COMMIT_SHA is required");
  if (requireExactRevision && !head) throw new Error("Checked-out Git HEAD is required for exact revision verification");
  if (requireExactRevision && worktreeDirty) throw new Error("Working tree must be clean for exact revision verification");
  if (provided && provided !== head) throw new Error(`Supplied revision ${provided} does not match checked-out HEAD ${head}`);
  const revision = worktreeDirty ? null : provided ?? head;
  const entries = generateCapabilityManifest(capabilities);
  const envelope = await createCapabilityConformance({
    revision,
    indeterminateReason: worktreeDirty ? "WORKTREE_DIRTY" : undefined,
    entries,
    audit: auditCapabilities(capabilities),
    testedAt: process.env.MIKEOS_TESTED_AT || null,
    evidence: process.env.CI_EVIDENCE_URL
      ? [{ kind: "ci", reference: process.env.CI_EVIDENCE_URL }]
      : [],
  });
  await mkdir("capabilities", { recursive: true });
  if (check) {
    const current = JSON.parse(await readFile("capabilities/generated-manifest.json", "utf8"));
    if (JSON.stringify(current) !== JSON.stringify(entries)) throw new Error("capabilities/generated-manifest.json is stale");
  } else await writeFile("capabilities/generated-manifest.json", `${JSON.stringify(entries, null, 2)}\n`);
  if (artifactPath) {
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, `${JSON.stringify(envelope, null, 2)}\n`);
  }
  console.log(JSON.stringify(envelope));
}

void main();
