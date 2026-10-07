import { Araucaria } from "@/components/araucaria";
import { MapPaper } from "@/components/map-paper";
import { AuthCard } from "@/features/auth/auth-card";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center overflow-hidden px-4 pt-8 pb-10 sm:justify-center">
      <MapPaper className="absolute inset-0 -z-10 h-full w-full" />
      <div className="flex w-full max-w-[420px] flex-col items-center">
        <Link
          href="/"
          className="focus-ring flex flex-col items-center rounded-3xl px-4 pb-5 text-center"
        >
          <Araucaria className="h-28 w-21 sm:h-32 sm:w-24" />
          <span className="font-display text-forest-dark mt-1 text-[2.5rem] leading-none font-semibold">
            Kurious
          </span>
        </Link>
        <AuthCard>{children}</AuthCard>
      </div>
    </main>
  );
}
