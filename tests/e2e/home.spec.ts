import { expect, test } from "@playwright/test";

test.describe("browser in Spanish", () => {
  test.use({ locale: "es-ES" });

  test("signed out, the home page is the login in Spanish with no prefix", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/login");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(
      page.getByRole("heading", { name: "Hola de nuevo" }),
    ).toBeVisible();
  });
});

test.describe("browser in Portuguese", () => {
  test.use({ locale: "pt-BR" });

  test("is sent to /pt", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/pt/login");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });
});

test("unknown paths show the translated not-found page", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page does not exist" }),
  ).toBeVisible();
});

test("the app can be installed", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    name: "Kurious",
    display: "standalone",
  });
});
