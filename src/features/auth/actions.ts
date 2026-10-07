"use server";

import { hasLocale } from "next-intl";
import { headers } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { authErrorKey, type AuthErrorKey } from "./errors";
import {
  safeNextPath,
  validateLogin,
  validateSignup,
  type FieldErrors,
} from "./validation";

export type AuthFormState = {
  status: "idle" | "error" | "check-email";
  error?: AuthErrorKey;
  fieldErrors?: FieldErrors;
  values?: { name?: string; email?: string };
};

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

// Server Actions cannot call getLocale(): next/root-params only works while rendering.
function formLocale(formData: FormData) {
  const value = formData.get("locale");
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const fieldErrors = validateLogin({ email, password });
  if (fieldErrors) return { status: "error", fieldErrors, values };
  if (!hasSupabaseEnv)
    return { status: "error", error: "notConfigured", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    return { status: "error", error: authErrorKey(error.code), values };

  return redirect({
    href: safeNextPath(text(formData, "next")),
    locale: formLocale(formData),
  });
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  const fieldErrors = validateSignup({ name, email, password });
  if (fieldErrors) return { status: "error", fieldErrors, values };
  if (!hasSupabaseEnv)
    return { status: "error", error: "notConfigured", values };

  const locale = formLocale(formData);
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, locale },
      emailRedirectTo: origin ? `${origin}/auth/confirm` : undefined,
    },
  });
  if (error)
    return { status: "error", error: authErrorKey(error.code), values };

  if (data.session) redirect({ href: "/", locale });
  return { status: "check-email", values: { email } };
}

export async function signOut(formData: FormData) {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect({ href: "/", locale: formLocale(formData) });
}
