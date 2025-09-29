
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { AssignmentFormValues } from '../_components/assignment-form';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  userId: z.string(),
  vehicleId: z.string(),
  parkingSpotId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  paymentStatus: z.enum(['paid', 'unpaid']),
});

export async function createParkingAssignment(
  data: AssignmentFormValues
): Promise<{ success: boolean; error?: string; }> {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    console.error('Server-side validation failed:', validation.error.flatten());
    return { success: false, error: 'Datos del formulario inválidos.' };
  }
  
  if (!db) {
      return { success: false, error: 'La base de datos no está inicializada.' };
  }

  const { parkingSpotId, ...assignmentData } = validation.data;

  try {
    const batch = db.batch();

    // 1. Create the new assignment
    const assignmentRef = db.collection('parkingAssignments').doc();
    batch.set(assignmentRef, {
        ...assignmentData,
        parkingSpotId: parkingSpotId,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
    });

    // 2. Update the parking spot status to 'occupied'
    const spotRef = db.collection('parkingSpots').doc(parkingSpotId);
    batch.update(spotRef, { status: 'occupied' });
    
    await batch.commit();

    // Revalidate the path to show the new data
    revalidatePath('/admin/parking');

    return { success: true };

  } catch (error: any) {
    console.error('Error al crear la asignación de parqueadero:', error);
    return { success: false, error: 'Ocurrió un error en el servidor.' };
  }
}
