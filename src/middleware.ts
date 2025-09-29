import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/server'; // Usar la configuración del servidor

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas protegidas
  const protectedRoutes = ['/admin', '/resident'];

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Verificar cookie de autenticación simple
    const authCookie = request.cookies.get('authenticated')?.value;

    if (!authCookie || authCookie !== 'true') {
      // No está autenticado, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Usuario autenticado, continuar con headers de no-cache
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Para rutas no protegidas, continuar
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/resident/:path*'],
};