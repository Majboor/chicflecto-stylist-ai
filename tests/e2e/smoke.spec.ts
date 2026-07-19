import { test, expect } from "@playwright/test";

// Smoke coverage of the public shell and the auth gate. These run against the
// production build (vite preview) so they exercise the real bundled routing.

test("home page renders the hero and core chrome", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ChicFlecto/i);

  // Hero headline is split across spans; match the hero h1 specifically
  // (the header logo is also an h1).
  await expect(
    page.getByRole("heading", { level: 1, name: /Elevate Your Style/i })
  ).toBeVisible();

  // Footer is part of the persistent app chrome.
  await expect(page.locator("footer")).toBeVisible();
});

test("navigating to a protected route redirects unauthenticated users to /auth", async ({
  page,
}) => {
  await page.goto("/outfits");
  await page.waitForURL(/\/auth$/, { timeout: 15_000 });
  expect(new URL(page.url()).pathname).toBe("/auth");
});

test("unknown routes render the 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByText("404 Error")).toBeVisible();
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});
