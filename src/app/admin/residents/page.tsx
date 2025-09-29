
import { ResidentsClient } from "./_components/client";
import { db } from '@/lib/firebase/server';
import type { Profile, Vehicle } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

export type ResidentData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interiorNumber: number;
  houseNumber: string;
  paymentStatus: 'current' | 'overdue';
  vehicleCount: number;
  vehicles: string;
};

// Esta función ahora consulta directamente Firestore
async function getResidents(): Promise<ResidentData[]> {
  noStore(); // Nos aseguramos de obtener siempre los datos más recientes
  if (!db) {
    console.error("Firestore is not initialized on the server.");
    return [];
  }

  // Obtenemos todos los perfiles y vehículos
  const [profilesSnap, vehiclesSnap] = await Promise.all([
    db.collection("profiles").where('role', '==', 'resident').get(),
    db.collection("vehicles").get(),
  ]);

  const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
  const vehicles = vehiclesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));

  // Creamos un mapa para buscar vehículos por usuario fácilmente
  const vehicleMap = new Map<string, string[]>();
  vehicles.forEach(v => {
    if (!vehicleMap.has(v.userId)) vehicleMap.set(v.userId, []);
    vehicleMap.get(v.userId)!.push(v.licensePlate);
  });

  const rows: ResidentData[] = profiles.map(p => {
    const userVehicles = vehicleMap.get(p.id) ?? [];
    return {
      id: p.id,
      email: p.email,
      fullName: p.fullName,
      phone: p.phone,
      interiorNumber: p.interiorNumber,
      houseNumber: p.houseNumber,
      paymentStatus: p.paymentStatus || 'current', // Default to 'current' for existing residents
      vehicleCount: userVehicles.length,
      vehicles: userVehicles.join(", "),
    };
  });

  return rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export default async function ResidentsAdminPage() {
  const initialData = await getResidents();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Residentes</h1>
        <p className="text-muted-foreground">Administra residentes, viviendas y vehículos directamente en la base de datos.</p>
      </div>

      <ResidentsClient initialData={initialData} />
    </div>
  );
}
