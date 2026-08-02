import { mkdir, writeFile } from "node:fs/promises";
import { capabilities } from "../src/capabilities/registry";
import { generateCapabilityManifest } from "../src/capabilities/governance";

async function main() {
  const entries = generateCapabilityManifest(capabilities);
  await mkdir("capabilities", { recursive: true });
  await writeFile("capabilities/generated-manifest.json", `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Wrote ${entries.length} capabilities to capabilities/generated-manifest.json`);
}

void main();
