"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationForm } from "./_components/form";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, getDoc, doc } from "firebase/firestore";

type Row = { id: string; title: string; message: string; userId: string; read: boolean; createdAt?: any; userName?: string; };

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [residents, setResidents] = useState<{ id: string; fullName: string; email: string }[]>([]);

  useEffect(() => {
    (async () => {
      // residentes para el selector del form
      const profSnap = await getDocs(query(collection(db!, "profiles"), where("role", "==", "resident")));
      setResidents(profSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      // notificaciones (todas)
      const notifSnap = await getDocs(query(collection(db!, "notifications"), orderBy("createdAt", "desc")));
      const items: Row[] = [];
      for (const d of notifSnap.docs) {
        const n = d.data() as any;
        let userName = "";
        if (n.userId) {
          const u = await getDoc(doc(db!, "profiles", n.userId));
          userName = u.exists() ? ((u.data() as any).fullName || (u.data() as any).email) : "";
        }
        items.push({ id: d.id, ...n, userName });
      }
      setRows(items);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <NotificationForm residents={residents} />

      <Card>
        <CardHeader><CardTitle>Historial de notificaciones</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rows.map((n) => (
            <div key={n.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex gap-3 items-center">
                <Avatar><AvatarFallback>{(n.userName || "T").slice(0,1)}</AvatarFallback></Avatar>
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {n.read ? <Badge>Leída</Badge> : <Badge variant="secondary">No leída</Badge>}
                {n.userName && <Badge variant="outline">{n.userName}</Badge>}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-muted-foreground">No hay notificaciones aún.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
