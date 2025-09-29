"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";

type N = { id: string; title: string; message: string; read: boolean; createdAt?: any; };

export default function ResidentNotificationsPage() {
  const [rows, setRows] = useState<N[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async (user: any) => {
    try {
      console.log('Cargando notificaciones para usuario:', user.uid);
      const q = query(collection(db!, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      console.log('Ejecutando consulta...');
      const snap = await getDocs(q);
      console.log('Notificaciones encontradas:', snap.docs.length);
      const notifications = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('Notificaciones procesadas:', notifications);
      setRows(notifications);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged(async (user) => {
      if (!user) return;
      await loadNotifications(user);
    });
    return () => unsub();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { read: true });

      // Actualizar localmente
      setRows(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Mis notificaciones</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map(n => (
          <div key={n.id} className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex-1">
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {n.read ? (
                <Badge>Leída</Badge>
              ) : (
                <>
                  <Badge variant="secondary">No leída</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(n.id)}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No tienes notificaciones.</p>}
      </CardContent>
    </Card>
  );
}
