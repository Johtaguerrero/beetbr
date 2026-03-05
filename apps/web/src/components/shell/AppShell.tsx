'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Trophy, PlusCircle, FileText, User, ShoppingBag,
    Repeat2, FolderOpen, Gem, Settings, LayoutDashboard,
    Search, Bell, LogOut, ChevronRight, X, Home,
    BarChart2, Users, Briefcase, Music, Star, Package,
    Sparkles, MessageSquare, Lock, Radio, Mic2, Heart,
    Share2, Play, Send, Check, AlertCircle, Info, Sun, Moon,
    ChevronLeft
} from 'lucide-react';
import { useStore, type Notification } from '@/lib/store';
import { ScoreBeetBadge, Avatar, Spinner } from '@/components/ui';
import { ToastContainer } from '@/components/ui/Toast';

// ── Cookie helpers ────────────────────────────────────────────
export function setAuthCookies(role: string) {
    document.cookie = `BeatBR-auth=true; path=/; max-age=604800`;
    document.cookie = `BeatBR-role=${role}; path=/; max-age=604800`;
}
export function clearAuthCookies() {
    document.cookie = 'BeatBR-auth=; path=/; max-age=0';
    document.cookie = 'BeatBR-role=; path=/; max-age=0';
}

// ── Nav icons size ────────────────────────────────────────────
const IC = 16; // sidebar icon size
const TC = 22; // tab icon size

// ── Navigation config ─────────────────────────────────────────
const ARTIST_NAV = [
    { label: 'Feed', href: '/artist/feed', icon: <Zap size={IC} strokeWidth={2} /> },
    { label: 'Rankings', href: '/rankings', icon: <Trophy size={IC} strokeWidth={2} /> },
    { label: 'Publicar', href: '/artist/post/new', icon: <PlusCircle size={IC} strokeWidth={2} />, highlight: true },
    { label: 'Negociações', href: '/artist/deals', icon: <Briefcase size={IC} strokeWidth={2} /> },
    { label: 'Meu Perfil', href: '/artist/profile/me', icon: <User size={IC} strokeWidth={2} /> },
    { divider: true },
    { label: 'Marketplace', href: '/marketplace', icon: <ShoppingBag size={IC} strokeWidth={2} /> },
    { label: 'Vender', href: '/artist/marketplace', icon: <Gem size={IC} strokeWidth={2} /> },
    { collabTabs: true },  // ← inline tab group for Colaborações / Minhas Colabs
    { label: 'Configurações', href: '/settings', icon: <Settings size={IC} strokeWidth={2} /> },
];

const INDUSTRY_NAV = [
    { label: 'Dashboard', href: '/industry/dashboard', icon: <LayoutDashboard size={IC} strokeWidth={2} /> },
    { label: 'Descobrir', href: '/industry/discover', icon: <Search size={IC} strokeWidth={2} /> },
    { label: 'Nova Proposta', href: '/industry/proposals/new', icon: <PlusCircle size={IC} strokeWidth={2} />, highlight: true },
    { label: 'Negociações', href: '/industry/deals', icon: <Briefcase size={IC} strokeWidth={2} /> },
    { label: 'Rankings', href: '/rankings', icon: <Trophy size={IC} strokeWidth={2} /> },
    { divider: true },
    { label: 'Marketplace', href: '/marketplace', icon: <ShoppingBag size={IC} strokeWidth={2} /> },
    { label: 'Colaborações', href: '/collabs', icon: <Repeat2 size={IC} strokeWidth={2} /> },
    { label: 'Configurações', href: '/settings', icon: <Settings size={IC} strokeWidth={2} /> },
];

// ── Collab Tab Group (artist sidebar) ────────────────────────
function CollabTabGroup({ pathname, sidebarExpanded }: { pathname: string; sidebarExpanded?: boolean }) {
    const COLLAB_TABS = [
        {
            label: 'COLABS',
            sub: 'Explorar',
            href: '/collabs',
            icon: <Repeat2 size={sidebarExpanded ? 18 : 22} strokeWidth={1.75} />,
        },
        {
            label: 'MINHAS',
            sub: 'Arquivos',
            href: '/artist/collabs',
            icon: <FolderOpen size={sidebarExpanded ? 18 : 22} strokeWidth={1.75} />,
        },
    ];

    return (
        <div className="px-2 py-1.5">
            {/* Header */}
            {sidebarExpanded && (
                <div className="flex items-center gap-2 px-1 mb-2">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(0,255,136,0.4), transparent)' }} />
                    <span style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.15em',
                        color: 'var(--color-accent)',
                    }}>COLABS</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.4))' }} />
                </div>
            )}

            {/* Tab cards — stacked vertically */}
            <div className="space-y-px overflow-hidden" style={{
                border: sidebarExpanded ? '1px solid var(--color-nav-border)' : 'none',
                borderRadius: '2px',
            }}>
                {COLLAB_TABS.map((tab, i) => {
                    const active = pathname === tab.href || pathname.startsWith(tab.href);
                    return (
                        <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }} title={!sidebarExpanded ? tab.label : undefined}>
                            <motion.div
                                whileHover={{ x: sidebarExpanded ? 4 : 0, scale: !sidebarExpanded ? 1.05 : 1 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                className={`flex items-center ${sidebarExpanded ? 'gap-3 px-3 py-3' : 'justify-center py-4 mb-2'} relative transition-colors`}
                                style={{
                                    background: active ? 'var(--color-accent-dim)' : 'transparent',
                                    borderLeft: active && sidebarExpanded
                                        ? '3px solid var(--color-accent)'
                                        : '3px solid transparent',
                                    borderBottom: (i === 0 && sidebarExpanded) ? '1px solid var(--color-nav-border)' : 'none',
                                    cursor: 'pointer',
                                    borderRadius: sidebarExpanded ? 0 : '12px',
                                }}
                            >
                                {/* Icon */}
                                <span style={{
                                    color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                                    filter: active ? 'drop-shadow(0 0 6px var(--color-accent-glow))' : 'none',
                                    transition: 'all 0.15s ease',
                                    flexShrink: 0,
                                }}>
                                    {tab.icon}
                                </span>

                                {/* Labels */}
                                {sidebarExpanded && (
                                    <div className="flex flex-col min-w-0">
                                        <span style={{
                                            fontFamily: 'Syne, sans-serif',
                                            fontSize: '16px',
                                            fontWeight: 800,
                                            letterSpacing: '-0.01em',
                                            color: active ? 'var(--color-accent)' : 'var(--color-gray)',
                                            lineHeight: 1,
                                            textTransform: 'uppercase',
                                        }}>{tab.label}</span>
                                        <span style={{
                                            fontFamily: 'Space Grotesk, sans-serif',
                                            fontSize: '14px',
                                            color: active ? 'rgba(0,255,136,0.6)' : 'var(--color-muted)',
                                            marginTop: '4px',
                                        }}>{tab.sub}</span>
                                    </div>
                                )}

                                {/* Active dot */}
                                {active && sidebarExpanded && (
                                    <motion.div
                                        layoutId="collab-dot"
                                        className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                                        style={{ background: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent-glow)' }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// ── Notification Panel ────────────────────────────────────────
function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { notifications, markNotificationAsRead, clearAllNotifications } = useStore();
    const router = useRouter();
    if (!open) return null;

    const iconFor = (type: string) => {
        if (type === 'CONTRACT') return <FileText size={16} strokeWidth={2} />;
        if (type === 'deal' || type === 'PROPOSAL') return <Briefcase size={16} strokeWidth={2} />;
        if (type === 'MESSAGE') return <MessageSquare size={16} strokeWidth={2} />;
        return <Bell size={16} strokeWidth={2} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-4 bottom-auto z-[100] flex flex-col rounded-2xl p-4 shadow-2xl lg:left-auto lg:right-4 lg:top-4 lg:w-80"
            style={{
                background: 'var(--color-nav-bg)',
                backdropFilter: 'blur(24px)',
                border: '1px solid var(--color-nav-border)',
                borderTop: '1px solid var(--color-nav-border)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,136,0.08)',
            }}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-beet-green animate-pulse" style={{ boxShadow: '0 0 8px #00FF88' }} />
                    <h3 className="font-display text-sm font-bold text-white tracking-wide">Notificações</h3>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={clearAllNotifications} className="text-[10px] font-bold uppercase tracking-widest text-beet-muted hover:text-white transition-colors">Limpar</button>
                    <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-beet-muted hover:text-white hover:bg-white/10 transition-all">
                        <X size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                        <Bell size={28} strokeWidth={1.5} className="mx-auto mb-2 text-beet-muted opacity-40" />
                        <p className="text-xs text-beet-muted">Nenhuma notificação por enquanto.</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            whileHover={{ x: 2 }}
                            onClick={() => {
                                markNotificationAsRead(n.id);
                                if (n.link) router.push(n.link);
                                onClose();
                            }}
                            className={`group relative cursor-pointer rounded-xl p-3 transition-all ${!n.read ? 'bg-white/5' : 'opacity-60'}`}
                            style={{
                                border: !n.read ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`mt-0.5 flex-shrink-0 ${!n.read ? 'text-beet-green' : 'text-beet-muted'}`}>{iconFor(n.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white group-hover:text-neon transition-colors leading-none mb-1">{n.title}</p>
                                    <p className="text-[10px] text-beet-muted line-clamp-2 leading-relaxed">{n.message}</p>
                                    <p className="mt-1 text-[8px] text-beet-muted opacity-60">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {!n.read && <div className="h-1.5 w-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

// ── Sidebar (desktop) ─────────────────────────────────────────
function Sidebar() {
    const pathname = usePathname();
    const { currentUser, artistProfile, industryProfile, logout, notifications, theme, toggleTheme, sidebarExpanded, toggleSidebar, showNotifications, toggleNotifications } = useStore();
    const router = useRouter();
    const isIndustry = currentUser?.role === 'INDUSTRY';
    const nav = isIndustry ? INDUSTRY_NAV : ARTIST_NAV;
    const displayName = artistProfile?.stageName || industryProfile?.companyName || currentUser?.email || 'Usuário';
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        clearAuthCookies();
        router.push('/');
    };

    return (
        <aside
            className={`hidden h-screen flex-shrink-0 flex-col lg:flex sticky top-0 relative overflow-x-hidden transition-all duration-300 ease-in-out z-[100]`}
            style={{
                width: sidebarExpanded ? 260 : 80,
                background: 'var(--color-nav-bg)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid var(--color-nav-border)',
            }}
        >
            {/* Accent top line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.6), transparent)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-40 -translate-y-1/2 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 70%)' }} />

            {/* Logo & Bell */}
            <div className={`flex items-center ${sidebarExpanded ? 'justify-between px-4' : 'flex-col justify-center gap-4'} py-5`}>
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                    {sidebarExpanded ? (
                        <span className="font-display text-2xl font-black tracking-tight animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                            <span className="text-neon">BEAT</span><span className="text-[var(--color-primary-text,white)]">BR</span>
                        </span>
                    ) : (
                        <span className="font-display text-xl font-black tracking-tight animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                            <span className="text-[var(--color-primary-text,white)]">B</span><span className="text-neon">B</span>
                        </span>
                    )}
                    {isIndustry && sidebarExpanded && (
                        <span className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest" style={{ background: 'var(--color-blue-dim)', color: 'var(--color-blue)', border: '1px solid rgba(79,124,255,0.3)' }}>PRO</span>
                    )}
                </Link>

                <div className={`flex items-center ${sidebarExpanded ? 'gap-2' : 'flex-col gap-3'}`}>
                    <button
                        onClick={toggleTheme}
                        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/5"
                        style={{
                            background: 'var(--color-glass-btn)',
                            border: '1px solid var(--color-nav-border)',
                            color: theme === 'light' ? '#FFD400' : 'var(--color-muted)',
                        }}
                        title="Alternar Tema"
                    >
                        {theme === 'light' ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
                    </button>
                    <button
                        onClick={() => toggleNotifications()}
                        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/5"
                        style={{
                            background: showNotifications ? 'var(--color-accent-dim)' : 'var(--color-glass-btn)',
                            border: '1px solid var(--color-nav-border)',
                            color: showNotifications ? 'var(--color-accent)' : 'var(--color-muted)',
                        }}
                        title="Notificações"
                    >
                        <Bell size={15} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-black" style={{ background: '#FF3B5C', boxShadow: '0 0 8px rgba(255,59,92,0.6)' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
                {nav.map((item: any, i) => {
                    if (item.divider) return (
                        <div key={`div-${i}`} className="px-3 py-2">
                            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-nav-border), transparent)' }} />
                        </div>
                    );
                    // ── Collab inline tab group ──
                    if (item.collabTabs) return <CollabTabGroup key="collab-tabs" pathname={pathname} sidebarExpanded={sidebarExpanded} />;

                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href + item.label} href={item.href} title={!sidebarExpanded ? item.label : undefined}>
                            <motion.span
                                whileHover={{ x: sidebarExpanded ? 3 : 0, scale: sidebarExpanded ? 1 : 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`sidebar-link flex items-center ${sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-0 py-3 mb-1'} ${active ? 'active' : ''} ${item.highlight ? 'sidebar-link-highlight' : ''}`}
                                style={{ borderRadius: sidebarExpanded ? '8px' : '12px' }}
                            >
                                <span className={`flex-shrink-0 flex items-center justify-center ${sidebarExpanded ? 'w-4 h-4' : 'w-6 h-6'}`}>
                                    <div style={{ transform: sidebarExpanded ? 'scale(1)' : 'scale(1.2)' }}>
                                        {item.icon}
                                    </div>
                                </span>
                                {sidebarExpanded && <span className="truncate">{item.label}</span>}
                                {active && sidebarExpanded && (
                                    <motion.span layoutId="sidebar-dot" className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent-glow)' }} />
                                )}
                            </motion.span>
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="p-3 mt-auto space-y-2" style={{ borderTop: '1px solid var(--color-nav-border)' }}>
                {sidebarExpanded ? (
                    <div className="flex items-center gap-2 rounded-xl p-2.5 transition-all cursor-pointer glint" style={{ background: 'var(--color-glass-btn)', border: '1px solid var(--color-nav-border)' }}>
                        <Avatar name={displayName} size="sm" emoji={isIndustry ? '🏢' : '🎵'} isIndustry={isIndustry} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white">{displayName}</p>
                            {!isIndustry && artistProfile && <ScoreBeetBadge score={artistProfile.scoreBeet} />}
                            {isIndustry && <p className="text-[10px]" style={{ color: 'var(--color-blue)' }}>{industryProfile?.type}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center rounded-xl p-2 mb-2 transition-all cursor-pointer glint" style={{ background: 'var(--color-glass-btn)', border: '1px solid var(--color-nav-border)' }} title={displayName}>
                        <Avatar name={displayName} size="sm" emoji={isIndustry ? '🏢' : '🎵'} isIndustry={isIndustry} />
                    </div>
                )}
                <div className={`flex ${sidebarExpanded ? 'gap-2' : 'flex-col gap-2'}`}>
                    <button
                        onClick={handleLogout}
                        className={`flex-1 text-left rounded-xl ${sidebarExpanded ? 'px-3 py-2' : 'p-2 justify-center'} text-xs font-bold flex items-center gap-2 transition-all text-beet-muted hover:text-beet-red hover:bg-white/5`}
                        style={{ letterSpacing: '0.04em' }}
                        title="Sair"
                    >
                        <LogOut size={16} strokeWidth={2} />
                        {sidebarExpanded && <span>Sair</span>}
                    </button>
                    <button
                        onClick={toggleSidebar}
                        className={`rounded-xl ${sidebarExpanded ? 'px-3 py-2' : 'p-2 justify-center'} flex items-center transition-all text-beet-muted hover:text-white hover:bg-white/10`}
                        title={sidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
                        style={{ background: 'var(--color-glass-btn)', border: '1px solid var(--color-nav-border)' }}
                    >
                        {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </aside >
    );
}

// ── Tab bar (mobile) ──────────────────────────────────────────
function TabBar() {
    const pathname = usePathname();
    const { currentUser } = useStore();
    const isIndustry = currentUser?.role === 'INDUSTRY';

    const tabs = isIndustry
        ? [
            { label: 'Dash', href: '/industry/dashboard', icon: <LayoutDashboard size={TC} strokeWidth={1.75} /> },
            { label: 'Market', href: '/marketplace', icon: <ShoppingBag size={TC} strokeWidth={1.75} /> },
            { label: 'Post', href: '/industry/proposals/new', icon: <PlusCircle size={TC} strokeWidth={2.5} />, special: true },
            { label: 'Colabs', href: '/collabs', icon: <Repeat2 size={TC} strokeWidth={1.75} /> },
            { label: 'Deals', href: '/industry/deals', icon: <Briefcase size={TC} strokeWidth={1.75} /> },
        ]
        : [
            { label: 'Feed', href: '/artist/feed', icon: <Zap size={TC} strokeWidth={1.75} /> },
            { label: 'Market', href: '/marketplace', icon: <ShoppingBag size={TC} strokeWidth={1.75} /> },
            { label: 'Post', href: '/artist/post/new', icon: <PlusCircle size={TC} strokeWidth={2.5} />, special: true },
            { label: 'Colabs', href: '/collabs', icon: <Repeat2 size={TC} strokeWidth={1.75} /> },
            { label: 'Perfil', href: '/artist/profile/me', icon: <User size={TC} strokeWidth={1.75} /> },
        ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden"
            style={{
                background: 'var(--color-nav-bg)',
                backdropFilter: 'blur(32px)',
                borderTop: '1px solid var(--color-nav-border)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
            }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,136,0.4) 50%, transparent 100%)' }} />

            {tabs.map((tab: any) => {
                const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                if (tab.special) {
                    return (
                        <Link key={tab.href} href={tab.href} className="flex-1 flex items-center justify-center py-2">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                                style={{
                                    background: 'var(--color-accent)',
                                    color: '#000',
                                    boxShadow: '0 0 20px rgba(0,255,136,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                                }}
                            >
                                {tab.icon}
                            </motion.div>
                        </Link>
                    );
                }
                return (
                    <Link key={tab.href} href={tab.href} className={`tab-item ${active ? 'active' : ''}`}>
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="font-black uppercase tracking-widest" style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', marginTop: '2px' }}>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

// ── AppShell ──────────────────────────────────────────────────
interface AppShellProps {
    children: React.ReactNode;
    noPadding?: boolean;
}

export function AppShell({ children, noPadding = false }: AppShellProps) {
    const { currentUser, notifications, theme, toggleTheme, showNotifications, toggleNotifications } = useStore();
    const isIndustry = currentUser?.role === 'INDUSTRY';
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('theme-light');
            document.body.classList.add('theme-light');
        } else {
            document.documentElement.classList.remove('theme-light');
            document.body.classList.remove('theme-light');
        }
    }, [theme]);

    return (
        <div className={`flex min-h-screen ${isIndustry ? 'theme-industry' : ''}`}>
            {/* Mobile Header */}
            <header
                className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 lg:hidden"
                style={{
                    background: 'var(--color-nav-bg)',
                    backdropFilter: 'blur(24px)',
                    borderBottom: '1px solid var(--color-nav-border)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
            >
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.35), transparent)' }} />

                <span className="font-display text-xl font-black tracking-tight animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                    <span className="text-neon">BEAT</span><span className="text-[var(--color-primary-text,white)]">BR</span>
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                        style={{
                            background: 'var(--color-glass-btn)',
                            border: '1px solid var(--color-nav-border)',
                            color: theme === 'light' ? '#FFD400' : 'var(--color-muted)',
                        }}
                    >
                        {theme === 'light' ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
                    </button>
                    <button
                        onClick={() => toggleNotifications()}
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                        style={{
                            background: showNotifications ? 'var(--color-accent-dim)' : 'var(--color-glass-btn)',
                            border: '1px solid var(--color-nav-border)',
                            color: showNotifications ? 'var(--color-accent)' : 'var(--color-muted)',
                        }}
                    >
                        <Bell size={17} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-black" style={{ background: '#FF3B5C', boxShadow: '0 0 10px rgba(255,59,92,0.7)' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {showNotifications && (
                    <NotificationPanel open={showNotifications} onClose={() => toggleNotifications(false)} />
                )}
            </AnimatePresence>

            <Sidebar />

            <main className="flex-1 overflow-hidden pt-15 lg:pt-0">
                <motion.div
                    className={noPadding ? 'h-full' : 'h-full'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            </main>
            <TabBar />
            <ToastContainer />
        </div>
    );
}

// ── Auth guard hook ───────────────────────────────────────────
export function useAuthGuard(requiredRole?: 'ARTIST' | 'INDUSTRY') {
    const { currentUser, isAuthenticated } = useStore();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return; // Wait for Zustand to hydrate

        if (!isAuthenticated) {
            router.replace('/auth');
            return;
        }
        if (requiredRole && currentUser?.role !== requiredRole) {
            const dest = currentUser?.role === 'ARTIST' ? '/artist/feed' : '/industry/dashboard';
            router.replace(dest);
        }
    }, [isHydrated, isAuthenticated, currentUser, requiredRole, router]);

    return { user: currentUser, ready: isAuthenticated && isHydrated };
}

// ── Re-export Lucide icons for use across app ─────────────────
export {
    Zap, Trophy, PlusCircle, FileText, User, ShoppingBag,
    Repeat2, FolderOpen, Gem, Settings, LayoutDashboard,
    Search, Bell, LogOut, ChevronRight, X, Home,
    BarChart2, Users, Briefcase, Music, Star, Package,
    Sparkles, MessageSquare, Lock, Radio, Mic2, Heart,
    Share2, Play, Send, Check, AlertCircle, Info, Sun, Moon,
    ChevronLeft
};
