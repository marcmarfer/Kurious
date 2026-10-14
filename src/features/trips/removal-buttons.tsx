"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteAccount,
  deleteTrip,
  leaveTrip,
  removeMember,
} from "./removal-actions";

const QUIET =
  "border-stone text-danger hover:border-danger focus-ring h-11 cursor-pointer rounded-[14px] border-[1.5px] bg-white px-4 font-extrabold";
const SMALL =
  "border-line text-muted hover:border-danger hover:text-danger focus-ring h-9 shrink-0 cursor-pointer rounded-full border bg-white px-3.5 text-[13px] font-bold";

export function RemoveMemberButton({
  tripId,
  userId,
  name,
}: {
  tripId: string;
  userId: string;
  name: string;
}) {
  const t = useTranslations("Removal");

  return (
    <ConfirmDialog
      title={t("member.title", { name })}
      body={t("member.body")}
      confirmLabel={t("member.confirm")}
      onConfirm={() => removeMember(tripId, userId)}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          aria-label={t("member.label", { name })}
          className={SMALL}
        >
          {t("member.action")}
        </button>
      )}
    />
  );
}

export function LeaveTripButton({
  tripId,
  tripName,
}: {
  tripId: string;
  tripName: string;
}) {
  const t = useTranslations("Removal");
  const locale = useLocale();

  return (
    <ConfirmDialog
      title={t("leave.title", { name: tripName })}
      body={t("leave.body")}
      confirmLabel={t("leave.action")}
      onConfirm={() => leaveTrip(tripId, locale)}
      trigger={(open) => (
        <button type="button" onClick={open} className={`${QUIET} w-full`}>
          {t("leave.action")}
        </button>
      )}
    />
  );
}

function DangerZone({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="border-danger/30 bg-cream flex flex-col gap-3 rounded-[22px] border p-5">
      <h2 className="font-display text-danger text-lg font-semibold">
        {title}
      </h2>
      <p className="text-muted text-sm leading-[1.5]">{hint}</p>
      {children}
    </section>
  );
}

export function DeleteTripSection({
  tripId,
  tripName,
}: {
  tripId: string;
  tripName: string;
}) {
  const t = useTranslations("Removal");
  const locale = useLocale();

  return (
    <DangerZone title={t("trip.title")} hint={t("trip.hint")}>
      <ConfirmDialog
        title={t("trip.confirmTitle", { name: tripName })}
        body={t("trip.body")}
        confirmLabel={t("trip.action")}
        typeToConfirm={tripName}
        onConfirm={() => deleteTrip(tripId, locale)}
        trigger={(open) => (
          <button
            type="button"
            onClick={open}
            className={`${QUIET} self-start`}
          >
            {t("trip.action")}
          </button>
        )}
      />
    </DangerZone>
  );
}

export function DeleteAccountSection({ email }: { email: string }) {
  const t = useTranslations("Settings");
  const locale = useLocale();

  return (
    <DangerZone title={t("deleteTitle")} hint={t("deleteHint")}>
      <ConfirmDialog
        title={t("deleteConfirmTitle")}
        body={t("deleteBody")}
        confirmLabel={t("deleteAction")}
        typeToConfirm={email}
        onConfirm={() => deleteAccount(locale)}
        trigger={(open) => (
          <button
            type="button"
            onClick={open}
            className={`${QUIET} self-start`}
          >
            {t("deleteAction")}
          </button>
        )}
      />
    </DangerZone>
  );
}
