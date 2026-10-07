import type { ReactNode } from "react";
import { AuthTabs } from "./auth-tabs";
import { AutoHeight } from "./auto-height";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <section className="border-line bg-cream shadow-card w-full rounded-[28px] border p-5 sm:p-7">
      <AuthTabs />
      <AutoHeight>{children}</AutoHeight>
    </section>
  );
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <p className="text-muted mt-6 text-center">{children}</p>;
}

export function CardHeading({
  title,
  subtitle,
  notice,
}: {
  title: string;
  subtitle: string;
  notice?: ReactNode;
}) {
  return (
    <>
      <h1 className="font-display text-ink text-[1.75rem] leading-tight font-semibold">
        {title}
      </h1>
      <p className="text-muted mt-1 mb-5">{subtitle}</p>
      {notice}
    </>
  );
}
