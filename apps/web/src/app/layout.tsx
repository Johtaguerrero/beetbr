import type { Metadata } from 'next';
import './globals.css';
import { AppShellWrapper } from '@/components/shell/AppShellWrapper';

export const metadata: Metadata = {
    title: 'BeatBR — A vitrine da nova música brasileira',
    description: 'Conecte artistas e empresas da música. Deal Room, Score Beet, propostas e contratos — tudo em um só lugar.',
    keywords: ['música brasileira', 'artistas', 'gravadoras', 'marketplace musical'],
    openGraph: {
        title: 'BeatBR',
        description: 'A vitrine da nova música brasileira',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#0B0B0B" />
            </head>
            <body>
                <AppShellWrapper>
                    {children}
                </AppShellWrapper>
            </body>
        </html>
    );
}

