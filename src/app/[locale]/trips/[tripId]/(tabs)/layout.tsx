import { MobileBar } from "@/features/trips/mobile-bar";

export default async function TripTabsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/trips/[tripId]">) {
  const { tripId } = await params;

  return (
    <>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
      <MobileBar tripId={tripId} />
    </>
  );
}
