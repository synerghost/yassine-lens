import Experience from "@/components/Experience";
import { getGallery } from "@/lib/photos";

// Cached at the edge (ISR); admin saves call revalidatePath('/') for instant updates.
export const revalidate = 120;

export default async function Home() {
  const photos = await getGallery();
  return <Experience photos={photos} />;
}
