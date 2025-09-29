
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
  password: z.string().min(6),
  paymentStatus: z.enum(['current', 'overdue']),
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
): Promise<{ success: boolean; data?: ResidentData, tempPassword?: string, error?: string; }> {
  console.log('=== INICIANDO CREACIÓN DE RESIDENTE ===');
  console.log('Datos recibidos:', data);

  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    console.error('❌ Validación del servidor falló:', validation.error.flatten());
    return { success: false, error: 'Datos del formulario inválidos.' };
  }

  console.log('✅ Validación del servidor exitosa');

  const validatedData = validation.data;

  try {
    console.log('Iniciando creación de residente:', validatedData);

    if (!auth) {
      console.error('Servicio de autenticación no disponible');
      return { success: false, error: 'Servicio de autenticación no disponible.' };
    }

    if (!db) {
      console.error('Base de datos no disponible');
      return { success: false, error: 'Base de datos no disponible.' };
    }

    // Usar la contraseña proporcionada por el administrador
    const tempPassword = validatedData.password;
    console.log('Creando usuario en Firebase Auth...');

    const userRecord = await auth.createUser({
      email: validatedData.email,
      emailVerified: false,
      password: tempPassword,
      displayName: validatedData.fullName,
    });

    const passwordSource = 'proporcionada por administrador';
    console.log(`Usuario creado exitosamente con ID: ${userRecord.uid}, contraseña (${passwordSource}): ${tempPassword}`);

    console.log('Creando transacción de Firestore...');
    const batch = db.batch();

    const profileRef = db.collection('profiles').doc(userRecord.uid);
    const newProfile = {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        houseNumber: validatedData.houseNumber,
        interiorNumber: validatedData.interiorNumber,
        paymentStatus: validatedData.paymentStatus,
        role: 'resident',
        createdAt: FieldValue.serverTimestamp(),
    };
    console.log('Agregando perfil a la transacción:', newProfile);
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
        console.log('Agregando vehículo a la transacción:', newVehicle);
        batch.set(vehicleRef, newVehicle);
    }

    console.log('Ejecutando transacción...');
    await batch.commit();
    console.log('Transacción completada exitosamente');

    const residentDataForClient: ResidentData = {
        id: userRecord.uid,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        houseNumber: validatedData.houseNumber,
        interiorNumber: validatedData.interiorNumber,
        paymentStatus: validatedData.paymentStatus,
        vehicleCount: newVehicle ? 1 : 0,
        vehicles: newVehicle ? newVehicle.licensePlate : '',
    };

    return {
        success: true,
        data: residentDataForClient,
        tempPassword: tempPassword
    };

  } catch (error: any) {
    console.error('❌ Error al crear residente:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);

    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
        console.log('Email ya existe en Firebase Auth');
        return { success: false, error: 'El correo electrónico ya está en uso.' };
    }
    if (error.code === 'auth/invalid-email') {
        console.log('Email inválido');
        return { success: false, error: 'El correo electrónico no es válido.' };
    }
    if (error.code === 'auth/weak-password') {
        console.log('Contraseña débil');
        return { success: false, error: 'La contraseña es demasiado débil.' };
    }

    // Manejar errores de Firestore
    if (error.code === 'permission-denied') {
        console.log('Error de permisos en Firestore');
        return { success: false, error: 'No tienes permisos para realizar esta acción.' };
    }

    // Error genérico con detalles
    const errorMessage = error?.message || 'Error desconocido';
    console.error('Detalles del error:', errorMessage);
    return { success: false, error: `Error del servidor: ${errorMessage}` };
  }
}

export async function updateResidentPaymentStatus(
  residentId: string,
  paymentStatus: 'current' | 'overdue',
  lastPaymentDate?: Date
): Promise<{ success: boolean; error?: string; }> {
  if (!db) {
    return { success: false, error: 'Base de datos no disponible.' };
  }

  try {
    const updateData: any = {
      paymentStatus,
    };

    if (lastPaymentDate) {
      updateData.lastPaymentDate = lastPaymentDate;
    }

    await db.collection('profiles').doc(residentId).update(updateData);

    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar estado de pago:', error);
    return { success: false, error: 'Error al actualizar el estado de pago.' };
  }
}

export async function createAuthAccountForExistingResident(
  residentId: string,
  password: string
): Promise<{ success: boolean; error?: string; }> {
  if (!auth || !db) {
    return { success: false, error: 'Servicios no disponibles.' };
  }

  try {
    console.log('Creando cuenta Firebase Auth para residente existente:', residentId);

    // Obtener datos del residente desde Firestore
    const profileDoc = await db.collection('profiles').doc(residentId).get();
    if (!profileDoc.exists) {
      return { success: false, error: 'Residente no encontrado en la base de datos.' };
    }

    const profileData = profileDoc.data();
    if (!profileData?.email) {
      return { success: false, error: 'El residente no tiene email registrado.' };
    }

    // Crear cuenta en Firebase Auth
    const userRecord = await auth.createUser({
      uid: residentId, // Usar el mismo UID que en Firestore
      email: profileData.email,
      emailVerified: false,
      password: password,
      displayName: profileData.fullName || profileData.email.split('@')[0],
    });

    console.log('Cuenta Firebase Auth creada exitosamente para:', userRecord.uid);
    return { success: true };

  } catch (error: any) {
    console.error('Error creando cuenta Auth:', error);

    if (error.code === 'auth/uid-already-exists') {
      return { success: false, error: 'El residente ya tiene una cuenta de autenticación.' };
    }
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'El email ya está en uso por otra cuenta.' };
    }

    return { success: false, error: `Error al crear cuenta: ${error.message}` };
  }
}

export async function deleteResident(
  residentId: string
): Promise<{ success: boolean; error?: string; }> {
  if (!db || !auth) {
    return { success: false, error: 'Servicios no disponibles.' };
  }

  try {
    console.log('Iniciando eliminación de residente:', residentId);

    // Primero obtener el perfil para verificar que existe
    const profileDoc = await db.collection('profiles').doc(residentId).get();
    if (!profileDoc.exists) {
      return { success: false, error: 'Residente no encontrado.' };
    }

    const profileData = profileDoc.data();
    console.log('Perfil encontrado:', profileData);

    // Obtener vehículos asociados al residente
    const vehiclesSnap = await db.collection('vehicles').where('userId', '==', residentId).get();
    const vehicleIds = vehiclesSnap.docs.map(doc => doc.id);
    console.log('Vehículos encontrados:', vehicleIds.length);

    // Obtener asignaciones de parqueadero activas
    const assignmentsSnap = await db.collection('parkingAssignments')
      .where('userId', '==', residentId)
      .where('status', '==', 'active')
      .get();

    if (!assignmentsSnap.empty) {
      return { success: false, error: 'No se puede eliminar un residente con asignaciones de parqueadero activas.' };
    }

    // Iniciar transacción para eliminación segura
    const batch = db!.batch();

    // Eliminar vehículos
    vehicleIds.forEach(vehicleId => {
      console.log('Eliminando vehículo:', vehicleId);
      batch.delete(db!.collection('vehicles').doc(vehicleId));
    });

    // Eliminar perfil
    console.log('Eliminando perfil de residente');
    batch.delete(db!.collection('profiles').doc(residentId));

    // Ejecutar transacción
    await batch.commit();
    console.log('Transacción de eliminación completada');

    // Eliminar usuario de Firebase Auth (opcional, pero recomendado)
    try {
      await auth.deleteUser(residentId);
      console.log('Usuario eliminado de Firebase Auth');
    } catch (authError) {
      console.warn('No se pudo eliminar usuario de Firebase Auth:', authError);
      // No fallar la operación si no se puede eliminar de Auth
    }

    return { success: true };

  } catch (error: any) {
    console.error('Error al eliminar residente:', error);
    return { success: false, error: 'Error al eliminar el residente.' };
  }
}
