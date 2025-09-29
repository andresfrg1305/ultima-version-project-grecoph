import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * /api/seed-resident?key=SEED_DEV_KEY&uid=EL_UID&email=correo@dominio.com&name=Nombre%20Residente&interior=1&house=11&plate=ABC123
 * - uid (requerido): UID real del usuario en Authentication
 * - email, name, interior, house, plate: opcionales (tienen defaults)
 */
const SEED_KEY = process.env.SEED_DEV_KEY || "devkey";

export async function GET(req: Request) {
  try {
    if (!db) return NextResponse.json({ ok: false, error: "DB no inicializada" }, { status: 500 });

    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (key !== SEED_KEY) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const uid = url.searchParams.get("uid") || "RESIDENT_UID_DUMMY";

    const email = url.searchParams.get("email") || "residente@gestionaph.com";
    const fullName = url.searchParams.get("name") || "Residente Ejemplo";
    const interior = Number(url.searchParams.get("interior") || 1);
    const houseNumber = url.searchParams.get("house") || "101";
    const licensePlate = url.searchParams.get("plate") || "ABC123";

    // 1) Perfil del residente (merge por si ya existe)
    const profileRef = db.collection("profiles").doc(uid);
    await profileRef.set(
      {
        email,
        fullName,
        role: "resident",
        phone: "",
        interiorNumber: interior,
        houseNumber,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2) Vehículo
    const vehicleRef = db.collection("vehicles").doc();
    await vehicleRef.set({
      userId: uid,
      licensePlate,
      brand: "Chevrolet",
      model: "Onix",
      color: "Blanco",
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3) Tomar primer parqueadero disponible
    const spotSnap = await db.collection("parkingSpots").where("status", "==", "available").limit(1).get();
    if (spotSnap.empty) {
      return NextResponse.json({ ok: false, error: "No hay parqueaderos disponibles." }, { status: 400 });
    }
    const spot = spotSnap.docs[0];
    const spotId = spot.id;

    // 4) Crear asignación + marcar spot como ocupado
    const batch = db.batch();
    const assignRef = db.collection("parkingAssignments").doc();
    const startDate = FieldValue.serverTimestamp();
    const endDate = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // +30 días

    batch.set(assignRef, {
      userId: uid,
      vehicleId: vehicleRef.id,
      parkingSpotId: spotId,
      startDate,
      endDate,
      paymentStatus: "unpaid",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    batch.update(db.collection("parkingSpots").doc(spotId), { status: "occupied" });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      message: `Residente ${fullName} preparado, vehículo creado y ${spotId} asignado.`,
      data: { uid, vehicleId: vehicleRef.id, spotId },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
