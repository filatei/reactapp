'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Building2, Home, List, Bell, Settings, Users } from 'lucide-react';

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAdmin = session?.user?.role === 'admin';

    const routes = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: Home,
            active: pathname === '/dashboard',
        },
        {
            href: '/tasks',
            label: 'Tasks',
            icon: List,
            active: pathname === '/tasks',
        },
        {
            href: '/estates',
            label: 'Join Estate',
            icon: Building2,
            active: pathname === '/estates',
            show: !isAdmin && !session?.user?.estate,
        },
        {
            href: '/notifications',
            label: 'Notifications',
            icon: Bell,
            active: pathname === '/notifications',
        },
        {
            href: '/profile',
            label: 'Profile',
            icon: Settings,
            active: pathname === '/profile',
        },
        {
            href: '/admin',
            label: 'Admin',
            icon: Users,
            active: pathname.startsWith('/admin'),
            show: isAdmin,
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-around p-2">
                {routes.map((route) => {
                    if (route.show === false) return null;
                    
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'flex flex-col items-center justify-center min-w-[4rem] p-2 rounded-md transition-colors',
                                route.active ? 'text-primary' : 'text-muted-foreground',
                                'hover:text-primary hover:bg-accent'
                            )}
                            title={route.label}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs mt-1">{route.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
} 