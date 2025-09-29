"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Car, GanttChartSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";

export default function ResidentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("Residente");
  const [unread, setUnread] = useState<number>(0);
  const [spotNumber, setSpotNumber] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged(async (user) => {
      if (!user) return;
      // Perfil
      const p = await getDoc(doc(db!, "profiles", user.uid));
      if (p.exists()) {
        const full = (p.data().fullName as string) || "Residente";
        setFirstName(full.split(" ")[0]);
      }
      // Asignación activa + parqueadero
      const asgQ = query(collection(db!, "parkingAssignments"), where("userId", "==", user.uid), where("status", "==", "active"));
      const asgSnap = await getDocs(asgQ);
      if (!asgSnap.empty) {
        const a = asgSnap.docs[0].data() as any;
        const spotSnap = await getDoc(doc(db!, "parkingSpots", a.parkingSpotId));
        if (spotSnap.exists()) setSpotNumber(spotSnap.data().spotNumber as string);
      }
      // Notificaciones sin leer
      const notifQ = query(collection(db!, "notifications"), where("userId", "==", user.uid), where("read", "==", false));
      const notifSnap = await getDocs(notifQ);
      setUnread(notifSnap.size);
      // Proyectos recientes
      const prjQ = query(collection(db!, "communityProjects"), orderBy("createdAt", "desc"), limit(3));
      const prjSnap = await getDocs(prjQ);
      setRecentProjects(prjSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p className="p-6">Cargando…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Bienvenido, {firstName}</h1>
        <p className="text-muted-foreground">Resumen de tu actividad.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Parqueadero asignado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{spotNumber || "Sin asignar"}</div>
            <Car className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{unread}</div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proyectos comunitarios</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{recentProjects.length}</div>
            <GanttChartSquare className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos recientes</CardTitle>
          <CardDescription>Últimas propuestas en la comunidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentProjects.length === 0 && <p className="text-muted-foreground">No hay proyectos por ahora.</p>}
          {recentProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.description}</div>
              </div>
              <Link href="/resident/projects">
                <Button variant="outline" size="sm">Ver más <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
