import Experience from "@/components/Experience";
import { getGallery } from "@/lib/photos";

// Read the gallery at request time so admin edits appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = await getGallery();
  return <Experience photos={photos} />;
}
