
import React from 'react';
import { AppSidebar } from '@/components/app/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserNav } from '@/components/app/user-nav';
import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import { getUserProfile } from '@/lib/firebase/server';
import { cookies } from 'next/headers';
import type { Profile } from '@/lib/types';
import { AuthChecker } from '@/components/auth-checker';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const uid = cookieStore.get('user_uid')?.value;
  const role = cookieStore.get('user_role')?.value;

  let user: Profile;

  if (uid) {
    const profile = await getUserProfile(uid);
    if (profile) {
      user = {
        ...profile,
        createdAt: profile.createdAt instanceof Date ? profile.createdAt : new Date(profile.createdAt),
      };
    } else {
      // Fallback si no se encuentra el perfil
      user = {
        id: uid,
        email: 'user@example.com',
        fullName: 'User',
        role: (role as 'admin' | 'resident') || 'admin',
        phone: '',
        interiorNumber: 0,
        houseNumber: '',
        createdAt: new Date(),
      } as Profile;
    }
  } else {
    // Fallback si no hay uid
    user = {
      id: 'admin-mock',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'admin',
      phone: '',
      interiorNumber: 0,
      houseNumber: '',
      createdAt: new Date(),
    } as Profile;
  }

  return (
    <>
      <AuthChecker />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar user={user} />
          <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
              <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                      type="search"
                      placeholder="Buscar..."
                      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 h-9 rounded-md border border-input"
                  />
              </div>
              <UserNav user={user} />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}

