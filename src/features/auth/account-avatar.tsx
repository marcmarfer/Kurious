"use client";

import { useTranslations } from "next-intl";
import { createContext, useContext, type ReactNode } from "react";
import { Avatar, type AvatarColor } from "@/components/avatar";
import { Link } from "@/i18n/navigation";

type Account = { name: string; color: AvatarColor | null };

const AccountName = createContext<Account | null>(null);

export function AccountNameProvider({
  name,
  color,
  children,
}: {
  name: string;
  color: AvatarColor | null;
  children: ReactNode;
}) {
  return <AccountName value={{ name, color }}>{children}</AccountName>;
}

export function AccountAvatarLink({ className = "" }: { className?: string }) {
  const t = useTranslations("Nav");
  const account = useContext(AccountName);
  if (!account) return null;

  return (
    <Link
      href="/settings"
      aria-label={t("settings")}
      className={`focus-ring shrink-0 rounded-full lg:hidden ${className}`}
    >
      <Avatar
        name={account.name}
        color={account.color}
        className="size-9 border-2 border-white text-[13px]"
      />
    </Link>
  );
}
