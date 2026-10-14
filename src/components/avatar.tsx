export const AVATAR_COLORS = {
  forest: "#1D4736",
  ochre: "#9A6F1E",
  rust: "#B4532B",
  olive: "#5E7F3A",
  moss: "#2E6A4E",
  pinhao: "#8E4A2A",
  lagoon: "#2F7A8C",
  plum: "#6B5B95",
} as const;

export type AvatarColor = keyof typeof AVATAR_COLORS;

export function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && value in AVATAR_COLORS;
}

const PALETTE = Object.values(AVATAR_COLORS);

const plain = (name: string) =>
  name.normalize("NFD").replace(/\p{M}/gu, "").trim();

export function avatarColor(name: string) {
  let hash = 0;
  for (const ch of plain(name).toLowerCase()) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function initial(name: string) {
  return plain(name).charAt(0).toUpperCase() || "?";
}

export function Avatar({
  name,
  color,
  className = "size-8 text-xs",
}: {
  name: string;
  color?: AvatarColor | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`text-cream inline-flex shrink-0 items-center justify-center rounded-full font-extrabold ${className}`}
      style={{
        backgroundColor: color ? AVATAR_COLORS[color] : avatarColor(name),
      }}
    >
      <span className="leading-none [text-box:trim-both_cap_alphabetic]">
        {initial(name)}
      </span>
    </span>
  );
}

export function AvatarStack({
  names,
  colors = [],
  max = 3,
  label,
  size = "md",
}: {
  names: string[];
  colors?: (AvatarColor | null)[];
  max?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const shown = names.length > max + 1 ? names.slice(0, max) : names;
  const rest = names.length - shown.length;
  const item =
    size === "sm"
      ? "size-[26px] text-[10px] -ml-[7px] first:ml-0"
      : "size-[30px] text-[11px] -ml-2 first:ml-0";

  return (
    <span role="img" aria-label={label} className="flex shrink-0 items-center">
      {shown.map((name, i) => (
        <Avatar
          key={`${name}-${i}`}
          name={name}
          color={colors[i]}
          className={`border-cream border-2 ${item}`}
        />
      ))}
      {rest > 0 && (
        <span
          aria-hidden="true"
          className={`border-cream text-ink bg-fog inline-flex items-center justify-center rounded-full border-2 font-extrabold ${item}`}
        >
          <span className="leading-none [text-box:trim-both_cap_alphabetic]">
            +{rest}
          </span>
        </span>
      )}
    </span>
  );
}
