import { createReadStream, existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out"); const resultPath = "/tmp/michaelos-navi-spike-result.json";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".wasm": "application/wasm", ".json": "application/json" };
createServer(async (request, response) => {
  console.log(new Date().toISOString(), request.method, request.url);
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin"); response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  if (request.method === "POST" && request.url === "/__spike_results") { const chunks=[]; for await (const chunk of request) chunks.push(chunk); await writeFile(resultPath, Buffer.concat(chunks)); response.end("ok"); return; }
  let path = normalize(decodeURIComponent((request.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, ""); if (path.endsWith("/")) path += "index.html";
  const file = join(root, path); if (!existsSync(file)) { response.statusCode=404; response.end("not found"); return; }
  response.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream"); createReadStream(file).pipe(response);
}).listen(8788, "127.0.0.1", () => console.log(`Spike server: http://127.0.0.1:8788/spikes/navi-model/?autorun=1\nEvidence: ${resultPath}`));
