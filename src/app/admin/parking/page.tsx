
import { db } from '@/lib/firebase/server';
import { ParkingClient } from './_components/client';
import type { ParkingAssignment, Profile, Vehicle, ParkingSpot } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { sanitizeForClient } from '@/utils/serialize';
import { rotateParking } from './actions';

// This type is used by the client component
export type AssignmentData = {
  id: string;
  userName: string;
  userHouse: string;
  vehiclePlate: string;
  spotNumber: string;
  startDate: Date;
  endDate: Date;
  paymentStatus: 'paid' | 'unpaid';
  status: 'active' | 'expired' | 'cancelled';
};

// This function processes data from Firestore to be sent to the client
const getParkingData = async (): Promise<AssignmentData[]> => {
    noStore(); // Ensures data is fetched on every request
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }

    const assignmentsSnap = await db.collection('parkingAssignments').orderBy('createdAt', 'desc').get();
    const profilesSnap = await db.collection('profiles').get();
    const vehiclesSnap = await db.collection('vehicles').get();
    const spotsSnap = await db.collection('parkingSpots').get();

    const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
    const vehicles = vehiclesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    const spots = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSpot));

    const assignmentsData = assignmentsSnap.docs.map(doc => {
        const assignment = { id: doc.id, ...doc.data() } as ParkingAssignment;
        
        // Firestore timestamps need to be converted to JS Dates
        const firestoreTimestampToDate = (timestamp: any): Date => {
             if (!timestamp) return new Date();
             return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        }
        
        const user = profiles.find(p => p.id === assignment.userId);
        const vehicle = vehicles.find(v => v.id === assignment.vehicleId);
        const spot = spots.find(s => s.id === assignment.parkingSpotId);
        
        return {
            id: assignment.id,
            userName: user?.fullName || 'N/A',
            userHouse: user?.houseNumber || 'N/A',
            vehiclePlate: vehicle?.licensePlate || 'N/A',
            spotNumber: spot?.spotNumber || 'N/A',
            startDate: firestoreTimestampToDate(assignment.startDate),
            endDate: firestoreTimestampToDate(assignment.endDate),
            paymentStatus: assignment.paymentStatus,
            status: assignment.status,
        };
    });

    return assignmentsData;
}

const getFormData = async (): Promise<{ residentsWithVehicles: (Profile & { vehicles: Vehicle[] })[], availableSpots: ParkingSpot[] }> => {
    noStore();
    if (!db) {
        console.error("Firestore is not initialized.");
        return { residentsWithVehicles: [], availableSpots: [] };
    }
    
    const [profilesSnap, vehiclesSnap, spotsSnap] = await Promise.all([
        db.collection('profiles').where('role', '==', 'resident').get(),
        db.collection('vehicles').where('active', '==', true).get(),
        db.collection('parkingSpots').where('status', '==', 'available').get()
    ]);

    const profiles = profilesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as Profile;
    });
    const vehicles = vehiclesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        licensePlate: data.licensePlate,
        brand: data.brand,
        model: data.model,
        color: data.color,
        active: data.active,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as Vehicle;
    });
    const availableSpots = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSpot));
    
    const residentsWithVehicles = profiles
        .map(resident => ({
            ...resident,
            vehicles: vehicles.filter(v => v.userId === resident.id),
        }))
        .filter(resident => resident.vehicles.length > 0);

    return { residentsWithVehicles, availableSpots };
}


export default async function ParkingAdminPage() {
  const initialData = await getParkingData();
  const { residentsWithVehicles, availableSpots } = await getFormData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Parqueaderos</h1>
          <p className="text-muted-foreground">
            Visualiza, busca y gestiona todas las asignaciones de parqueaderos del conjunto residencial.
          </p>
        </div>
        <form action={rotateParking}>
          <Button variant="outline" type="submit">
            <RotateCcw className="mr-2 h-4 w-4" />
            Rotar Parqueaderos
          </Button>
        </form>
      </div>
      <ParkingClient
        initialData={sanitizeForClient(initialData)}
        residentsWithVehicles={sanitizeForClient(residentsWithVehicles)}
        availableSpots={sanitizeForClient(availableSpots)}
      />
    </div>
  );
}
