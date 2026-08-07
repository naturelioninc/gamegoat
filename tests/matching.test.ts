import { describe, expect, it } from "vitest";
import { draw } from "../lib/matching/draw";

function expectValid(ids: string[], result: ReturnType<typeof draw>) {
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.assignments).toHaveLength(ids.length);
  expect(new Set(result.assignments.map((assignment) => assignment.giverId)).size).toBe(ids.length);
  expect(new Set(result.assignments.map((assignment) => assignment.recipientId)).size).toBe(ids.length);
  for (const assignment of result.assignments) {
    expect(assignment.giverId).not.toBe(assignment.recipientId);
  }
}

describe("Secret Santa matching", () => {
  it.each([2, 3, 10, 50])("assigns every member exactly once for %i participants", (count) => {
    expectValid(Array.from({ length: count }, (_, index) => `p${index + 1}`), draw(Array.from({ length: count }, (_, index) => `p${index + 1}`)));
  });

  it("honours directional exclusions", () => {
    const result = draw(["a", "b", "c", "d"], [["a", "b"], ["b", "a"]]);
    expectValid(["a", "b", "c", "d"], result);
    if (result.ok) {
      expect(result.assignments).not.toContainEqual({ giverId: "a", recipientId: "b" });
      expect(result.assignments).not.toContainEqual({ giverId: "b", recipientId: "a" });
    }
  });

  it("rejects impossible exclusions without producing a partial draw", () => {
    const result = draw(["a", "b"], [["a", "b"]]);
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate participant identifiers", () => {
    const result = draw(["a", "a", "b"]);
    expect(result.ok).toBe(false);
  });
});
