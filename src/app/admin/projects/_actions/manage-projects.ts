"use server";

import { z } from "zod";
import { db } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  budget: z.number().nonnegative(),
  status: z.enum(["proposal", "voting", "approved", "rejected"]),
});

export async function createProject(data: z.infer<typeof schema>) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  if (!db) return { ok: false, error: "DB no inicializada" };

  try {
    await db.collection("communityProjects").add({
      ...parsed.data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath("/admin/projects");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error creando proyecto" };
  }
}
