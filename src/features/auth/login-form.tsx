"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signIn, type AuthFormState } from "./actions";
import type { AuthErrorKey } from "./errors";
import { Field, FormAlert, PasswordInput, SubmitButton } from "./form-parts";

export function LoginForm({
  next,
  initialError,
  disabled,
}: {
  next?: string;
  initialError?: AuthErrorKey;
  disabled?: boolean;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    { status: "idle", error: initialError },
  );
  const fieldError = state.fieldErrors;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
      {next && <input type="hidden" name="next" value={next} />}
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
        autoComplete="current-password"
        error={fieldError?.password && t(`errors.${fieldError.password}`)}
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
          {pending ? t("loginPending") : t("loginSubmit")}
        </SubmitButton>
      </div>
    </form>
  );
}
