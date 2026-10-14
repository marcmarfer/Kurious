"use client";

import { useActionState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Seed } from "@/components/seed";
import { requestPasswordReset, type AuthFormState } from "./actions";
import type { AuthErrorKey } from "./errors";
import { Field, FormAlert, SubmitButton } from "./form-parts";

export function ForgotPasswordForm({
  initialError,
  disabled,
  heading,
}: {
  initialError?: AuthErrorKey;
  disabled?: boolean;
  heading: ReactNode;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    { status: "idle", error: initialError },
  );

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
          {t.rich("forgotSentBody", {
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
          label={t("email")}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t("emailPlaceholder")}
          defaultValue={state.values?.email}
          error={
            state.fieldErrors?.email && t(`errors.${state.fieldErrors.email}`)
          }
          required
        />
        <div className="pt-2">
          <SubmitButton pending={pending} disabled={disabled}>
            {pending ? t("forgotPending") : t("forgotSubmit")}
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
