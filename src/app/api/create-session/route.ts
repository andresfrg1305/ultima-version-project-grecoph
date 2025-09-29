import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verificar si Firebase Admin está configurado
    if (!auth) {
      console.warn('Firebase Admin not configured, skipping session creation');
      return NextResponse.json({ success: true, warning: 'Session not created - Firebase Admin not configured' });
    }

    // Crear session cookie que dura 5 días
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });

    // Establecer la cookie
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}