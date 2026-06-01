import { test, expect } from "@playwright/test";

test.describe("approval flow", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  async function login(page: import("@playwright/test").Page, email: string, password: string) {
    await page.goto("/");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  }

  test("maker-checker approve over threshold", async ({ browser }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo + approver accounts");

    const sender = await browser.newPage();
    await login(sender, "demo@virlux.com", "demo12345");
    await sender.getByRole("link", { name: "Send", exact: true }).click();

    await sender.locator('input[type="number"]').first().fill("150");
    await sender.getByRole("button", { name: "Confirm rate" }).click();
    await expect(sender.getByText(/Recipient receives/i)).toBeVisible({ timeout: 10000 });
    await sender.getByPlaceholder("Recipient name").fill("Approval Test Supplier");
    await sender.getByRole("button", { name: "Send payment" }).click();
    await expect(sender.getByText(/Pending approval|Payment sent/i)).toBeVisible({ timeout: 15000 });

    const approver = await browser.newPage();
    await login(approver, "approver@virlux.demo", "demo12345");
    await approver.getByRole("link", { name: /Approvals/i }).click();
    await expect(approver.getByRole("heading", { name: /Approvals/i })).toBeVisible();
    await approver.getByRole("button").filter({ hasText: /CAD|150/ }).first().click();
    await approver.getByRole("button", { name: "Approve" }).click();
    await expect(approver.getByText(/Payment approved|approved/i)).toBeVisible({ timeout: 15000 });

    await sender.close();
    await approver.close();
  });
});
