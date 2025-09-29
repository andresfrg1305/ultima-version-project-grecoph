import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Usa una "llave" para proteger el endpoint en dev:
 * /api/seed?key=SEED_DEV_KEY
 * Cambia SEED_DEV_KEY por cualquier string (y no lo subas público).
 */
const SEED_KEY = process.env.SEED_DEV_KEY || "devkey";

export async function GET(req: Request) {
  try {
    console.log("db:", db);
    if (!db) return NextResponse.json({ ok: false, error: "DB no inicializada" }, { status: 500 });

    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (key !== SEED_KEY) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // ***** EDITA ESTOS DATOS DEL ADMIN *****
    const ADMIN_UID = "hSmkmDh7RPSsnl6vVaaRbncGaXs2"; // Pega aquí el UID de Authentication del admin
    const ADMIN_EMAIL = "adminmz5@grecoph.com";
    const ADMIN_NAME = "Administrador General";
    // ***************************************

    const batch = db.batch();

    // 1) Asegurar perfil admin
    const adminRef = db.collection("profiles").doc(ADMIN_UID);
    batch.set(
      adminRef,
      {
        email: ADMIN_EMAIL,
        fullName: ADMIN_NAME,
        role: "admin",
        phone: "",
        interiorNumber: 0,
        houseNumber: "",
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2) Crear 20 parqueaderos disponibles P01..P20
    for (let i = 1; i <= 20; i++) {
      const id = i.toString().padStart(2, "0"); // 01, 02, ...
      const ref = db.collection("parkingSpots").doc(`P${id}`);
      batch.set(
        ref,
        {
          spotNumber: `P${id}`,
          status: "available", // "available" | "assigned" | "occupied"
          location: "Parqueadero Principal - S1",
        },
        { merge: true }
      );
    }

    // 3) Un proyecto comunitario de ejemplo
    const prjRef = db.collection("communityProjects").doc();
    batch.set(prjRef, {
      title: "Iluminación LED zonas comunes",
      description: "Reemplazo de luminarias por tecnología LED para ahorro energético.",
      budget: 6500000,
      status: "proposal", // "proposal" | "voting" | "approved" | "rejected"
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      message: "Seed OK: admin, 20 parqueaderos y 1 proyecto creados.",
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
