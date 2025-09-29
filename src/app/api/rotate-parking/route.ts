import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";

export async function POST() {
  try {
    if (!db) return NextResponse.json({ ok: false, error: "DB no inicializada" }, { status: 500 });

    // Obtener todos los residentes con vehículos activos
    const profilesSnap = await db.collection("profiles").where("role", "==", "resident").get();
    const vehiclesSnap = await db.collection("vehicles").where("active", "==", true).get();

    const residentsWithVehicles = profilesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(profile => vehiclesSnap.docs.some(v => v.data().userId === profile.id));

    // Obtener asignaciones actuales
    const assignmentsSnap = await db.collection("parkingAssignments").where("status", "==", "active").get();
    const currentAssignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Obtener spots disponibles
    const spotsSnap = await db.collection("parkingSpots").where("status", "==", "available").get();
    const availableSpots = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calcular tiempo de asignación
    const now = new Date();
    const assignmentsWithDuration = currentAssignments.map(assignment => {
      const start = assignment.startDate?.toDate?.() || new Date(assignment.startDate);
      const durationMonths = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return { ...assignment, durationMonths };
    });

    // Residentes a remover: > 3 meses
    const toRemove = assignmentsWithDuration.filter(a => a.durationMonths >= 3);

    // Residentes sin asignación
    const assignedUserIds = new Set(currentAssignments.map(a => a.userId));
    const unassignedResidents = residentsWithVehicles.filter(r => !assignedUserIds.has(r.id));

    // Ordenar unassigned por tiempo sin asignación (simular con fecha de creación o algo)
    // Por simplicidad, ordenar por id
    unassignedResidents.sort((a, b) => a.id.localeCompare(b.id));

    // Liberar spots de toRemove
    const batch = db.batch();
    const spotsToFree = toRemove.map(a => a.parkingSpotId);
    for (const spotId of spotsToFree) {
      batch.update(db.collection("parkingSpots").doc(spotId), { status: "available" });
    }

    // Marcar assignments como expired
    for (const assignment of toRemove) {
      batch.update(db.collection("parkingAssignments").doc(assignment.id), {
        status: "expired",
        endDate: now
      });
    }

    // Asignar spots disponibles a unassigned
    const spotsToAssign = [...spotsToFree, ...availableSpots.map(s => s.id)];
    for (let i = 0; i < Math.min(spotsToAssign.length, unassignedResidents.length); i++) {
      const resident = unassignedResidents[i];
      const spotId = spotsToAssign[i];
      const vehicle = vehiclesSnap.docs.find(v => v.data().userId === resident.id);

      if (vehicle) {
        const newAssignment = {
          userId: resident.id,
          vehicleId: vehicle.id,
          parkingSpotId: spotId,
          startDate: now,
          endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 meses
          paymentStatus: "unpaid",
          status: "active",
          createdAt: now
        };

        const assignmentRef = db.collection("parkingAssignments").doc();
        batch.set(assignmentRef, newAssignment);

        batch.update(db.collection("parkingSpots").doc(spotId), { status: "occupied" });
      }
    }

    await batch.commit();

    return NextResponse.json({
      ok: true,
      message: `Rotación completada. Removidos: ${toRemove.length}, Asignados: ${Math.min(spotsToAssign.length, unassignedResidents.length)}`
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}