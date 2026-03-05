'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore } from '@/lib/store';
import { Avatar, ScoreBeetBadge, StatusBadge, Skeleton } from '@/components/ui';

function KpiCard({ label, value, icon, sub }: { label: string; value: string | number; icon: string; sub?: string }) {
    return (
        <motion.div className="beet-card p-5" whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="section-title mb-1">{label}</p>
                    <p className="text-3xl font-black text-white">{value}</p>
                    {sub && <p className="mt-1 text-xs" style={{ color: 'var(--color-accent)' }}>{sub}</p>}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(0,87,255,0.15)' }}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

export default function IndustryDashboard() {
    useAuthGuard('INDUSTRY');
    const { proposals, shortlist, artists, industryProfile } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    const myProposals = proposals.filter((p) => p.industryId === 'industry-demo' || p.industryId === 'industry-1');
    const stats = {
        sent: myProposals.filter((p) => p.status !== 'DRAFT').length,
        negotiating: myProposals.filter((p) => p.status === 'NEGOTIATING').length,
        accepted: myProposals.filter((p) => p.status === 'ACCEPTED').length,
        shortlist: shortlist.length,
    };

    const shortlistArtists = artists.filter((a) => shortlist.includes(a.id));

    return (
        <AppShell>
            <div className="px-4 py-6 pb-24 lg:px-8 lg:pb-6 overflow-y-auto max-h-screen">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Olá, {industryProfile?.companyName || 'Empresa'} 👋
                        </h1>
                        <p className="text-sm text-beet-muted">Resumo das suas negociações</p>
                    </div>
                    <Link href="/industry/proposals/new" className="btn-accent text-sm px-4 py-2.5">+ Nova Proposta</Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                    </div>
                ) : (
                    <>
                        {/* KPI grid */}
                        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <KpiCard label="Propostas enviadas" value={stats.sent} icon="📋" />
                            <KpiCard label="Em negociação" value={stats.negotiating} icon="🤝" sub={stats.negotiating > 0 ? 'Ativas agora' : undefined} />
                            <KpiCard label="Contratos fechados" value={stats.accepted} icon="✅" />
                            <KpiCard label="Shortlist" value={stats.shortlist} icon="⭐" sub={stats.shortlist > 0 ? 'Artistas salvos' : undefined} />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Recent proposals */}
                            <div className="beet-card p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="font-semibold text-white">Negociações recentes</p>
                                    <Link href="/industry/deals" className="text-xs text-beet-blue hover:underline">Ver todas →</Link>
                                </div>
                                {myProposals.length === 0 ? (
                                    <div className="py-8 text-center space-y-2">
                                        <p className="text-2xl">📋</p>
                                        <p className="text-sm text-beet-muted">Nenhuma proposta ainda</p>
                                        <Link href="/industry/discover" className="btn-outline text-xs">Descobrir artistas →</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myProposals.slice(0, 4).map((p) => (
                                            <Link href={`/deals/${p.id}`} key={p.id}
                                                className="flex items-center justify-between rounded-xl p-2.5 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={p.artistName || 'Artista'} size="sm" emoji="🎤" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{p.artistName}</p>
                                                        <p className="text-[10px] text-beet-muted">R$ {Number(p.amount).toLocaleString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={p.status} />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Shortlist */}
                            <div className="beet-card p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="font-semibold text-white">Minha shortlist</p>
                                    <Link href="/industry/discover" className="text-xs text-beet-blue hover:underline">Explorar →</Link>
                                </div>
                                {shortlistArtists.length === 0 ? (
                                    <div className="py-8 text-center space-y-2">
                                        <p className="text-2xl">⭐</p>
                                        <p className="text-sm text-beet-muted">Salve artistas que você tem interesse</p>
                                        <Link href="/industry/discover" className="btn-outline text-xs">Descobrir talentos →</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {shortlistArtists.slice(0, 4).map((a) => (
                                            <div key={a.id} className="flex items-center gap-3">
                                                <Avatar name={a.stageName} size="sm" emoji="🎤" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white">{a.stageName}</p>
                                                    <p className="text-[10px] text-beet-muted">{a.genres.join(', ')} · {a.city}</p>
                                                </div>
                                                <ScoreBeetBadge score={a.scoreBeet} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                                { icon: '🔍', label: 'Descobrir talentos', href: '/industry/discover' },
                                { icon: '📋', label: 'Nova proposta', href: '/industry/proposals/new' },
                                { icon: '🏆', label: 'Ver rankings', href: '/rankings' },
                                { icon: '⚙️', label: 'Configurações', href: '/settings' },
                            ].map((action) => (
                                <Link key={action.href} href={action.href}
                                    className="beet-card flex flex-col items-center gap-2 p-4 text-center hover:bg-beet-card/80 transition-colors">
                                    <span className="text-2xl">{action.icon}</span>
                                    <p className="text-xs font-semibold text-white">{action.label}</p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
