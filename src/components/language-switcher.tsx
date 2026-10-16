"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { ChevronDownIcon, GlobeIcon } from "@/components/icons";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const SEARCH_FROM = 8;

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const searchable = routing.locales.length >= SEARCH_FROM;

  const options = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return routing.locales.filter(
      (option) =>
        !q ||
        t(`names.${option}`).toLocaleLowerCase().includes(q) ||
        t(`inCurrent.${option}`).toLocaleLowerCase().includes(q),
    );
  }, [query, t]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open && !searchable) list.current?.focus();
  }, [open, searchable]);

  function toggle() {
    setQuery("");
    setActive(Math.max(0, routing.locales.indexOf(locale)));
    setOpen((value) => !value);
  }

  function choose(next: Locale) {
    setOpen(false);
    button.current?.focus();
    if (next === locale) return;
    startTransition(() => {
      router.replace(`${pathname}${window.location.search}`, { locale: next });
    });
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (event.key === "Enter" && options[active]) {
      event.preventDefault();
      choose(options[active]);
    }
  }

  return (
    <div ref={root} className={`relative w-full max-w-xs ${className}`}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("label")}: ${t(`names.${locale}`)}`}
        disabled={pending}
        onClick={toggle}
        className="border-stone text-ink hover:border-forest-dark focus-ring flex h-12 w-full cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] bg-white px-3.5 font-bold disabled:cursor-wait"
      >
        <GlobeIcon className="text-forest-dark size-5" strokeWidth={2} />
        <span className="grow text-left" lang={locale}>
          {t(`names.${locale}`)}
        </span>
        <ChevronDownIcon
          className={`text-muted size-4 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.4}
        />
      </button>

      {open && (
        <div
          className="border-line shadow-card absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-[16px] border bg-white"
          onKeyDown={onKeyDown}
        >
          {searchable && (
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              placeholder={t("search")}
              aria-label={t("search")}
              aria-controls={listId}
              className="border-line text-ink w-full border-b px-4 py-3 text-sm outline-none"
            />
          )}
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={t("label")}
            aria-activedescendant={
              options[active] ? `${listId}-${options[active]}` : undefined
            }
            className="flex max-h-72 flex-col overflow-y-auto py-1.5 outline-none"
          >
            {options.map((option, index) => {
              const selected = option === locale;
              return (
                <li
                  key={option}
                  id={`${listId}-${option}`}
                  role="option"
                  aria-selected={selected}
                  lang={option}
                  onPointerEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={`text-ink flex cursor-pointer items-center gap-3 px-4 py-2.5 font-bold ${index === active ? "bg-paper" : ""}`}
                >
                  <span className="flex grow flex-col">
                    <span>{t(`names.${option}`)}</span>
                    {option !== locale && (
                      <span
                        className="text-muted text-xs font-semibold"
                        lang={locale}
                      >
                        {t(`inCurrent.${option}`)}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="text-forest-dark size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </li>
              );
            })}
            {options.length === 0 && (
              <li className="text-muted px-4 py-3 text-sm">{t("noResults")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
