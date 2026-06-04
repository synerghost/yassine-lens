import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos";
import { CAT_LABEL } from "@/lib/categories";

export default function PhotoCard({
  photo,
  priority = false,
  sizes = "50vw",
}: {
  photo: Photo;
  priority?: boolean;
  sizes?: string;
}) {
  const caption = (
    <div className="cap">
      {photo.title ? (
        <>
          <span className="meta">{CAT_LABEL[photo.cat] || photo.cat}</span>
          <span className="name">{photo.title}</span>
        </>
      ) : (
        <span className="name">{CAT_LABEL[photo.cat] || photo.cat}</span>
      )}
    </div>
  );

  const img = (
    <Image
      src={photo.file}
      alt={photo.title}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
    />
  );

  if (photo.slug) {
    return (
      <Link href={`/projects/${photo.slug}`} style={{ display: "contents" }} data-cursor="View">
        {img}
        {caption}
      </Link>
    );
  }

  return (
    <>
      {img}
      {caption}
    </>
  );
}
