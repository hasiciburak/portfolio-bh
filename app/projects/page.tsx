import { ProjectsComingSoon } from "@/components/projects-coming-soon";

const ProjectsPage = () => {
  return (
    <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col bg-background px-4 py-16 font-sans text-foreground">
      <ProjectsComingSoon />
    </main>
  );
};

export default ProjectsPage;

