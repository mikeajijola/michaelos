import { describe, expect, it } from "vitest";
import { capabilities } from "./registry";
import { assertNoParityDrift, evaluateProtocolParity, generateParityMatrix } from "./parity";

describe("registry-derived capability parity", () => {
  it("covers every capability/interface pair with assertions or a reason", () => {
    const matrix = generateParityMatrix(capabilities);
    expect(matrix.map(entry => entry.capabilityId)).toHaveLength(capabilities.length);
    for (const entry of matrix) {
      expect(entry.interfaces).toHaveLength(6);
      for (const projection of entry.interfaces) expect(projection.enabled ? projection.assertions.length : projection.runtimeReason).toBeTruthy();
    }
  });
  it("checks CLI and Action Key canonical invocation for every capability", () => {
    const report = evaluateProtocolParity(capabilities);
    expect(report).toHaveLength(capabilities.length);
    expect(report.filter(entry => entry.status === "fail")).toEqual([]);
  });
  it("reports the exact capability when an interface contract drifts", () => {
    const matrix = generateParityMatrix(capabilities);
    const drifted = structuredClone(matrix);
    drifted[0].risk = "drift";
    expect(() => assertNoParityDrift(matrix, drifted)).toThrow(`${matrix[0].capabilityId}:interface-contract:drift`);
  });
});
