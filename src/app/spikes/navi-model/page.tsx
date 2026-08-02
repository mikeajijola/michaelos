"use client";
import { useEffect, useRef, useState } from "react";

export default function NaviModelSpikePage() {
  const worker = useRef<Worker | null>(null); const [events, setEvents] = useState<unknown[]>([]); const [running, setRunning] = useState(false);
  const run = () => { if (running) return; setRunning(true); setEvents([]); const backend = new URLSearchParams(location.search).get("backend") === "wasm" ? "wasm" : "webgpu"; const instance = new Worker(new URL("../../../navigator/navi-spike.worker.ts", import.meta.url)); worker.current = instance; instance.onmessage = event => { setEvents(current => [...current, event.data]); if (event.data.type === "complete" || event.data.type === "error") { setRunning(false); void fetch("/__spike_results", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userAgent: navigator.userAgent, requestedBackend: backend, webgpu: "gpu" in navigator, crossOriginIsolated, finishedAt: new Date().toISOString(), ...event.data }) }).catch(() => undefined); } }; instance.postMessage({ type: "run", backend }); };
  useEffect(() => { if (new URLSearchParams(location.search).get("autorun") === "1") run(); return () => worker.current?.terminate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <main style={{padding:24,fontFamily:"system-ui"}}><h1>Navi browser model spike</h1><p>Qwen2.5 0.5B Instruct · q4 · WebGPU · browser-local</p><button onClick={run} disabled={running}>{running?"Running…":"Run eight-prompt spike"}</button><pre style={{whiteSpace:"pre-wrap",fontSize:11}}>{JSON.stringify(events,null,2)}</pre></main>;
}
