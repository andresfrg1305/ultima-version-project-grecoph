
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, FileText, BarChart, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { communityProjects, projectQuotes, projectVotes, profiles } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const project = communityProjects.find(p => p.id === projectId);
    const quotes = projectQuotes.filter(q => q.projectId === projectId);
    const votes = projectVotes.filter(v => v.projectId === projectId);
    const author = profiles.find(p => p.id === project?.createdBy);
    
    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full">
                 <h1 className="text-2xl font-bold">Proyecto no encontrado</h1>
                 <p className="text-muted-foreground">El proyecto que buscas no existe o ha sido eliminado.</p>
                 <Button onClick={() => router.back()} className="mt-4">
                     <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                 </Button>
            </div>
        )
    }

    const totalVotes = votes.length;

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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{project.title}</h1>
                    <p className="text-muted-foreground">Detalles y estado del proyecto comunitario.</p>
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General del Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Descripción</h3>
                                <p className="text-muted-foreground">{project.description}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold">Justificación</h3>
                                <p className="text-muted-foreground">{project.justification}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold">Viabilidad</h3>
                                <p className="text-muted-foreground">{project.viability}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {project.status === 'voting' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><BarChart /> Votaciones y Cotizaciones</CardTitle>
                                <CardDescription>Resultados actuales de la votación sobre las cotizaciones presentadas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quotes.map(quote => {
                                    const quoteVotes = votes.filter(v => v.voteChoice === quote.id).length;
                                    const votePercentage = totalVotes > 0 ? (quoteVotes / totalVotes) * 100 : 0;
                                    return (
                                        <div key={quote.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{quote.providerName} - ${quote.amount.toLocaleString('es-CO')}</p>
                                                    <p className="text-sm text-muted-foreground">{quote.description}</p>
                                                </div>
                                                <Button variant="ghost" size="sm"><FileText className="mr-2 h-4 w-4"/>Ver PDF</Button>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <Progress value={votePercentage} className="h-2" />
                                                <p className="text-xs text-muted-foreground">{quoteVotes} de {totalVotes} votos ({votePercentage.toFixed(1)}%)</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {!quotes.length && <p className="text-muted-foreground text-center py-4">No hay cotizaciones para este proyecto aún.</p>}
                            </CardContent>
                             <CardFooter>
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Users /> {totalVotes} residentes han votado.</p>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg">Estado del Proyecto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Estado Actual</span>
                                <Badge variant={statusVariant[project.status]}>{statusText[project.status]}</Badge>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Prioridad</span>
                                <Badge variant={priorityVariant[project.priority]}>{priorityText[project.priority]}</Badge>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">${project.budget.toLocaleString('es-CO')}</p>
                                    <p className="text-xs text-muted-foreground">Presupuesto Estimado</p>
                                </div>
                            </div>
                            {project.status === 'voting' && project.votingDeadline && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">{format(new Date(project.votingDeadline), 'dd/MM/yyyy')}</p>
                                        <p className="text-xs text-muted-foreground">Cierre de Votación</p>
                                    </div>
                                </div>
                            )}
                            {project.status === 'approved' && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <p className="font-semibold">Proyecto Aprobado</p>
                                </div>
                            )}
                             {project.status === 'rejected' && (
                                <div className="flex items-center gap-2 text-destructive">
                                    <XCircle className="h-5 w-5" />
                                    <p className="font-semibold">Proyecto Rechazado</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                            Creado por {author?.fullName || 'N/A'} el {format(new Date(project.createdAt), 'dd/MM/yyyy')}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
