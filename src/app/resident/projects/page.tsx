
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectVote, CommunityProject, ProjectQuote } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Vote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { format } from 'date-fns';

export default function ResidentProjectsPage() {
    const { toast } = useToast();
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                console.log('Cargando proyectos desde Firestore...');
                const q = query(collection(db, "communityProjects"), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                const projectsData = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as CommunityProject[];
                console.log('Proyectos cargados:', projectsData.length);
                setProjects(projectsData);
            } catch (error) {
                console.error('Error cargando proyectos:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudieron cargar los proyectos.',
                });
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [toast]);

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

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Proyectos de la Comunidad</h1>
                    <p className="text-muted-foreground">Cargando proyectos...</p>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Proyectos de la Comunidad</h1>
                    <p className="text-muted-foreground">Revisa las propuestas, consulta las cotizaciones y participa en las decisiones de tu comunidad.</p>
                </div>
                <div className="text-center text-muted-foreground py-10">
                    No hay proyectos disponibles en este momento.
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Proyectos de la Comunidad</h1>
                <p className="text-muted-foreground">Revisa las propuestas, consulta las cotizaciones y participa en las decisiones de tu comunidad.</p>
            </div>
            {projects.map(project => {
                return (
                <Card key={project.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>
                                    Presupuesto: ${project.budget?.toLocaleString('es-CO') || 'No especificado'}
                                </CardDescription>
                            </div>
                            <Badge variant={statusVariant[project.status] || 'secondary'}>
                                {statusText[project.status] || 'Propuesta'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{project.description}</p>

                        {project.status === 'voting' && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    Este proyecto está en fase de votación. Las cotizaciones estarán disponibles próximamente.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                        {project.createdAt && `Publicado el ${format(new Date(project.createdAt.toDate ? project.createdAt.toDate() : project.createdAt), 'dd/MM/yyyy')}`}
                        {project.status === 'voting' && project.votingDeadline && ` - Votación cierra el ${format(new Date(project.votingDeadline), 'dd/MM/yyyy')}`}
                    </CardFooter>
                </Card>
                )
            })}
        </div>
    )
}
