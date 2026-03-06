'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';

const NO_SHELL_ROUTES = [
    '/',
    '/auth'
];

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isNoShellRoute = NO_SHELL_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));

    if (isNoShellRoute) {
        return <>{children}</>;
    }

    return <AppShell>{children}</AppShell>;
}
