"use client";

import { ChevronLeftIcon } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";

export function BackButton({
  label,
  fallback,
  className = "",
}: {
  label: string;
  fallback: string;
  className?: string;
}) {
  const router = useRouter();
  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={back}
      aria-label={label}
      className={`text-ink hover:bg-fog focus-ring flex size-11 cursor-pointer items-center justify-center rounded-full ${className}`}
    >
      <ChevronLeftIcon className="size-6" strokeWidth={2.4} />
    </button>
  );
}
