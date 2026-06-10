import { test, expect } from "@playwright/test";
import { resolveE2eDemoPassword } from "@virlux/shared";
import { asideNav, loginAsDemo, loginAsUser, tryAddDemoFunds, goToSend } from "./helpers";

const DEMO_PASSWORD = resolveE2eDemoPassword();

test.describe("approval flow", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test("maker-checker approve over threshold", async ({ browser }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo + approver accounts");
    test.setTimeout(120_000);

    const sender = await browser.newPage();
    await loginAsDemo(sender);
    await tryAddDemoFunds(sender);
    await goToSend(sender);

    await sender.locator('input[type="number"]').first().fill("150");
    await sender.getByRole("button", { name: "Confirm rate" }).click();
    await expect(sender.getByText(/Recipient receives/i)).toBeVisible({ timeout: 10000 });
    await sender.getByPlaceholder("Recipient name").fill("Approval Test Supplier");
    await sender.getByText("Recipient payout details").click();
    await sender.getByPlaceholder("Bank or payout reference").fill("0x" + "b".repeat(40));
    await sender.getByRole("button", { name: "Send payment" }).click();
    await expect(
      sender.getByText(/Pending approval|Payment sent|deposit is required/i)
    ).toBeVisible({ timeout: 15000 });

    const pending = sender.getByText(/Pending approval/i);
    if (!(await pending.isVisible())) {
      await sender.close();
      return;
    }

    await sender.waitForTimeout(2000);

    const approver = await browser.newPage();
    await loginAsUser(approver, "approver@virlux.demo", DEMO_PASSWORD);
    await asideNav(approver).getByRole("link", { name: /Approvals/i }).click();
    await expect(approver.getByRole("heading", { name: /Approvals/i })).toBeVisible();
    await approver.getByRole("button").filter({ hasText: /CAD|150/ }).first().click();
    await approver.getByRole("button", { name: "Approve" }).click();
    await expect(approver.getByText(/Payment approved|approved/i)).toBeVisible({ timeout: 15000 });

    await sender.close();
    await approver.close();
  });
});
