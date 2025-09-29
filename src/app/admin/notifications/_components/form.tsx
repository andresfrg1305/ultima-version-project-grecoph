"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNotification } from "../_actions/manage-notifications";
import { Loader2 } from "lucide-react";

export function NotificationForm({ residents }: { residents: { id: string; fullName: string; email: string }[] }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "resident" | "admin" | "specific">("resident");
  const [userId, setUserId] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = () => {
    startTransition(async () => {
      const res = await createNotification({ title, message, audience, userId });
      setResult(res.ok ? "Notificación enviada" : res.error || "Error");
      if (res.ok) { setTitle(""); setMessage(""); setUserId(undefined); }
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Crear notificación</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Mensaje" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={audience} onValueChange={(v:any)=>setAudience(v)}>
            <SelectTrigger><SelectValue placeholder="Audiencia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="resident">Residentes</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="specific">Usuario específico</SelectItem>
            </SelectContent>
          </Select>
          {audience === "specific" && (
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
              <SelectContent>
                {residents.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.fullName || r.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button onClick={onSubmit} disabled={pending}>
          {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…</> : "Enviar"}
        </Button>
        {result && <p className="text-sm text-muted-foreground">{result}</p>}
      </CardContent>
    </Card>
  );
}
