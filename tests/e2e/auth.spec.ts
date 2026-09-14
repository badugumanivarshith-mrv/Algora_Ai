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

    // Open Sign In modal (which is extremely stable on all screen sizes)
    const signInButton = page.locator("nav button").filter({ hasText: "Sign in" });
    await signInButton.click();

    // Switch to Sign Up mode dynamically using the modal's internal toggle button
    await page.click('button:has-text("Sign up")');

    // Verify registration mode header is active and visible
    const modalHeading = page.locator("h2").filter({ hasText: "Create your Algora account" });
    await expect(modalHeading).toBeVisible();

    // Fill registration inputs
    await page.fill('input[placeholder="you@example.com"]', testEmail);
    await page.fill('input[placeholder="alex_coder"]', testUsername);
    await page.fill('input[placeholder="••••••••"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard/app landing
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify that the Dashboard elements are visible safely
    await expect(page.locator("h1", { hasText: "Dashboard" })).toBeVisible();
    await expect(page.getByText("My Profile", { exact: true })).toBeVisible();
  });

  test("should logout from the active session successfully", async ({ page }) => {
    await page.goto("/");

    // Open Auth modal and switch to registration mode to create a temp user
    await page.locator("nav button").filter({ hasText: "Sign in" }).click();
    await page.click('button:has-text("Sign up")');

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
    await expect(page.locator("nav button").filter({ hasText: "Sign in" })).toBeVisible();
  });

  test("should login successfully with registered credentials", async ({ page }) => {
    await page.goto("/");

    // Click "Sign in" button in the navbar
    const signInButton = page.locator("nav button").filter({ hasText: "Sign in" });
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
    await expect(page.locator("h1", { hasText: "Dashboard" })).toBeVisible();
  });
});


