import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Limpiar las cookies de autenticación
    const cookiesToClear = ['authenticated', 'user_uid', 'user_role'];
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        httpOnly: cookieName === 'authenticated', // Solo authenticated es httpOnly
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}