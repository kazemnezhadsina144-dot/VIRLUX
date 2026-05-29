import { describe, it, expect } from "vitest";
import { calculateVirluxFee, calculateReceiveAmount } from "./fees";

describe("fees", () => {
  it("applies 1% virlux fee", () => {
    expect(calculateVirluxFee(1000)).toBe(10);
  });

  it("calculates receive amount after fee and gas", () => {
    const { amountOut, feeAmount } = calculateReceiveAmount(1000, 0.72, 0.05, "CAD");
    expect(feeAmount).toBe(7.2);
    expect(amountOut).toBeGreaterThan(710);
    expect(amountOut).toBeLessThan(720);
  });
});
