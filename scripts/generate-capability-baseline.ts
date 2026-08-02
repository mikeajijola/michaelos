import { mkdir, writeFile } from "node:fs/promises";
import { capabilities } from "../src/capabilities/registry";

const entries = capabilities.map(capability => ({
  id: capability.id,
  schemaVersion: 1,
  description: capability.description,
  parameters: capability.params,
  cliCommand: capability.cli.command || null,
  actionKeyTemplate: capability.keyboard.template.length ? [...capability.keyboard.template] : null,
  accessibleLabel: capability.accessibility.label || null,
  risk: capability.risk,
  navigatorEnabled: false,
}));

async function main() {
  await mkdir("capabilities", { recursive: true });
  await writeFile("capabilities/baseline-manifest.json", `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Wrote ${entries.length} capabilities to capabilities/baseline-manifest.json`);
}

void main();
