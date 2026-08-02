export type NavigatorDecision =
  | { type: "tool_call"; tool: string; arguments: Record<string, unknown> }
  | { type: "final_answer"; message: string }
  | { type: "clarification"; question: string };

export type NavigatorTool = { id: string; description: string; parameters: Array<{ name: string; type: string; required: boolean; description: string }> };
