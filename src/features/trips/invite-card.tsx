"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState, useSyncExternalStore, useTransition } from "react";
import { Collapse } from "@/components/collapse";
import { ChevronDownIcon, LinkIcon } from "@/components/icons";
import {
  createInvite,
  revokeInvite,
  type InviteResult,
} from "./invite-actions";
import { invitePath } from "./invites";

const subscribe = () => () => {};

const BUTTON =
  "focus-ring h-11 cursor-pointer rounded-[14px] px-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-60";

export function InviteCard({
  tripId,
  tripName,
  invite,
}: {
  tripId: string;
  tripName: string;
  invite: { token: string; expiresAt: string } | null;
}) {
  const t = useTranslations("Invite");
  const format = useFormatter();
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
  const canShare = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const url = invite ? `${origin}${invitePath(invite.token)}` : "";

  const run = (action: (id: string) => Promise<InviteResult>) =>
    startTransition(async () => {
      setCopied(false);
      const result = await action(tripId);
      setFailed(Boolean(result.error));
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const share = () => {
    navigator
      .share({ title: tripName, text: t("shareText", { trip: tripName }), url })
      .catch(() => undefined);
  };

  return (
    <section
      aria-labelledby="invite-title"
      className="bg-cream border-line flex flex-col rounded-[22px] border"
    >
      <h2 id="invite-title" className="m-0">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="focus-ring flex w-full cursor-pointer items-center gap-3 rounded-[22px] p-4 text-left"
        >
          <span className="bg-forest-soft text-forest-dark flex size-10 shrink-0 items-center justify-center rounded-full">
            <LinkIcon className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-ink grow text-lg leading-tight font-semibold">
            {t("title")}
          </span>
          <ChevronDownIcon
            className={`text-muted size-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h2>

      <Collapse open={open}>
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="text-muted text-sm leading-[1.4]">{t("hint")}</p>
          {invite ? (
            <>
              <p className="border-line text-ink truncate rounded-[14px] border bg-white px-3.5 py-3 text-sm font-semibold">
                {url}
              </p>
              <p className="text-muted text-[13px]">
                {t("expires", {
                  date: format.dateTime(new Date(invite.expiresAt), {
                    day: "numeric",
                    month: "long",
                  }),
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {canShare && (
                  <button
                    type="button"
                    onClick={share}
                    className={`${BUTTON} bg-pinhao text-cream`}
                  >
                    {t("share")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={copy}
                  className={`${BUTTON} ${canShare ? "border-stone text-ink border-[1.5px] bg-white" : "bg-pinhao text-cream"}`}
                >
                  {copied ? t("copied") : t("copy")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(revokeInvite)}
                  className={`${BUTTON} text-danger ml-auto`}
                >
                  {t("revoke")}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(createInvite)}
              className={`${BUTTON} bg-pinhao text-cream self-start`}
            >
              {pending ? t("creating") : t("create")}
            </button>
          )}
          {failed && (
            <p
              role="alert"
              className="bg-danger-soft text-danger rounded-xl px-3 py-2 text-sm font-semibold"
            >
              {t("failed")}
            </p>
          )}
        </div>
      </Collapse>
    </section>
  );
}
