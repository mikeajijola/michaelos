import { describe, expect, it } from "vitest";
import { parseNavigatorDecision } from "./decision-parser";

const tools = [{ id: "project.search", description: "Search projects", parameters: [{ name: "query", type: "string", required: true, description: "Search words" }] }];
describe("Navi decision parser", () => {
  it("accepts a supplied schema-valid tool call", () => expect(parseNavigatorDecision('{"type":"tool_call","tool":"project.search","arguments":{"query":"platform"}}', tools)).toMatchObject({ ok: true }));
  it("accepts one JSON code fence", () => expect(parseNavigatorDecision('```json\n{"type":"clarification","question":"Which project?"}\n```', tools)).toMatchObject({ ok: true }));
  it("rejects unavailable tools, unknown arguments, and surrounding prose", () => {
    expect(parseNavigatorDecision('{"type":"tool_call","tool":"data.delete","arguments":{}}', tools)).toMatchObject({ ok: false });
    expect(parseNavigatorDecision('{"type":"tool_call","tool":"project.search","arguments":{"query":"x","extra":true}}', tools)).toMatchObject({ ok: false });
    expect(parseNavigatorDecision('Here: {"type":"final_answer","message":"no"}', tools)).toMatchObject({ ok: false });
  });
});
