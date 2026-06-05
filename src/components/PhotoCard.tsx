import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos";
import { CAT_LABEL } from "@/lib/categories";

export default function PhotoCard({
  photo,
  priority = false,
  sizes = "50vw",
  noCap = false,
}: {
  photo: Photo;
  priority?: boolean;
  sizes?: string;
  noCap?: boolean;
}) {
  const img = (
    <Image
      src={photo.file}
      alt={photo.title || "photo"}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
    />
  );

  const caption = !noCap && (
    <div className="cap">
      {photo.title && (
        <span className="meta">{CAT_LABEL[photo.cat] || photo.cat}</span>
      )}
      <span className="name">
        {photo.title || (CAT_LABEL[photo.cat] || photo.cat)}
      </span>
      {photo.slug && <span className="see-more">See more →</span>}
    </div>
  );

  if (photo.slug) {
    return (
      <Link href={`/projects/${photo.slug}`} style={{ display: "contents" }} data-cursor="View">
        {img}
        {caption}
      </Link>
    );
  }

  return <>{img}{caption}</>;
}
