import type { IdeaKind } from "@/features/trips/types";

const DOT_CLASS: Record<IdeaKind, string> = {
  place: "bg-forest-dark",
  route: "bg-pinhao",
  food: "bg-kind-food",
  random: "bg-kind-random",
};

const INK_CLASS: Record<IdeaKind, string> = {
  place: "text-forest-dark",
  route: "text-pinhao",
  food: "text-kind-food-ink",
  random: "text-kind-random-ink",
};

export function KindDot({
  kind,
  className = "size-2",
}: {
  kind: IdeaKind;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${DOT_CLASS[kind]} ${className}`}
    />
  );
}

export function kindInkClass(kind: IdeaKind) {
  return INK_CLASS[kind];
}
