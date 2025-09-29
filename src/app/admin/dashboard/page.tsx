import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, GanttChartSquare, Users, Wallet } from "lucide-react";
import { db } from "@/lib/firebase/server";
import { unstable_noStore as noStore } from "next/cache";

async function getCounts() {
  noStore();
  if (!db) return { totalResidents: 0, activeProjects: 0, occupiedSpots: 0, unpaidAssignments: 0 };

  const [profilesSnap, projectsSnap, spotsSnap, assignmentsSnap] = await Promise.all([
    db.collection("profiles").where("role", "==", "resident").get(),
    db.collection("communityProjects").where("status", "in", ["proposal", "voting"]).get(),
    db.collection("parkingSpots").where("status", "==", "occupied").get(),
    db.collection("parkingAssignments").where("paymentStatus", "==", "unpaid").where("status", "==", "active").get(),
  ]);

  return {
    totalResidents: profilesSnap.size,
    activeProjects: projectsSnap.size,
    occupiedSpots: spotsSnap.size,
    unpaidAssignments: assignmentsSnap.size,
  };
}

export default async function AdminDashboardPage() {
  const { totalResidents, activeProjects, occupiedSpots, unpaidAssignments } = await getCounts();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard de Administrador</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResidents}</div>
            <p className="text-xs text-muted-foreground">registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parqueaderos Ocupados</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedSpots}</div>
            <p className="text-xs text-muted-foreground">en uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">en propuesta o votación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidAssignments}</div>
            <p className="text-xs text-muted-foreground">asignaciones activas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
