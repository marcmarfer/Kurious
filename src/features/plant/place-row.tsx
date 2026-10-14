"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CameraIcon, CloseIcon, PinIcon } from "@/components/icons";
import { readJpegGps, type GpsPoint } from "./exif";
import { FIELD_ERROR, GROUP_LABEL } from "./plant-ui";

const EXIF_WINDOW = 256 * 1024;

export type PlaceSource = "hand" | "photo";

type PhotoState = "idle" | "reading" | "noGps" | "unreadable";

const BUTTON =
  "focus-ring flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-[1.5px] px-3 text-[13px] font-extrabold transition-colors";

export function PlaceRow({
  source,
  pointKey,
  handActive,
  onHand,
  onPhoto,
  onRemove,
  serverError,
}: {
  source: PlaceSource | null;
  pointKey: string;
  handActive: boolean;
  onHand: () => void;
  onPhoto: (point: GpsPoint) => void;
  onRemove: () => void;
  serverError: string | null;
}) {
  const t = useTranslations("Plant");
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState<{ state: PhotoState; key: string }>({
    state: "idle",
    key: "",
  });
  const photo = reading.key === pointKey ? reading.state : "idle";
  const setPhoto = (state: PhotoState) => setReading({ state, key: pointKey });

  async function read(file: File) {
    setPhoto("reading");
    try {
      const place = readJpegGps(await file.slice(0, EXIF_WINDOW).arrayBuffer());
      if (place.status === "found") {
        setPhoto("idle");
        onPhoto(place.point);
      } else setPhoto(place.status);
    } catch {
      setPhoto("unreadable");
    }
  }

  const status =
    photo === "reading"
      ? { text: t("place.reading"), tone: "muted" }
      : photo === "noGps" || photo === "unreadable"
        ? { text: t(`place.${photo}`), tone: "error" }
        : source
          ? {
              text: t(source === "photo" ? "place.fromPhoto" : "place.set"),
              tone: "ok",
            }
          : { text: t("place.none"), tone: "muted" };

  const handOn = handActive || source === "hand";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`${GROUP_LABEL} grow`}>{t("place.ask")}</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void read(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-pressed={source === "photo"}
          className={`${BUTTON} ${source === "photo" ? "border-forest-dark text-forest-dark bg-[#F1F6EE]" : "border-stone bg-cream text-ink hover:border-[#B9BFB1]"}`}
        >
          <CameraIcon className="size-4" />
          {t("place.photo")}
        </button>
        <button
          type="button"
          onClick={() => {
            setPhoto("idle");
            onHand();
          }}
          aria-pressed={handOn}
          className={`${BUTTON} ${handOn ? "border-forest-dark text-forest-dark bg-[#F1F6EE]" : "border-stone bg-cream text-ink hover:border-[#B9BFB1]"}`}
        >
          <PinIcon className="size-4" />
          {t("place.byHand")}
        </button>
      </div>
      <div className="flex min-h-7 items-center gap-2" aria-live="polite">
        <p
          className={`grow text-[12.5px] leading-[1.35] font-semibold ${status.tone === "error" ? "text-danger font-bold" : status.tone === "ok" ? "text-forest-dark font-bold" : "text-[#7A837C]"}`}
        >
          {status.text}
        </p>
        {source && (
          <button
            type="button"
            onClick={() => {
              setPhoto("idle");
              onRemove();
            }}
            className="focus-ring text-muted hover:text-ink flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 text-[12.5px] font-extrabold"
          >
            <CloseIcon className="size-3.5" strokeWidth={2.4} />
            {t("place.remove")}
          </button>
        )}
      </div>
      {serverError && <p className={FIELD_ERROR}>{serverError}</p>}
    </div>
  );
}
