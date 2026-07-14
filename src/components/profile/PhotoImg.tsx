import Image from "next/image";
import type { ProfilePhoto } from "@/lib/supabase/database.types";

// Renders a profile photo honoring its member-chosen framing (pos_x/pos_y
// map to CSS object-position). Use everywhere profile photos appear so
// framing is consistent across browse cards, profiles, chat, and lists.
export function PhotoImg({
  photo,
  alt,
  className,
  fill = false,
  width,
  height,
}: {
  photo: ProfilePhoto;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const style = { objectPosition: `${photo.pos_x}% ${photo.pos_y}%` };
  if (fill) {
    return (
      <Image
        src={photo.url}
        alt={alt}
        fill
        unoptimized
        className={className}
        style={style}
      />
    );
  }
  return (
    <Image
      src={photo.url}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      style={style}
    />
  );
}
