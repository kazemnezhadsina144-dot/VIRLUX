import { test, expect, type Page } from "@playwright/test";
import { resolveE2eDemoPassword } from "@virlux/shared";

const DEMO_PASSWORD = resolveE2eDemoPassword();

/** Submit login form (avoids mode-toggle "Sign in" tab button). */
export async function submitSignIn(page: Page) {
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
}

export async function fillDemoLogin(page: Page) {
  await page.locator('form input[type="email"]').fill("demo@virlux.com");
  await page.locator('form input[type="password"]').fill(DEMO_PASSWORD);
}

/** Sidebar links include icon glyphs in accessible name — use regex, not exact. */
export function asideNav(page: Page) {
  return page.locator("aside nav");
}

export async function loginAsDemo(page: Page) {
  await loginAsUser(page, "demo@virlux.com", DEMO_PASSWORD);
}

export async function loginAsUser(page: Page, email: string, password: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto("/");
    await page.locator('form input[type="email"]').fill(email);
    await page.locator('form input[type="password"]').fill(password);
    await submitSignIn(page);
    try {
      await expect(page).toHaveURL(/dashboard/, { timeout: 25000 });
      return;
    } catch (err) {
      const rateLimited = await page.getByText(/too many|rate limit|try again/i).isVisible().catch(() => false);
      if (attempt === 3 || !rateLimited) throw err;
      await page.waitForTimeout(5000 * (attempt + 1));
    }
  }
}

/** Skip when custom domain serves /lander stub instead of Vercel marketing build. */
export function skipIfMarketingLander(page: Page) {
  if (page.url().includes("/lander")) {
    test.skip(
      true,
      "Marketing host redirects to /lander — set PLAYWRIGHT_WEB_URL=https://virlux-web.vercel.app"
    );
  }
}

/**
 * Login after middleware redirect (?next=). Retries on live rate limits (INC-004).
 */
export async function loginFromNextRedirect(
  page: Page,
  protectedPath: string,
  email: string,
  password: string
) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(protectedPath, { waitUntil: "domcontentloaded" });
    await expect(page.locator('form input[type="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\?next=/, { timeout: 15000 });

    await page.locator('form input[type="email"]').fill(email);
    await page.locator('form input[type="password"]').fill(password);
    await submitSignIn(page);

    try {
      await expect(page).toHaveURL(new RegExp(`${protectedPath.replace(/\//g, "\\/")}$`), {
        timeout: 25000,
      });
      return;
    } catch (err) {
      const rateLimited = await page.getByText(/too many|rate limit|try again/i).isVisible().catch(() => false);
      if (attempt === 3 || !rateLimited) throw err;
      await page.waitForTimeout(5000 * (attempt + 1));
    }
  }
}

/** Add demo balance when deposits page exposes the control (staging / demo mode). */
export async function tryAddDemoFunds(page: Page) {
  await page.goto("/dashboard/deposits");
  const demoFund = page.getByRole("button", { name: /Add demo funds/i });
  if (await demoFund.isVisible()) {
    await demoFund.click();
    await page.getByText(/Demo balance added|added/i).waitFor({ timeout: 10000 });
  }
}

/** Navigate to Send — direct URL avoids flaky sidebar animation (INC-005). */
export async function goToSend(page: Page) {
  await goToPage(page, "/dashboard/send", /Send payment/i);
}

/** Direct navigation + wait for primary heading (stable vs sidebar clicks). */
export async function goToPage(page: Page, path: string, heading: RegExp) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({ timeout: 20000 });
}
