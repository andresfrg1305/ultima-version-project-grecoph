"use server";

import { db } from '@/lib/firebase/server';
import { revalidatePath } from 'next/cache';

export async function rotateParking() {
  try {
    if (!db) throw new Error("DB no inicializada");

    const now = new Date();

    // Obtener todos los residentes con vehículos activos y pagos al día
    const profilesSnap = await db.collection("profiles")
      .where("role", "==", "resident")
      .where("paymentStatus", "==", "current")
      .get();
    const vehiclesSnap = await db.collection("vehicles").where("active", "==", true).get();

    const residentsWithVehicles = profilesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(profile => vehiclesSnap.docs.some(v => v.data().userId === profile.id));

    // Obtener asignaciones actuales
    const assignmentsSnap = await db.collection("parkingAssignments").where("status", "==", "active").get();
    const currentAssignments = assignmentsSnap.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      vehicleId: doc.data().vehicleId,
      parkingSpotId: doc.data().parkingSpotId,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      paymentStatus: doc.data().paymentStatus,
      status: doc.data().status,
      createdAt: doc.data().createdAt
    }));

    // Obtener spots disponibles
    const spotsSnap = await db.collection("parkingSpots").where("status", "==", "available").get();
    const availableSpots = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calcular tiempo de asignación
    const assignmentsWithDuration = currentAssignments.map(assignment => {
      const start = assignment.startDate?.toDate?.() || new Date(assignment.startDate);
      const durationMonths = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return { ...assignment, durationMonths };
    });

    // Residentes a remover: > 3 meses O que no han completado al menos 1 mes
    const toRemove = assignmentsWithDuration.filter(a => a.durationMonths >= 3);

    // Residentes sin asignación (solo aquellos con pagos al día)
    const assignedUserIds = new Set(currentAssignments.map(a => a.userId));
    const unassignedResidents = residentsWithVehicles.filter(r => !assignedUserIds.has(r.id));

    // Obtener historial de asignaciones para calcular tiempo sin parqueadero
    const allAssignmentsSnap = await db.collection("parkingAssignments").get();
    const allAssignments = allAssignmentsSnap.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      vehicleId: doc.data().vehicleId,
      parkingSpotId: doc.data().parkingSpotId,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      paymentStatus: doc.data().paymentStatus,
      status: doc.data().status,
      createdAt: doc.data().createdAt
    }));

    // Calcular tiempo sin parqueadero para cada residente sin asignación
    const unassignedWithPriority = unassignedResidents.map(resident => {
      const residentAssignments = allAssignments
        .filter(a => a.userId === resident.id)
        .sort((a, b) => (b.endDate?.toDate?.() || new Date(b.endDate)).getTime() - (a.endDate?.toDate?.() || new Date(a.endDate)).getTime());

      const lastAssignment = residentAssignments[0];
      let monthsWithoutParking = 0;

      if (lastAssignment) {
        const endDate = lastAssignment.endDate?.toDate?.() || new Date(lastAssignment.endDate);
        monthsWithoutParking = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      } else {
        // Nuevo residente, darle prioridad baja inicialmente
        monthsWithoutParking = 0;
      }

      return { ...resident, monthsWithoutParking };
    });

    // Ordenar por prioridad: más tiempo sin parqueadero primero
    unassignedWithPriority.sort((a, b) => b.monthsWithoutParking - a.monthsWithoutParking);

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

    // Asignar spots disponibles a unassigned (usando la nueva lógica de prioridad)
    const spotsToAssign = [...spotsToFree, ...availableSpots.map(s => s.id)];
    for (let i = 0; i < Math.min(spotsToAssign.length, unassignedWithPriority.length); i++) {
      const resident = unassignedWithPriority[i];
      const spotId = spotsToAssign[i];
      const vehicle = vehiclesSnap.docs.find(v => v.data().userId === resident.id);

      if (vehicle) {
        const newAssignment = {
          userId: resident.id,
          vehicleId: vehicle.id,
          parkingSpotId: spotId,
          startDate: now,
          endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 meses
          paymentStatus: "paid", // Los residentes con pagos al día tienen asignaciones pagadas
          status: "active",
          createdAt: now
        };

        const assignmentRef = db.collection("parkingAssignments").doc();
        batch.set(assignmentRef, newAssignment);

        batch.update(db.collection("parkingSpots").doc(spotId), { status: "occupied" });
      }
    }

    await batch.commit();

    revalidatePath('/admin/parking');

    return { success: true, message: `Rotación completada. Removidos: ${toRemove.length}, Asignados: ${Math.min(spotsToAssign.length, unassignedWithPriority.length)}. Solo se incluyen residentes con pagos al día.` };
  } catch (e: any) {
    console.error(e);
    return { success: false, message: e?.message || "Error" };
  }
}