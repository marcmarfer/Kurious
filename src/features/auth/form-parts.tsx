"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

const inputClass =
  "border-line text-ink placeholder:text-muted/70 focus:border-forest-dark focus:ring-forest-dark/15 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:ring-4";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children?: (input: ComponentProps<"input">) => ReactNode;
} & Omit<ComponentProps<"input">, "name" | "children">;

export function Field({
  label,
  name,
  error,
  hint,
  children,
  ...input
}: FieldProps) {
  const id = `field-${name}`;
  const noteId = error || hint ? `${id}-note` : undefined;
  const props: ComponentProps<"input"> = {
    ...input,
    id,
    name,
    className: inputClass,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": noteId,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-bold">
        {label}
      </label>
      {children ? children(props) : <input {...props} />}
      {(error || hint) && (
        <p
          id={noteId}
          className={
            error ? "text-danger text-sm font-semibold" : "text-muted text-sm"
          }
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({
  showLabel,
  hideLabel,
  ...props
}: ComponentProps<"input"> & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${props.className} pr-13`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="text-muted hover:text-forest-dark focus-ring absolute inset-y-0 right-1 my-auto flex size-11 items-center justify-center rounded-xl"
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

export function SubmitButton({
  pending,
  disabled,
  children,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="bg-pinhao text-cream focus-ring flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg font-extrabold shadow-[0_6px_16px_rgb(142_74_42/0.28)] transition hover:bg-[#7a3e22] disabled:opacity-70"
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="bg-danger-soft text-danger rounded-2xl px-4 py-3 text-sm font-semibold"
    >
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 animate-spin" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".3"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="m3 3 18 18" />}
    </svg>
  );
}
