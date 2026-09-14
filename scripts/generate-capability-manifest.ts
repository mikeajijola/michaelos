import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { capabilities } from "../src/capabilities/registry";
import { auditCapabilities, generateCapabilityManifest } from "../src/capabilities/governance";
import { createCapabilityConformance } from "../src/capabilities/conformance";

const revision = () => process.env.MIKEOS_REVISION || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();

async function main() {
  const entries = generateCapabilityManifest(capabilities);
  const envelope = await createCapabilityConformance({
    revision: revision(), entries, audit: auditCapabilities(capabilities),
    evidence: process.env.CI_EVIDENCE_URL
      ? [{ kind: "ci", reference: process.env.CI_EVIDENCE_URL }]
      : [],
  });
  await mkdir("capabilities", { recursive: true });
  const outputs = {
    "capabilities/generated-manifest.json": `${JSON.stringify(entries, null, 2)}\n`,
    "capabilities/conformance.json": `${JSON.stringify(envelope, null, 2)}\n`,
  };
  if (process.argv.includes("--check")) {
    for (const [path, content] of Object.entries(outputs)) {
      const current = JSON.parse(await readFile(path, "utf8"));
      const expected = JSON.parse(content);
      if (path.endsWith("conformance.json")) {
        expected.generatedAt = current.generatedAt;
        expected.testedAt = current.testedAt;
      }
      if (JSON.stringify(current) !== JSON.stringify(expected)) throw new Error(`${path} is stale for ${envelope.subject.revision}`);
    }
    console.log(`Capability conformance is current for ${envelope.subject.revision} (${envelope.manifest.digest})`);
    return;
  }
  for (const [path, content] of Object.entries(outputs)) await writeFile(path, content);
  console.log(`Wrote ${entries.length} capabilities for ${envelope.subject.revision} (${envelope.manifest.digest})`);
}

void main();
