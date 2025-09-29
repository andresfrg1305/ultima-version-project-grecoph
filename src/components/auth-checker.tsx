'use client';

import { useEffect } from 'react';

export function AuthChecker() {
  useEffect(() => {
    function getCookie(name: string) {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    }

    function checkAuth() {
      // Verificar si las cookies de autenticación existen
      const userUid = getCookie('user_uid');
      const userRole = getCookie('user_role');

      console.log('Verificando cookies desde AuthChecker:', { userUid, userRole });

      if (!userUid || !userRole) {
        console.log('No hay cookies válidas, redirigiendo a login desde AuthChecker');
        // No hay cookies válidas, redirigir directamente al login
        window.location.replace('/login');
      }
    }

    // Verificar inmediatamente cuando el componente se monta
    checkAuth();

    // También verificar cuando la página se restaura desde cache (bfcache)
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        console.log('Página restaurada desde bfcache, verificando autenticación');
        // La página vino del bfcache, verificar autenticación
        checkAuth();
      }
    }

    window.addEventListener('pageshow', handlePageShow);

    // Cleanup
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}