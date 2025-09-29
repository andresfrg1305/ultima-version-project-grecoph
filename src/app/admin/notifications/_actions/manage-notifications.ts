"use server";

import { z } from "zod";
import { db } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(3),
  message: z.string().min(3),
  audience: z.enum(["all", "resident", "admin", "specific"]),
  userId: z.string().optional(),
});

export async function createNotification(form: z.infer<typeof schema>) {
  const parsed = schema.safeParse(form);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  if (!db) return { ok: false, error: "DB no inicializada" };

  const payload: any = {
    title: form.title,
    message: form.message,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    if (form.audience === "specific" && form.userId) {
      await db.collection("notifications").add({ ...payload, userId: form.userId });
    } else if (form.audience === "all") {
      // Broadcast: crear una notificación por cada residente
      const users = await db.collection("profiles").where("role", "==", "resident").get();
      const batch = db.batch();
      users.forEach((u) => {
        const ref = db.collection("notifications").doc();
        batch.set(ref, { ...payload, userId: u.id });
      });
      await batch.commit();
    } else {
      // Por rol específico
      const users = await db.collection("profiles").where("role", "==", form.audience).get();
      const batch = db.batch();
      users.forEach((u) => {
        const ref = db.collection("notifications").doc();
        batch.set(ref, { ...payload, userId: u.id });
      });
      await batch.commit();
    }

    revalidatePath("/admin/notifications");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error creando notificación" };
  }
}
