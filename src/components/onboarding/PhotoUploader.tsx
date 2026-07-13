"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const MAX_PHOTOS = 4;
const MAX_SIZE_MB = 8;

export function PhotoUploader({ defaultUrls }: { defaultUrls: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = MAX_PHOTOS - urls.length;
    const selected = Array.from(files).slice(0, room);
    if (selected.length === 0) {
      setError(`Up to ${MAX_PHOTOS} photos`);
      return;
    }

    setUploading(true);
    const added: string[] = [];
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
        added.push(json.url);
      } catch {
        setError("That upload didn't go through — please try again");
      }
    }
    setUrls((prev) => [...prev, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="photo_urls" value={JSON.stringify(urls)} />
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative">
            <Image
              src={url}
              alt="Your profile photo"
              width={112}
              height={112}
              unoptimized
              className="h-28 w-28 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              aria-label="Remove photo"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        {urls.length < MAX_PHOTOS && (
          <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist bg-linen text-sm text-stone transition-colors hover:border-sage">
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
      {error && <p className="text-sm text-terracotta-dark">{error}</p>}
    </div>
  );
}
