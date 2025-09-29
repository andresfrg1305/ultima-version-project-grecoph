"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { createProject } from "../_actions/manage-projects";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  budget: z.coerce.number().nonnegative(),
  status: z.enum(["proposal", "voting", "approved", "rejected"]).default("proposal"),
});

export function ProjectForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", budget: 0, status: "proposal" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const res = await createProject(data);
      if (res.ok) {
        toast({ title: "Proyecto creado" });
        setOpen(false);
        form.reset();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="h-4 w-4 mr-2" /> Nuevo proyecto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Proyecto</DialogTitle>
          <DialogDescription>Publica una nueva propuesta comunitaria.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Título" {...form.register("title")} />
          <Textarea placeholder="Descripción" {...form.register("description")} />
          <Input type="number" placeholder="Presupuesto (COP)" {...form.register("budget")} />
          <Select onValueChange={(v:any)=>form.setValue("status", v)} defaultValue="proposal">
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proposal">Propuesta</SelectItem>
              <SelectItem value="voting">Votación</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…</> : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
