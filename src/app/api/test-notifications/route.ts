import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Obtener todas las notificaciones
    const notificationsSnap = await db.collection('notifications').get();
    const notifications = notificationsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Obtener perfiles de residentes
    const profilesSnap = await db.collection('profiles').where('role', '==', 'resident').get();
    const profiles = profilesSnap.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      fullName: doc.data().fullName
    }));

    return NextResponse.json({
      notifications,
      profiles,
      totalNotifications: notifications.length,
      totalProfiles: profiles.length
    });
  } catch (error) {
    console.error('Error testing notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}