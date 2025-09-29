"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";            // ← importa Link
import { loginAndEnsureProfile } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email({ message: "Ingresa un email válido." }),
  password: z.string().min(6, "Mínimo 6 caracteres."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const role = await loginAndEnsureProfile(data.email, data.password);
      toast({ title: "Sesión iniciada", description: `Bienvenido (${role}).` });
      router.push(role === "admin" ? "/admin/dashboard" : "/resident/dashboard");
    } catch (err: any) {
      toast({
        title: "Error al iniciar sesión",
        description: err?.message ?? "Revisa tus credenciales.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="tucorreo@dominio.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="••••••••"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando…</>) : "Entrar"}
          </Button>

          <p className="mt-1 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="underline">Crear cuenta</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
