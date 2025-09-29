
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
import { communityProjects, projectQuotes, projectVotes, profiles } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function ResidentProjectsPage() {
    const user = profiles.find(p => p.role === 'resident'); // Get a mock resident
    const { toast } = useToast();
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [projectData, setProjectData] = useState<Record<string, { quotes: ProjectQuote[], votes: ProjectVote[], userVote?: ProjectVote }>>({});
    
    // Force re-render when a vote is cast
    const [, setForceRender] = useState(0);

    useEffect(() => {
        if (user) {
            const sortedProjects = [...communityProjects].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
            setProjects(sortedProjects);
            
            const data: Record<string, any> = {};
            for (const proj of sortedProjects) {
                data[proj.id] = {
                    quotes: projectQuotes.filter(q => q.projectId === proj.id),
                    votes: projectVotes.filter(v => v.projectId === proj.id),
                    userVote: projectVotes.find(v => v.projectId === proj.id && v.userId === user.id)
                }
            }
            setProjectData(data);
        }
    }, [user]);

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
    
    const handleVote = (projectId: string, quoteId: string, providerName: string) => {
        if (!user) return;

        // Simulate casting a vote
        const newVote: ProjectVote = {
            id: `vote-${Date.now()}`,
            projectId,
            userId: user.id,
            voteChoice: quoteId,
            createdAt: new Date(),
        };

        // Optimistically update the UI
        setProjectData((prevData:any) => {
            const currentVotes = prevData[projectId]?.votes || [];
            return {
                ...prevData,
                [projectId]: {
                    ...prevData[projectId],
                    userVote: newVote,
                    votes: [...currentVotes, newVote]
                }
            }
        });
        setForceRender(Math.random());

        toast({
            title: "Voto Registrado (Simulación)",
            description: `Has votado por la cotización de ${providerName}.`,
        });
    };
    
    if (!user) return null;

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
                const quotes: ProjectQuote[] = projectData[project.id]?.quotes || [];
                const votes: ProjectVote[] = projectData[project.id]?.votes || [];
                const userVote: ProjectVote | undefined = projectData[project.id]?.userVote;
                const totalVotes = votes.length;

                return (
                <Card key={project.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>Presupuesto: ${project.budget.toLocaleString('es-CO')}</CardDescription>
                            </div>
                            <Badge variant={statusVariant[project.status]}>{statusText[project.status]}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        
                        {project.status === 'voting' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold">Cotizaciones:</h4>
                            {quotes.map(quote => {
                                const quoteVotes = votes.filter(v => v.voteChoice === quote.id).length;
                                const votePercentage = totalVotes > 0 ? (quoteVotes / totalVotes) * 100 : 0;
                                return (
                                <div key={quote.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium">{quote.providerName} - ${quote.amount.toLocaleString('es-CO')}</div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={quote.fileUrl} target="_blank">
                                                    <FileText className="mr-2 h-4 w-4"/>Ver PDF
                                                </Link>
                                            </Button>
                                            <Button size="sm" disabled={!!userVote} onClick={() => handleVote(project.id, quote.id, quote.providerName)}>
                                                <Vote className="mr-2 h-4 w-4"/>Votar
                                            </Button>
                                        </div>
                                    </div>
                                    <Progress value={votePercentage} className="mt-2 h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">{quoteVotes} voto(s) ({votePercentage.toFixed(1)}%)</p>
                                </div>
                                )
                            })}
                            {quotes.length === 0 && <p className="text-sm text-muted-foreground">No hay cotizaciones para este proyecto.</p>}
                        </div>
                        )}
                        {userVote && <p className="text-sm text-primary font-medium mt-4">Ya has votado en este proyecto.</p>}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                        {project.createdAt && `Publicado el ${format(new Date(project.createdAt), 'dd/MM/yyyy')}`}
                        {project.status === 'voting' && project.votingDeadline && ` - Votación cierra el ${format(new Date(project.votingDeadline), 'dd/MM/yyyy')}`}
                    </CardFooter>
                </Card>
                )
            })}
        </div>
    )
}
