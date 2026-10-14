"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { reorderStages } from "@/features/trips/stage-actions";

export const STAGE_HANDLE = "stage-handle";

type Item = { id: string; node: ReactNode };

function moved<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export function SortableStages({
  tripId,
  items,
  sortable,
}: {
  tripId: string;
  items: Item[];
  sortable: boolean;
}) {
  const list = useRef<HTMLOListElement>(null);
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const latest = useRef(order);

  useEffect(() => {
    latest.current = order;
  }, [order]);

  useEffect(() => {
    const element = list.current;
    if (!element || !sortable) return;
    let cancelled = false;
    let instance: { destroy: () => void } | null = null;
    import("sortablejs").then(({ default: Sortable }) => {
      if (cancelled) return;
      instance = Sortable.create(element, {
        handle: `.${STAGE_HANDLE}`,
        animation: 160,
        ghostClass: "opacity-40",
        chosenClass: "shadow-card",
        onEnd: ({ item, from, oldIndex, newIndex }) => {
          if (oldIndex === undefined || newIndex === undefined) return;
          if (oldIndex === newIndex) return;
          // React owns this list: put the node back and let state reorder it.
          from.removeChild(item);
          from.insertBefore(item, from.children[oldIndex] ?? null);
          const next = moved(latest.current, oldIndex, newIndex);
          setOrder(next);
          void reorderStages(tripId, next);
        },
      });
    });
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [tripId, sortable]);

  const byId = new Map(items.map((item) => [item.id, item.node]));

  return (
    <ol ref={list} className="flex flex-col gap-4 [counter-reset:stage]">
      {order
        .filter((id) => byId.has(id))
        .map((id) => (
          <li
            key={id}
            className="bg-cream flex flex-col rounded-[22px] [counter-increment:stage]"
          >
            {byId.get(id)}
          </li>
        ))}
    </ol>
  );
}
