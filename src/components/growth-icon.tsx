import { useId } from "react";
import type { Growth } from "@/features/trips/types";
import {
  appIconDrawing,
  appIconSize,
  growthDrawing,
  scopeIds,
  type DrawingSize,
} from "./tree-drawings";

const usePrefix = () => `k${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

export function GrowthIcon({
  growth,
  className,
  size,
}: {
  growth: Growth;
  className?: string;
  size?: DrawingSize;
}) {
  const prefix = usePrefix();
  const drawing = size ?? "big";

  return (
    <svg
      viewBox="0 0 48 64"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
      className={`shrink-0 ${className ?? "h-[27px] w-5"}`}
      dangerouslySetInnerHTML={{
        __html: scopeIds(growthDrawing(growth, drawing), prefix),
      }}
    />
  );
}

export function AppIcon({
  className = "size-[46px]",
  px = 46,
}: {
  className?: string;
  px?: number;
}) {
  const prefix = usePrefix();

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={`block shrink-0 ${className}`}
      dangerouslySetInnerHTML={{
        __html: scopeIds(appIconDrawing(appIconSize(px)), prefix),
      }}
    />
  );
}
