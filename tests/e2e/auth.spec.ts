import { expect, test } from "@playwright/test";
import { MOCK_AUTH_URL } from "./support/env";

test.describe("in Spanish", () => {
  test.use({ locale: "es-ES" });

  test("sign up, confirm the email, log out and log in again", async ({
    page,
    request,
  }) => {
    const email = `ana.${Date.now()}@kurious.test`;
    const password = "araucaria-2027";

    await page.goto("/");
    await page.getByRole("link", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/login");
    await page.getByRole("link", { name: "Crear cuenta" }).click();
    await expect(page).toHaveURL("/signup");

    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();

    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(
      page.getByRole("heading", { name: "Revisa tu correo" }),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    const inbox = await request.get(
      `${MOCK_AUTH_URL}/__mock/email?to=${encodeURIComponent(email)}`,
    );
    const { token_hash } = await inbox.json();
    await page.goto(`/auth/confirm?token_hash=${token_hash}&type=email`);
    await expect(page).toHaveURL("/");
    await expect(page.getByLabel("Tu cuenta")).toHaveText("A");

    await page.getByLabel("Tu cuenta").click();
    await expect(page.getByText(email)).toBeVisible();
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

    await page.getByRole("link", { name: "Entrar" }).click();
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill("not-the-one");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("alert").filter({
        hasText: "El correo o la contraseña no coinciden.",
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Correo")).toHaveValue(email);

    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByLabel("Tu cuenta")).toHaveText("A");

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("a used confirmation link explains what happened", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=already-used&type=email");

    await expect(page).toHaveURL("/login?error=link");
    await expect(
      page.getByRole("alert").filter({
        hasText:
          "El enlace ha caducado o ya se usó. Entra, o crea la cuenta de nuevo.",
      }),
    ).toBeVisible();
  });
});

test.describe("in Portuguese", () => {
  test.use({ locale: "pt-BR" });

  test("the forms are translated and the password can be shown", async ({
    page,
  }) => {
    await page.goto("/pt/signup");

    await expect(
      page.getByRole("heading", { name: "Crie sua conta" }),
    ).toBeVisible();
    const password = page.getByLabel("Senha", { exact: true });
    await password.fill("araucaria");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });
});
