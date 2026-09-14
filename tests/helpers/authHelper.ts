import { Page } from "@playwright/test";

/**
 * Helper to programmatically sign in a user by seeding localStorage with a JWT token.
 */
export async function authenticateProgrammatically(page: Page, token: string, user: any) {
  await page.goto("/");
  await page.evaluate(({ t, u }) => {
    localStorage.setItem("algora_token", t);
    localStorage.setItem("token", t);
    localStorage.setItem("algora_user", JSON.stringify(u));
  }, { t: token, u: user });
}
