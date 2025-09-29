"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

type N = { id: string; title: string; message: string; read: boolean; createdAt?: any; };

export default function ResidentNotificationsPage() {
  const [rows, setRows] = useState<N[]>([]);

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged(async (user) => {
      if (!user) return;
      const q = query(collection(db!, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle>Mis notificaciones</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map(n => (
          <div key={n.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.message}</div>
            </div>
            {n.read ? <Badge>Leída</Badge> : <Badge variant="secondary">No leída</Badge>}
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No tienes notificaciones.</p>}
      </CardContent>
    </Card>
  );
}
