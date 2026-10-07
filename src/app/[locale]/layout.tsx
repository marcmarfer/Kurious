import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

// next/font serves the fonts from our own domain: browsers never call Google.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: { default: "Kurious", template: "%s · Kurious" },
    description: t("description"),
    applicationName: "Kurious",
  };
}

export const viewport: Viewport = {
  themeColor: "#1d4736",
};

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
