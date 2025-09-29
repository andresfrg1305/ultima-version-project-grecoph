"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    interiorNumber: "",
    houseNumber: ""
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth!, form.email, form.password);
      if (form.fullName) {
        await updateProfile(cred.user, { displayName: form.fullName });
      }

      const uid = cred.user.uid;
      await setDoc(doc(db!, "profiles", uid), {
        id: uid,
        email: form.email,
        fullName: form.fullName || form.email.split("@")[0],
        role: "resident",
        phone: form.phone || "",
        interiorNumber: Number(form.interiorNumber || 0),
        houseNumber: Number(form.houseNumber || 0),
        createdAt: serverTimestamp(),
      });

      router.push("/resident/dashboard");
    } catch (e: any) {
      setErr(e?.message || "No fue posible crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 pt-6">
            <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>

            <div>
              <Label>Nombre completo</Label>
              <Input value={form.fullName}
                     onChange={e=>setForm(f=>({ ...f, fullName: e.target.value }))} />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" required
                     value={form.email}
                     onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <Label>Contraseña</Label>
              <Input type="password" required
                     value={form.password}
                     onChange={e=>setForm(f=>({ ...f, password: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Interior</Label>
                <Input placeholder="2"
                       value={form.interiorNumber}
                       onChange={e=>setForm(f=>({ ...f, interiorNumber: e.target.value }))}/>
              </div>
              <div>
                <Label>Casa</Label>
                <Input placeholder="13"
                       value={form.houseNumber}
                       onChange={e=>setForm(f=>({ ...f, houseNumber: e.target.value }))}/>
              </div>
            </div>

            <div>
              <Label>Teléfono (opcional)</Label>
              <Input value={form.phone}
                     onChange={e=>setForm(f=>({ ...f, phone: e.target.value }))}/>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando…</>) : "Crear cuenta"}
            </Button>
            <p className="text-center text-sm">
              ¿Ya tienes cuenta? <a href="/" className="underline">Inicia sesión</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
