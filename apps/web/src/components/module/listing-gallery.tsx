"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { seedGradient } from "@/lib/seed-gradient";

/**
 * Product gallery: thumbnails switch the main image, arrows step through,
 * clicking the photo opens a fullscreen lightbox (Esc / arrows / backdrop
 * click). Mock "photos" are the same seed image at different crops until
 * real listing photos exist.
 */

const CROPS = ["center", "left top", "right center", "center bottom"];

export function ListingGallery({ name }: { name: string }): React.JSX.Element {
  const count = CROPS.length;
  const [index, setIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const go = React.useCallback(
    (delta: number): void => {
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "ArrowRight") {
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const slideStyle = (i: number): React.CSSProperties => ({
    ...seedGradient(name),
    backgroundPosition: CROPS[i],
  });

  return (
    <div>
      {/* Main image */}
      <div className="group relative aspect-square max-h-[560px] w-full overflow-hidden rounded-lg">
        <button
          type="button"
          aria-label="Open photo fullscreen"
          onClick={() => {
            setOpen(true);
          }}
          className="absolute inset-0 cursor-zoom-in"
          style={slideStyle(index)}
        />
        <span className="pointer-events-none absolute right-2 top-2 rounded-md bg-foreground/60 px-1.5 py-0.5 font-mono text-[10px] text-card">
          {index + 1}/{count}
        </span>
        <GalleryArrow dir="prev" onClick={() => { go(-1); }} />
        <GalleryArrow dir="next" onClick={() => { go(1); }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {CROPS.map((crop, i) => (
            <span key={crop} className={cn("size-1.5 rounded-full bg-card/60", i === index && "bg-card")} />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 flex gap-1.5">
        {CROPS.map((crop, i) => (
          <button
            key={crop}
            type="button"
            aria-label={`Photo ${String(i + 1)}`}
            aria-current={i === index}
            onClick={() => {
              setIndex(i);
            }}
            className={cn(
              "size-14 rounded-lg border-2 transition-colors",
              i === index ? "border-foreground" : "border-transparent hover:border-border",
            )}
            style={slideStyle(i)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" role="dialog" aria-modal="true" aria-label="Photo gallery">
          <button
            type="button"
            aria-label="Close gallery"
            className="absolute inset-0"
            onClick={() => {
              setOpen(false);
            }}
          />
          <div className="relative aspect-square w-[min(90vw,82vh)] overflow-hidden rounded-lg" style={slideStyle(index)}>
            <span className="absolute right-2 top-2 rounded-md bg-foreground/60 px-1.5 py-0.5 font-mono text-[10px] text-card">
              {index + 1}/{count}
            </span>
          </div>
          <GalleryArrow dir="prev" onClick={() => { go(-1); }} light />
          <GalleryArrow dir="next" onClick={() => { go(1); }} light />
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setOpen(false);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  dir,
  onClick,
  light,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  light?: boolean;
}): React.JSX.Element {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-opacity",
        dir === "prev" ? "left-2" : "right-2",
        light
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-card/80 text-foreground opacity-0 shadow group-hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      <Icon className="size-5" strokeWidth={1.8} />
    </button>
  );
}
