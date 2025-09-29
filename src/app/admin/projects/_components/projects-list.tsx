
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CommunityProject } from '@/lib/types';
import { projectVotes } from '@/lib/mock-data';
import { Users } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProjectsListProps {
    initialProjects: CommunityProject[];
}

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
    const [projects, setProjects] = useState<CommunityProject[]>(initialProjects);

    const statusVariant = {
        proposal: 'secondary',
        voting: 'default',
        approved: 'default',
        rejected: 'destructive',
    } as const;

    const statusText = {
        proposal: 'Propuesta',
        voting: 'En Votación',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    };

    const priorityVariant = {
        low: 'secondary',
        medium: 'default',
        high: 'destructive'
    } as const;

    const priorityText = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta'
    };

    if (projects.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No hay proyectos para mostrar. Cree uno para comenzar.
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
                const votes = projectVotes.filter(v => v.projectId === project.id).length;
                return (
                    <Card key={project.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                            <CardDescription>Presupuesto: ${project.budget.toLocaleString('es-CO')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <div className="flex justify-between items-center">
                                <Badge variant={statusVariant[project.status]}>{statusText[project.status]}</Badge>
                                <Badge variant={priorityVariant[project.priority]}>Prioridad {priorityText[project.priority]}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{project.description}</p>
                            {project.status === 'voting' && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{votes} votos recibidos</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/admin/projects/${project.id}`}>Ver Detalles</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    )
}
