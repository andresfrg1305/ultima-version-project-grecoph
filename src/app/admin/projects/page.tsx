import { db } from "@/lib/firebase/server";
import type { CommunityProject } from "@/lib/types";
import { ProjectForm } from "./_components/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getProjects(): Promise<CommunityProject[]> {
  if (!db) return [];
  const snap = await db.collection("communityProjects").orderBy("createdAt", "desc").get();
  return snap.docs.map(d => {
    const x = d.data() as any;
    return {
      id: d.id,
      title: x.title,
      description: x.description,
      budget: x.budget,
      status: x.status,
      createdAt: x.createdAt?.toDate?.() || new Date(),
      updatedAt: x.updatedAt?.toDate?.() || new Date(),
    } as CommunityProject;
  });
}

export default async function ProjectsAdminPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestión de propuestas comunitarias</p>
        </div>
        <ProjectForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{p.status}</Badge>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">Presupuesto: ${p.budget?.toLocaleString?.("es-CO")}</CardFooter>
          </Card>
        ))}
        {projects.length === 0 && <p className="text-muted-foreground">No hay proyectos aún.</p>}
      </div>
    </div>
  );
}
