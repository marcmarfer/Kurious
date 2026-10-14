"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Field, FormAlert, SubmitButton } from "@/features/auth/form-parts";
import { createTrip, updateTrip, type TripFormState } from "./actions";
import type { TripSummary } from "./types";
import { MAX_TRIP_NAME_LENGTH } from "./validation";

export function TripForm({ trip }: { trip?: TripSummary }) {
  const t = useTranslations("NewTrip");
  const te = useTranslations("EditTrip");
  const locale = useLocale();
  const [state, action, pending] = useActionState<TripFormState, FormData>(
    trip ? updateTrip.bind(null, trip.id) : createTrip,
    {
      status: "idle",
      values: trip && {
        name: trip.name,
        startsOn: trip.startsOn ?? "",
        endsOn: trip.endsOn ?? "",
      },
    },
  );
  const fieldError = state.fieldErrors;
  const submit = trip ? te("submit") : t("submit");
  const busy = trip ? te("pending") : t("pending");

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
      <Field
        label={t("name")}
        name="name"
        autoComplete="off"
        maxLength={MAX_TRIP_NAME_LENGTH}
        placeholder={t("namePlaceholder")}
        defaultValue={state.values?.name}
        error={fieldError?.name && t(`errors.${fieldError.name}`)}
        required
      />
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t("startsOn")}
            name="startsOn"
            type="date"
            defaultValue={state.values?.startsOn}
            error={fieldError?.startsOn && t(`errors.${fieldError.startsOn}`)}
          />
          <Field
            label={t("endsOn")}
            name="endsOn"
            type="date"
            defaultValue={state.values?.endsOn}
            error={fieldError?.endsOn && t(`errors.${fieldError.endsOn}`)}
          />
        </div>
        <p className="text-muted text-sm">{t("datesHint")}</p>
      </div>
      <div className="pt-2">
        <SubmitButton pending={pending}>{pending ? busy : submit}</SubmitButton>
      </div>
    </form>
  );
}
