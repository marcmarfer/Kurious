import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "./actions";
import { getCurrentUser } from "./session";

export async function AccountMenu() {
  const t = await getTranslations("Auth");
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="border-line bg-cream/95 text-forest-dark shadow-card focus-ring flex h-11 items-center gap-2 rounded-full border px-4 font-bold"
      >
        <UserIcon />
        {t("tabLogin")}
      </Link>
    );
  }

  const locale = await getLocale();
  const shown = user.name || user.email;
  return (
    <details className="group relative">
      <summary
        aria-label={t("accountLabel")}
        className="bg-forest-dark text-cream shadow-card font-display focus-ring flex size-11 cursor-pointer list-none items-center justify-center rounded-full border-2 border-white text-xl font-semibold [&::-webkit-details-marker]:hidden"
      >
        {shown.charAt(0).toUpperCase()}
      </summary>
      <div className="border-line bg-cream shadow-card absolute right-0 mt-2 w-64 rounded-2xl border p-4">
        <p className="text-ink truncate font-bold">{shown}</p>
        {user.name && (
          <p className="text-muted truncate text-sm">{user.email}</p>
        )}
        <form action={signOut} className="mt-3">
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="border-line text-ink hover:border-forest-dark focus-ring h-11 w-full rounded-full border bg-white font-bold"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </details>
  );
}

function UserIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
