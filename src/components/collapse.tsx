"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

const OPEN_MS = 300;
const CLOSE_MS = 200;
const MIN_MS = 80;

function settle(panel: HTMLElement, open: boolean) {
  panel.style.height = open ? "auto" : "0px";
  panel.style.opacity = open ? "1" : "0";
  panel.style.overflow = open ? "" : "hidden";
}

export function Collapse({
  open,
  className,
  children,
}: {
  open: boolean;
  className?: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const element = panel.current;
    const body = content.current;
    if (!element || !body) return;
    if (!mounted.current) {
      mounted.current = true;
      settle(element, open);
      return;
    }

    const fromHeight = element.getBoundingClientRect().height;
    const fromOpacity = Number(getComputedStyle(element).opacity);
    animation.current?.cancel();
    animation.current = null;

    element.style.overflow = "hidden";
    element.style.height = `${fromHeight}px`;
    element.style.opacity = String(fromOpacity);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(element, open);
      return;
    }

    const natural = body.getBoundingClientRect().height;
    const targetHeight = open ? natural : 0;
    const progress = Math.min(
      1,
      Math.abs(targetHeight - fromHeight) / (natural || 1),
    );
    const running = element.animate(
      [
        { height: `${fromHeight}px`, opacity: fromOpacity },
        { height: `${targetHeight}px`, opacity: open ? 1 : 0 },
      ],
      {
        duration: Math.max(MIN_MS, (open ? OPEN_MS : CLOSE_MS) * progress),
        easing: open ? "ease-out" : "ease-in",
        fill: "forwards",
      },
    );
    animation.current = running;
    running.onfinish = () => {
      settle(element, open);
      running.cancel();
      if (animation.current === running) animation.current = null;
    };
  }, [open]);

  useEffect(
    () => () => {
      animation.current?.cancel();
      animation.current = null;
    },
    [],
  );

  return (
    <div ref={panel} className={className}>
      <div ref={content} inert={!open || undefined}>
        {children}
      </div>
    </div>
  );
}
