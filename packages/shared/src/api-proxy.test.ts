import { describe, expect, it } from "vitest";
import { isInvalidApiUrl } from "./api-proxy";

describe("isInvalidApiUrl", () => {
  it("allows localhost dev URL", () => {
    expect(isInvalidApiUrl("http://localhost:3002")).toBe(false);
  });

  it("rejects placeholder URLs", () => {
    expect(isInvalidApiUrl("https://YOUR-API.up.railway.app")).toBe(true);
  });

  it("allows real Railway URLs", () => {
    expect(isInvalidApiUrl("https://virlux-api-production.up.railway.app")).toBe(false);
  });
});
