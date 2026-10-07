import { expect, test } from "@playwright/test";

test.describe("browser in Spanish", () => {
  test.use({ locale: "es-ES" });

  test("Spanish has no prefix and the map loads", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { name: "Kurious" })).toBeVisible();
    const map = page.getByRole("region", { name: "Mapa del viaje" });
    await expect(map).toBeVisible();
    // MapLibre's CSS once collapsed the map to 0 px high.
    const viewport = page.viewportSize();
    expect((await map.boundingBox())?.height).toBe(viewport?.height);
    await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
  });
});

test.describe("browser in Portuguese", () => {
  test.use({ locale: "pt-BR" });

  test("is sent to /pt", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/pt");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
    await expect(
      page.getByRole("region", { name: "Mapa da viagem" }),
    ).toBeVisible();
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
