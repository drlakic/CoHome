"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { ProfilePhoto } from "@/lib/supabase/database.types";

const MAX_PHOTOS = 4;
const MAX_SIZE_MB = 8;

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export function PhotoUploader({
  defaultPhotos,
}: {
  defaultPhotos: ProfilePhoto[];
}) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>(defaultPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{
    url: string;
    startX: number;
    startY: number;
    posX: number;
    posY: number;
    moved: boolean;
  } | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = MAX_PHOTOS - photos.length;
    const selected = Array.from(files).slice(0, room);
    if (selected.length === 0) {
      setError(`Up to ${MAX_PHOTOS} photos`);
      return;
    }

    setUploading(true);
    const added: ProfilePhoto[] = [];
    for (const file of selected) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each photo needs to be under ${MAX_SIZE_MB} MB`);
        continue;
      }
      // Uploads go through the server, which runs a quick photo check
      // before anything is stored or visible.
      const formData = new FormData();
      formData.append("photo", file);
      try {
        const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "That upload didn't go through — please try again");
          continue;
        }
        added.push({ url: json.url, pos_x: 50, pos_y: 50 });
      } catch {
        setError("That upload didn't go through — please try again");
      }
    }
    setPhotos((prev) => [...prev, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  }

  function makePrimary(url: string) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.url === url);
      if (idx <= 0) return prev;
      return [prev[idx], ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }

  // Dragging a photo inside its frame adjusts which part stays visible
  // (CSS object-position). The preview matches how it renders elsewhere.
  function onPointerDown(e: React.PointerEvent, photo: ProfilePhoto) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      url: photo.url,
      startX: e.clientX,
      startY: e.clientY,
      posX: photo.pos_x,
      posY: photo.pos_y,
      moved: false,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag) return;
    const frame = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / frame.width) * 100;
    const dy = ((e.clientY - drag.startY) / frame.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    setPhotos((prev) =>
      prev.map((p) =>
        p.url === drag.url
          ? { ...p, pos_x: clamp(drag.posX - dx), pos_y: clamp(drag.posY - dy) }
          : p,
      ),
    );
  }

  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <div className="flex flex-wrap gap-3">
        {photos.map((photo, i) => (
          <div key={photo.url} className="flex w-32 flex-col gap-1.5">
            <div
              className="relative h-32 w-32 cursor-grab touch-none overflow-hidden rounded-xl active:cursor-grabbing"
              onPointerDown={(e) => onPointerDown(e, photo)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <img
                src={photo.url}
                alt={i === 0 ? "Your main photo" : "Your photo"}
                draggable={false}
                className="h-full w-full select-none object-cover"
                style={{ objectPosition: `${photo.pos_x}% ${photo.pos_y}%` }}
              />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-sage px-2 py-0.5 text-xs font-medium text-white">
                  Main photo
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.url)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/80 text-xs text-white"
              >
                ✕
              </button>
            </div>
            {i > 0 && (
              <button
                type="button"
                onClick={() => makePrimary(photo.url)}
                className="rounded-full bg-linen px-2 py-1 text-xs font-medium text-sage-dark ring-1 ring-mist transition-colors hover:ring-sage"
              >
                Make main photo
              </button>
            )}
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist bg-linen text-sm text-stone transition-colors hover:border-sage">
            {uploading ? "Uploading…" : "Add photo"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {photos.length > 0 && (
        <p className="text-sm text-stone">
          Drag a photo to adjust how it's framed. Your main photo is the one
          people see first.
        </p>
      )}
      {error && <p className="text-sm text-terracotta-dark">{error}</p>}
    </div>
  );
}
