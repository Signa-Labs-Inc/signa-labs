import { describe, it, expect } from "vitest";
import { twoSum } from "../submission/solution.mjs";

describe("twoSum", () => {
  it("handles basic case", () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });

  it("handles middle elements", () => {
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  });

  it("handles same element", () => {
    expect(twoSum([3, 3], 6)).toEqual([0, 1]);
  });
});
