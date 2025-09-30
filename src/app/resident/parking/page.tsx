"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Calendar, Wallet, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, doc, orderBy } from "firebase/firestore";
import { format } from "date-fns";

type Row = {
  id: string;
  residentName: string;
  spotNumber: string;
  startDate: Date;
  endDate: Date;
  paymentStatus: "paid" | "unpaid";
  status: "active" | "finished";
  location?: string;
};

export default function ResidentParkingPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return;

      const asgQ = query(collection(db!, "parkingAssignments"), orderBy("startDate", "desc"));
      const asgSnap = await getDocs(asgQ);
      const items: Row[] = [];
      for (const d of asgSnap.docs) {
        const a = d.data() as any;
        const [spotSnap, profileSnap] = await Promise.all([
          getDoc(doc(db!, "parkingSpots", a.parkingSpotId)),
          getDoc(doc(db!, "profiles", a.userId))
        ]);
        const spot = spotSnap.exists() ? (spotSnap.data() as any) : null;
        const profile = profileSnap.exists() ? (profileSnap.data() as any) : null;
        items.push({
          id: d.id,
          residentName: profile?.fullName || 'Desconocido',
          spotNumber: spot?.spotNumber || a.parkingSpotId,
          startDate: a.startDate?.toDate?.() || new Date(),
          endDate: a.endDate?.toDate?.() || new Date(),
          paymentStatus: a.paymentStatus,
          status: a.status,
          location: spot?.location,
        });
      }
      setRows(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Parqueaderos asignados</CardTitle>
          <CardDescription>Lista de todos los parqueaderos asignados en la comunidad</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Residente</TableHead>
                <TableHead><Car className="inline h-4 w-4 mr-2" />Parqueadero</TableHead>
                <TableHead><MapPin className="inline h-4 w-4 mr-2" />Ubicación</TableHead>
                <TableHead><Calendar className="inline h-4 w-4 mr-2" />Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead><Wallet className="inline h-4 w-4 mr-2" />Pago</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.residentName}</TableCell>
                  <TableCell>{r.spotNumber}</TableCell>
                  <TableCell>{r.location || "-"}</TableCell>
                  <TableCell>{format(r.startDate, "yyyy-MM-dd")}</TableCell>
                  <TableCell>{format(r.endDate, "yyyy-MM-dd")}</TableCell>
                  <TableCell>
                    {r.paymentStatus === "paid" ? <Badge>Pagado</Badge> : <Badge variant="secondary">Pendiente</Badge>}
                  </TableCell>
                  <TableCell>
                    {r.status === "active" ? <Badge>Activo</Badge> : <Badge variant="outline">Finalizado</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && <p className="text-muted-foreground mt-3">Aún no tienes asignaciones.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
