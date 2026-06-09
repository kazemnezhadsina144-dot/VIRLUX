import { test, expect, type Page } from "@playwright/test";

/** Submit login form (avoids mode-toggle "Sign in" tab button). */
export async function submitSignIn(page: Page) {
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
}

export async function fillDemoLogin(page: Page) {
  await page.locator('form input[type="email"]').fill("demo@virlux.com");
  await page.locator('form input[type="password"]').fill("demo12345");
}

/** Sidebar links include icon glyphs in accessible name — use regex, not exact. */
export function asideNav(page: Page) {
  return page.locator("aside nav");
}

export async function loginAsDemo(page: Page) {
  await loginAsUser(page, "demo@virlux.com", "demo12345");
}

export async function loginAsUser(page: Page, email: string, password: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto("/");
    await page.locator('form input[type="email"]').fill(email);
    await page.locator('form input[type="password"]').fill(password);
    await submitSignIn(page);
    try {
      await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
      return;
    } catch (err) {
      const rateLimited = await page.getByText(/too many|rate limit|try again/i).isVisible().catch(() => false);
      if (attempt === 2 || !rateLimited) throw err;
      await page.waitForTimeout(3000 * (attempt + 1));
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
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(protectedPath, { waitUntil: "domcontentloaded" });
    await expect(page.locator('form input[type="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\?next=/, { timeout: 15000 });

    await page.locator('form input[type="email"]').fill(email);
    await page.locator('form input[type="password"]').fill(password);
    await submitSignIn(page);

    try {
      await expect(page).toHaveURL(new RegExp(`${protectedPath.replace(/\//g, "\\/")}$`), {
        timeout: 20000,
      });
      return;
    } catch (err) {
      const rateLimited = await page.getByText(/too many|rate limit|try again/i).isVisible().catch(() => false);
      if (attempt === 2 || !rateLimited) throw err;
      await page.waitForTimeout(3000 * (attempt + 1));
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
