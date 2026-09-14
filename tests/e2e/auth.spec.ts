import { test, expect } from "@playwright/test";

test.describe("Authentication and User Identity Flows", () => {
  // Use a dynamic username/email to avoid collision across E2E runs
  const testEmail = `e2e_user_${Date.now()}@algora.edu`;
  const testUsername = `e2e_user_${Date.now()}`;
  const testPassword = "Password123!";

  test("should register a new student account successfully", async ({ page }) => {
    // Navigate to landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/Algora/i);

    // Click "Get started" button in the navbar to open registration
    const getStartedButton = page.locator("nav").getByRole("button", { name: /Get started/i });
    await getStartedButton.click();

    // Verify modal is visible
    await expect(page.locator("h2", { hasText: "Create your Algora account" })).toBeVisible();

    // Fill registration inputs
    await page.fill('input[placeholder="you@example.com"]', testEmail);
    await page.fill('input[placeholder="alex_coder"]', testUsername);
    await page.fill('input[placeholder="••••••••"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard/app landing
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify that the Sidebar navigation contains Dashboard elements
    await expect(page.getByText("Dashboard", { exact: true })).toBeVisible();
    await expect(page.getByText("My Profile", { exact: true })).toBeVisible();
  });

  test("should logout from the active session successfully", async ({ page }) => {
    // Navigate directly to dashboard, ensuring local storage contains our token/user mock or register
    await page.goto("/");
    await page.locator("nav").getByRole("button", { name: /Get started/i }).click();

    const tempEmail = `logout_user_${Date.now()}@algora.edu`;
    const tempUser = `logout_user_${Date.now()}`;
    await page.fill('input[placeholder="you@example.com"]', tempEmail);
    await page.fill('input[placeholder="alex_coder"]', tempUser);
    await page.fill('input[placeholder="••••••••"]', "Password123!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");

    // Click the "Sign out" sidebar link
    const signOutButton = page.getByRole("button", { name: /Sign out/i });
    await signOutButton.click();

    // Confirm that the page navigates back to the landing page '/'
    await page.waitForURL("/");
    await expect(page.locator("nav").getByRole("button", { name: /Sign in/i })).toBeVisible();
  });

  test("should login successfully with registered credentials", async ({ page }) => {
    await page.goto("/");

    // Click "Sign in" button in the navbar
    const signInButton = page.locator("nav").getByRole("button", { name: /Sign in/i });
    await signInButton.click();

    // Verify modal is visible
    await expect(page.locator("h2", { hasText: "Sign in to Algora" })).toBeVisible();

    // Fill login inputs with seeded user credentials
    await page.fill('input[placeholder="name@example.com or handle"]', "arjun_patel");
    await page.fill('input[placeholder="••••••••"]', "algora123");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Dashboard", { exact: true })).toBeVisible();
  });
});
