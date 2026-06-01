import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockConfig } = vi.hoisted(() => ({
  mockConfig: {
    isProd: true,
    settlementMode: "partner" as const,
    circleApiKey: "test-circle-api-key-long-enough",
    circleWalletId: "wallet-123",
  },
}));

vi.mock("../../lib/config", () => ({
  config: mockConfig,
  circleConfigured: () => mockConfig.circleApiKey.length > 10,
}));

import { isCircleEnabled } from "./client";

describe("isCircleEnabled", () => {
  beforeEach(() => {
    mockConfig.isProd = true;
    mockConfig.settlementMode = "partner";
    mockConfig.circleApiKey = "test-circle-api-key-long-enough";
    mockConfig.circleWalletId = "wallet-123";
  });

  it("returns false in production partner mode even when Circle is configured", () => {
    expect(isCircleEnabled()).toBe(false);
  });

  it("returns false in production when settlement is disabled", () => {
    mockConfig.settlementMode = "disabled";
    expect(isCircleEnabled()).toBe(false);
  });

  it("returns true in non-prod when Circle credentials exist", () => {
    mockConfig.isProd = false;
    mockConfig.settlementMode = "sandbox";
    expect(isCircleEnabled()).toBe(true);
  });
});
