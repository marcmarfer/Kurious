"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  { mode: "login", href: "/login", label: "tabLogin" },
  { mode: "signup", href: "/signup", label: "tabSignup" },
] as const;

type Mode = (typeof TABS)[number]["mode"];

export function AuthTabs() {
  const t = useTranslations("Auth");
  const pathname = usePathname();
  const current: Mode = pathname.startsWith("/signup") ? "signup" : "login";
  const [clicked, setClicked] = useState<{ mode: Mode; from: string }>();
  const active = clicked?.from === pathname ? clicked.mode : current;

  return (
    <nav
      aria-label={t("tabsLabel")}
      className="relative mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#efeadb] p-1"
    >
      <span
        aria-hidden="true"
        className={`shadow-card absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
          active === "signup" ? "translate-x-[calc(100%+4px)]" : ""
        }`}
      />
      {TABS.map((tab) => (
        <Link
          key={tab.mode}
          href={tab.href}
          onClick={() => setClicked({ mode: tab.mode, from: pathname })}
          aria-current={tab.mode === current ? "page" : undefined}
          className={`focus-ring relative rounded-full px-4 py-2.5 text-center font-bold transition-colors duration-300 ${
            tab.mode === active ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
