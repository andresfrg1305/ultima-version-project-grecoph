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
    console.log('Creando notificación con audience:', form.audience, 'userId:', form.userId);

    if (form.audience === "specific" && form.userId) {
      console.log('Creando notificación específica para userId:', form.userId);
      const result = await db.collection("notifications").add({ ...payload, userId: form.userId });
      console.log('Notificación específica creada con ID:', result.id);
    } else if (form.audience === "all") {
      // Broadcast: crear una notificación por cada residente
      console.log('Creando notificación para todos los residentes');
      const users = await db.collection("profiles").where("role", "==", "resident").get();
      console.log('Encontrados', users.docs.length, 'residentes');
      const batch = db.batch();
      users.forEach((u) => {
        const ref = db.collection("notifications").doc();
        batch.set(ref, { ...payload, userId: u.id });
        console.log('Agregando notificación para residente:', u.id);
      });
      await batch.commit();
      console.log('Batch commit completado para notificación general');
    } else {
      // Por rol específico
      console.log('Creando notificación para rol:', form.audience);
      const users = await db.collection("profiles").where("role", "==", form.audience).get();
      console.log('Encontrados', users.docs.length, 'usuarios con rol', form.audience);
      const batch = db.batch();
      users.forEach((u) => {
        const ref = db.collection("notifications").doc();
        batch.set(ref, { ...payload, userId: u.id });
        console.log('Agregando notificación para usuario:', u.id);
      });
      await batch.commit();
      console.log('Batch commit completado para rol específico');
    }

    revalidatePath("/admin/notifications");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error creando notificación" };
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  if (!db) return { ok: false, error: "DB no inicializada" };

  try {
    const notificationRef = db.collection("notifications").doc(notificationId);

    // Verificar que la notificación pertenece al usuario
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists) {
      return { ok: false, error: "Notificación no encontrada" };
    }

    const notificationData = notificationDoc.data();
    if (notificationData?.userId !== userId) {
      return { ok: false, error: "No tienes permisos para esta notificación" };
    }

    await notificationRef.update({ read: true });

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error marcando notificación como leída" };
  }
}
