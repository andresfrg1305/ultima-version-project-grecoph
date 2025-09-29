
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, GanttChartSquare, Users, Bell, LogOut, Settings } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { Button } from '../ui/button';
import { GrecophIcon } from './grecoph-icon';
import { useRouter } from 'next/navigation';

interface AppSidebarProps {
  user: Profile;
}

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/parking', icon: Car, label: 'Parqueaderos' },
  { href: '/admin/projects', icon: GanttChartSquare, label: 'Proyectos' },
  { href: '/admin/residents', icon: Users, label: 'Residentes' },
  { href: '/admin/notifications', icon: Bell, label: 'Notificaciones' },
];

const residentNavItems = [
  { href: '/resident/dashboard', icon: LayoutDashboard, label: 'Mi Dashboard' },
  { href: '/resident/parking', icon: Car, label: 'Mi Parqueadero' },
  { href: '/resident/projects', icon: GanttChartSquare, label: 'Proyectos' },
  { href: '/resident/notifications', icon: Bell, label: 'Mis Notificaciones' },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = user.role === 'admin' ? adminNavItems : residentNavItems;

  const handleLogout = () => {
    // In a real app, this would call a logout function.
    // For now, it just navigates to the landing page.
    router.push('/');
  };

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GrecophIcon className="h-6 w-6 text-primary" />
            <span className="">Grecoph</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  pathname.startsWith(item.href) && item.href !== '/admin/dashboard' && item.href !== '/resident/dashboard' || pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <div className="border-t pt-4">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
