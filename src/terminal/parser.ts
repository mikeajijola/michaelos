export function tokenize(line: string) {
  const tokens: string[] = []; let current = ""; let quote: "'" | '"' | null = null;
  for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (quote) { if (char === quote) quote = null; else current += char; } else if (char === "'" || char === '"') quote = char; else if (/\s/.test(char)) { if (current) { tokens.push(current); current = ""; } } else current += char; }
  if (current) tokens.push(current); return tokens;
}
export function parseCommand(line: string) { const tokens = tokenize(line); const command = tokens.shift() ?? ""; const positional: string[] = []; const flags: Record<string, string | boolean> = {}; while (tokens.length) { const token = tokens.shift()!; if (token.startsWith("--")) { const key = token.slice(2); const next = tokens[0]; flags[key] = next && !next.startsWith("--") ? tokens.shift()! : true; } else positional.push(token); } return { command, positional, flags }; }
