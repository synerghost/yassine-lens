import Image from "next/image";
import type { Photo } from "@/lib/photos";
import { CAT_LABEL } from "@/lib/categories";

/**
 * Single gallery card: image + centred caption (category + title) revealed on hover.
 * Shared by the desktop canvas and the mobile feed (DRY).
 */
export default function PhotoCard({
  photo,
  priority = false,
  sizes = "50vw",
}: {
  photo: Photo;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <>
      <Image
        src={photo.file}
        alt={photo.title}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
      <div className="cap">
        <span className="meta">{CAT_LABEL[photo.cat] || photo.cat}</span>
        <span className="name">{photo.title}</span>
      </div>
    </>
  );
}
