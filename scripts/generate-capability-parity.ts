import { readFile, writeFile } from "node:fs/promises";
import { capabilities } from "../src/capabilities/registry";
import { evaluateProtocolParity, generateParityMatrix } from "../src/capabilities/parity";

async function main() {
  const path = new URL("../capabilities/parity-matrix.json", import.meta.url);
  const report = JSON.stringify({ schemaVersion: 1, generatedFrom: "src/capabilities/registry.ts", matrix: generateParityMatrix(capabilities), protocol: evaluateProtocolParity(capabilities) }, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== report) throw new Error("capabilities/parity-matrix.json is stale; run npm run capabilities:parity");
  } else await writeFile(path, report);
  process.stdout.write(JSON.stringify({ capabilities: capabilities.length, interfaces: capabilities.length * 6, failures: evaluateProtocolParity(capabilities).filter(item => item.status === "fail").length }) + "\n");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
