
'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase/server';
import type { ResidentData } from '../_components/client';
import { FieldValue } from 'firebase-admin/firestore';

// This schema must be aligned with the client-side form schema
const formSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  houseNumber: z.string().min(1),
  interiorNumber: z.number(),
  licensePlate: z.string().optional().or(z.literal('')),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
}).refine(data => {
    // If licensePlate is provided (and not an empty string), then brand, model, and color are required.
    if (data.licensePlate) {
        return !!data.brand && !!data.model && !!data.color;
    }
    return true;
}, {
    message: 'Si agregas una placa, debes completar todos los campos del vehículo.',
    path: ['brand'], // Attach error to a specific field on the client if needed
});


type ResidentFormValues = z.infer<typeof formSchema>;

export async function createResident(
  data: ResidentFormValues
): Promise<{ success: boolean; data?: ResidentData, error?: string; }> {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    console.error('Server-side validation failed:', validation.error.flatten());
    return { success: false, error: 'Datos del formulario inválidos.' };
  }
  
  const validatedData = validation.data;

  try {
    const tempPassword = Math.random().toString(36).slice(-8);
    const userRecord = await auth.createUser({
      email: validatedData.email,
      emailVerified: false,
      password: tempPassword,
      displayName: validatedData.fullName,
    });
    
    console.log(`Usuario creado con contraseña temporal: ${tempPassword}`);

    const batch = db.batch();

    const profileRef = db.collection('profiles').doc(userRecord.uid);
    const newProfile = {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        houseNumber: validatedData.houseNumber,
        interiorNumber: validatedData.interiorNumber,
        role: 'resident',
        createdAt: FieldValue.serverTimestamp(),
    };
    batch.set(profileRef, newProfile);

    let newVehicle = null;
    if (validatedData.licensePlate && validatedData.brand && validatedData.model && validatedData.color) {
        const vehicleRef = db.collection('vehicles').doc(); // Autogenerate ID
        newVehicle = {
            id: vehicleRef.id,
            userId: userRecord.uid,
            licensePlate: validatedData.licensePlate,
            brand: validatedData.brand,
            model: validatedData.model,
            color: validatedData.color,
            active: true,
        };
        batch.set(vehicleRef, newVehicle);
    }
    
    await batch.commit();

    const residentDataForClient: ResidentData = {
        id: userRecord.uid,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        houseNumber: validatedData.houseNumber,
        interiorNumber: validatedData.interiorNumber,
        vehicleCount: newVehicle ? 1 : 0,
        vehicles: newVehicle ? newVehicle.licensePlate : '',
    };

    return { success: true, data: residentDataForClient };

  } catch (error: any) {
    console.error('Error al crear residente:', error);
    if (error.code === 'auth/email-already-exists') {
        return { success: false, error: 'El correo electrónico ya está en uso.' };
    }
    return { success: false, error: 'Ocurrió un error en el servidor.' };
  }
}
