"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updatePassword, type AuthFormState } from "./actions";
import { Field, FormAlert, PasswordInput, SubmitButton } from "./form-parts";
import { MIN_PASSWORD_LENGTH } from "./validation";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    updatePassword,
    { status: "idle" },
  );
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
      <Field
        label={t("newPassword")}
        name="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        hint={t("passwordHint", { min: MIN_PASSWORD_LENGTH })}
        error={
          passwordError &&
          t(`errors.${passwordError}`, { min: MIN_PASSWORD_LENGTH })
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
        <SubmitButton pending={pending}>
          {pending ? t("resetPending") : t("resetSubmit")}
        </SubmitButton>
      </div>
    </form>
  );
}
