import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uid, role } = await request.json();

    const response = NextResponse.json({ success: true });

    // Establecer cookie de autenticación simple (para desarrollo)
    response.cookies.set('authenticated', 'true', {
      maxAge: 60 * 60 * 24 * 5, // 5 días
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Guardar UID y role en cookies (no httpOnly para que el cliente pueda leer)
    response.cookies.set('user_uid', uid, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    response.cookies.set('user_role', role, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}