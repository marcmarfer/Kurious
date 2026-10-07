"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export function AutoHeight({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const pathname = usePathname();
  const [page, setPage] = useState({ pathname, navigated: false });
  if (page.pathname !== pathname) setPage({ pathname, navigated: true });

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.borderBoxSize[0].blockSize),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // The negative margin and matching padding leave room for focus rings inside the clipped box.
  return (
    <div
      style={{ height }}
      className="-m-2 overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
    >
      <div ref={contentRef} className="p-2">
        <div
          key={pathname}
          className={
            page.navigated ? "animate-fade-in motion-reduce:animate-none" : ""
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
