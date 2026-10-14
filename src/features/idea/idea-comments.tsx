"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useId, useState } from "react";
import { Avatar, type AvatarColor } from "@/components/avatar";
import { Collapse } from "@/components/collapse";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SendIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { addComment, type CommentFormState } from "@/features/trips/actions";
import { deleteComment } from "@/features/trips/removal-actions";
import { formatTimeAgo } from "@/features/trips/time";
import type { Comment } from "@/features/trips/types";
import { MAX_COMMENT_LENGTH } from "@/features/trips/validation";

const LATEST = 2;

const IDLE: CommentFormState = { status: "idle" };

export function IdeaComments({
  tripId,
  comments,
  now,
  canDelete,
  colorOf,
}: {
  tripId: string;
  comments: Comment[];
  now: number;
  colorOf: (id: string | null) => AvatarColor | null;
  canDelete: (comment: Comment) => boolean;
}) {
  const t = useTranslations("Idea");
  const tr = useTranslations("Removal");
  const time = useTranslations("Time");
  const [expanded, setExpanded] = useState(false);
  const older = comments.slice(0, -LATEST);
  const latest = comments.slice(-LATEST);
  const ago = (date: string) =>
    formatTimeAgo(
      (key, values) => time(key as Parameters<typeof time>[0], values),
      date,
      now,
    );

  const row = (comment: Comment) => {
    const name = comment.authorName || t("someone");
    return (
      <li key={comment.id} className="flex items-start gap-2.5">
        <Avatar
          name={name}
          color={colorOf(comment.authorId)}
          className="size-8 text-xs"
        />
        <div className="flex min-w-0 grow flex-col gap-[3px] rounded-[4px_16px_16px_16px] bg-[#F1F2EC] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <p className="text-ink grow text-[12.5px] leading-[1.2] font-extrabold">
              {name}{" "}
              <span className="text-muted font-semibold">
                ·{" "}
                <time dateTime={comment.createdAt}>
                  {ago(comment.createdAt)}
                </time>
              </span>
            </p>
            {canDelete(comment) && (
              <ConfirmDialog
                title={tr("comment.title")}
                body={tr("comment.body")}
                confirmLabel={tr("comment.confirm")}
                onConfirm={() => deleteComment(tripId, comment.id)}
                trigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    aria-label={tr("comment.action")}
                    className="text-muted hover:text-danger focus-ring -m-1.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                )}
              />
            )}
          </div>
          <p className="text-sm leading-[1.45] break-words whitespace-pre-line text-[#2B3530]">
            {comment.body}
          </p>
        </div>
      </li>
    );
  };

  return (
    <section aria-labelledby="idea-comments" className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2
          id="idea-comments"
          className="font-display text-ink text-[19px] leading-[1.2] font-semibold"
        >
          {t("comments")}
        </h2>
        <span className="text-muted text-[13px] font-extrabold">
          {comments.length}
        </span>
      </div>
      {comments.length === 0 && (
        <p className="text-muted text-sm leading-[1.45]">{t("noComments")}</p>
      )}
      {older.length > 0 && (
        <Collapse open={expanded} className="-mb-3">
          <ol className="flex flex-col gap-3 pb-3">{older.map(row)}</ol>
        </Collapse>
      )}
      {latest.length > 0 && (
        <ol className="flex flex-col gap-3">{latest.map(row)}</ol>
      )}
      {!expanded && comments.length > LATEST && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="focus-ring text-forest-dark hover:text-moss h-[34px] cursor-pointer self-start rounded-lg px-1 text-[13.5px] font-extrabold"
        >
          {t("showAll", { count: comments.length })}
        </button>
      )}
    </section>
  );
}

export function CommentComposer({
  tripId,
  ideaId,
}: {
  tripId: string;
  ideaId: string;
}) {
  const t = useTranslations("Idea");
  const locale = useLocale();
  const errorId = useId();
  const [state, action, pending] = useActionState(addComment, IDLE);
  const failed = state.status === "error" && state.error;

  return (
    <form action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="border-stone focus-within:border-forest-dark flex h-[50px] items-center gap-2 rounded-[25px] border-[1.5px] bg-white pr-1.5 pl-4 transition-colors">
        <input
          type="text"
          name="body"
          defaultValue={state.status === "error" ? state.body : ""}
          maxLength={MAX_COMMENT_LENGTH}
          autoComplete="off"
          aria-label={t("composer")}
          placeholder={t("composer")}
          aria-invalid={failed ? true : undefined}
          aria-describedby={failed ? errorId : undefined}
          className="text-ink placeholder:text-muted h-11 min-w-0 grow bg-transparent text-[15px] outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={t("send")}
          className="focus-ring bg-forest-dark text-cream hover:bg-moss flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-wait"
        >
          {pending ? (
            <SpinnerIcon className="size-[18px] animate-spin" />
          ) : (
            <SendIcon className="size-[18px]" strokeWidth={2.2} />
          )}
        </button>
      </div>
      <p
        id={errorId}
        role="status"
        className="text-danger px-4 text-xs font-bold empty:hidden"
      >
        {failed ? t(`errors.${failed}`, { max: MAX_COMMENT_LENGTH }) : ""}
      </p>
    </form>
  );
}
