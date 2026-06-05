import { notFound } from "next/navigation";
import ProjectExperience from "@/components/ProjectExperience";
import projectsData from "@/lib/projects.json";
import { getProject, type Project } from "@/lib/projects";

// Cached at the edge (ISR); admin saves call revalidatePath('/projects/<slug>')
// for instant updates. Reads live data from Blob via getProject().
export const revalidate = 120;

export async function generateStaticParams() {
  return (projectsData as Project[]).map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const photos = project.secondaryPhotos.map((p) => ({
    ...p,
    cat: project.cat,
    title: project.title,
    slug: project.slug,
  }));

  return <ProjectExperience project={project} photos={photos} />;
}
