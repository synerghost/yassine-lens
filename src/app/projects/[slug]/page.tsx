import { notFound } from "next/navigation";
import ProjectExperience from "@/components/ProjectExperience";
import projectsData from "@/lib/projects.json";

export const revalidate = 3600;

type Project = {
  cat: string;
  title: string;
  slug: string;
  main: string;
  secondaryPhotos: { file: string; w: number; h: number }[];
};

export async function generateStaticParams() {
  return (projectsData as Project[]).map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (projectsData as Project[]).find((p) => p.slug === slug);
  if (!project) notFound();

  const photos = project.secondaryPhotos.map((p) => ({
    ...p,
    cat: project.cat,
    title: project.title,
    slug: project.slug,
  }));

  return <ProjectExperience project={project} photos={photos} />;
}
