"use client";

import { useActionState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Seed } from "@/components/seed";
import { signUp, type AuthFormState } from "./actions";
import { Field, FormAlert, PasswordInput, SubmitButton } from "./form-parts";
import { MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "./validation";

export function SignupForm({
  disabled,
  heading,
}: {
  disabled?: boolean;
  heading: ReactNode;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    { status: "idle" },
  );
  const fieldError = state.fieldErrors;

  if (state.status === "check-email") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-2 text-center"
      >
        <Seed className="h-16 w-12" />
        <h1 className="font-display text-ink text-[1.75rem] leading-tight font-semibold">
          {t("checkEmailTitle")}
        </h1>
        <p className="text-muted">
          {t.rich("checkEmailBody", {
            email: state.values?.email ?? "",
            strong: (chunks) => <strong className="text-ink">{chunks}</strong>,
          })}
        </p>
      </div>
    );
  }

  return (
    <>
      {heading}
      <form action={action} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
        <Field
          label={t("name")}
          name="name"
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          placeholder={t("namePlaceholder")}
          defaultValue={state.values?.name}
          error={fieldError?.name && t(`errors.${fieldError.name}`)}
          required
        />
        <Field
          label={t("email")}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t("emailPlaceholder")}
          defaultValue={state.values?.email}
          error={fieldError?.email && t(`errors.${fieldError.email}`)}
          required
        />
        <Field
          label={t("password")}
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          hint={t("passwordHint", { min: MIN_PASSWORD_LENGTH })}
          error={
            fieldError?.password &&
            t(`errors.${fieldError.password}`, { min: MIN_PASSWORD_LENGTH })
          }
          required
        >
          {(input) => (
            <PasswordInput
              {...input}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
            />
          )}
        </Field>
        <div className="pt-2">
          <SubmitButton pending={pending} disabled={disabled}>
            {pending ? t("signupPending") : t("signupSubmit")}
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
