"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { moveIdea, type ActionError } from "@/features/trips/actions";
import type { Idea } from "@/features/trips/types";
import type { LngLat } from "./trip-markers";

type Place = LngLat | null;
type Move = { id: string; from: Place; to: Place };

export type MoveNoticeState = {
  kind: "moved" | "undone" | "redone" | "failed";
  error?: ActionError;
  key: number;
};

const placeOf = (idea: Idea): Place =>
  idea.lon !== null && idea.lat !== null ? [idea.lon, idea.lat] : null;

const samePlace = (a: Place, b: Place) =>
  a === null || b === null
    ? a === b
    : Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function useIdeaMoves(tripId: string, ideas: readonly Idea[]) {
  const [overrides, setOverrides] = useState<Record<string, Place>>({});
  const [undoStack, setUndoStack] = useState<Move[]>([]);
  const [redoStack, setRedoStack] = useState<Move[]>([]);
  const [notice, setNotice] = useState<MoveNoticeState | null>(null);
  const [, startTransition] = useTransition();
  const stamp = useRef(0);

  const settled = ideas.filter(
    (idea) =>
      idea.id in overrides && samePlace(overrides[idea.id], placeOf(idea)),
  );
  if (settled.length > 0) {
    const next = { ...overrides };
    for (const idea of settled) delete next[idea.id];
    setOverrides(next);
  }

  const send = useCallback(
    (
      move: Move,
      target: Place,
      kind: MoveNoticeState["kind"],
      onFail: () => void,
    ) => {
      const key = ++stamp.current;
      setOverrides((current) => ({ ...current, [move.id]: target }));
      setNotice({ kind, key });
      startTransition(async () => {
        const result = await moveIdea(
          tripId,
          move.id,
          target ? target[0] : null,
          target ? target[1] : null,
        );
        if ("error" in result) {
          setOverrides((current) => {
            const next = { ...current };
            delete next[move.id];
            return next;
          });
          onFail();
          setNotice({ kind: "failed", error: result.error, key });
        }
      });
    },
    [tripId],
  );

  const move = useCallback(
    (id: string, to: Place) => {
      const idea = ideas.find((item) => item.id === id);
      if (!idea) return;
      const from = id in overrides ? overrides[id] : placeOf(idea);
      const step = { id, from, to };
      setUndoStack((stack) => [...stack, step]);
      setRedoStack([]);
      send(step, to, "moved", () =>
        setUndoStack((stack) => stack.filter((item) => item !== step)),
      );
    },
    [ideas, overrides, send],
  );

  const undo = useCallback(() => {
    const step = undoStack.at(-1);
    if (!step) return;
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, step]);
    send(step, step.from, "undone", () =>
      setRedoStack((stack) => stack.filter((item) => item !== step)),
    );
  }, [undoStack, send]);

  const redo = useCallback(() => {
    const step = redoStack.at(-1);
    if (!step) return;
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, step]);
    send(step, step.to, "redone", () =>
      setUndoStack((stack) => stack.filter((item) => item !== step)),
    );
  }, [redoStack, send]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (typing(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const apply = <T extends Idea>(list: readonly T[]): T[] =>
    list.map((idea) => {
      if (!(idea.id in overrides)) return idea;
      const place = overrides[idea.id];
      return {
        ...idea,
        lon: place ? place[0] : null,
        lat: place ? place[1] : null,
      };
    });

  return {
    apply,
    move,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    notice,
    dismiss: () => setNotice(null),
  };
}
