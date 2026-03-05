'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Proposal } from '@/lib/store';
import { Avatar, StatusBadge, ScoreBeetBadge, EmptyState, Skeleton } from '@/components/ui';

const TYPE_LABELS: Record<string, string> = {
    LIVE_SHOW: '🎤 Show', RECORDING: '🎙 Gravação', FEAT: '🤝 Feat',
    MUSIC_VIDEO: '🎬 Clipe', EVENT: '🎉 Evento', OTHER: '📌 Outro',
};

export default function IndustryDeals() {
    useAuthGuard('INDUSTRY');
    const { proposals, industryProfile, shortlist, artists } = useStore();
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proposals' | 'shortlist'>('proposals');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(t);
    }, []);

    const myProposals = proposals.filter((p) => p.industryId === 'industry-demo' || p.industryId === 'industry-1');
    const filtered = filter === 'all' ? myProposals : myProposals.filter((p) => p.status === filter);
    const shortlistArtists = artists.filter((a) => shortlist.includes(a.id));

    const counts = {
        all: myProposals.length,
        SENT: myProposals.filter((p) => ['SENT', 'VIEWED'].includes(p.status)).length,
        NEGOTIATING: myProposals.filter((p) => p.status === 'NEGOTIATING').length,
        ACCEPTED: myProposals.filter((p) => p.status === 'ACCEPTED').length,
    };

    return (
        <AppShell>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Central de Negociações</h1>
                        <p className="text-sm text-beet-muted mt-1">Propostas enviadas e shortlist</p>
                    </div>
                    <Link href="/industry/proposals/new" className="btn-accent text-sm px-4 py-2.5">+ Nova</Link>
                </div>

                {/* Tab toggle */}
                <div className="mb-5 flex rounded-xl border p-1 gap-1" style={{ borderColor: 'var(--color-border)' }}>
                    {([['proposals', `📋 Propostas (${counts.all})`], ['shortlist', `⭐ Shortlist (${shortlistArtists.length})`]] as const).map(([t, l]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                            style={{ background: tab === t ? 'rgba(0,87,255,0.15)' : 'transparent', color: tab === t ? '#0057FF' : 'var(--color-muted)' }}>
                            {l}
                        </button>
                    ))}
                </div>

                {tab === 'proposals' && (
                    <>
                        {/* Filter */}
                        <div className="mb-5 flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: `Todas (${counts.all})` },
                                { id: 'SENT', label: `Aguardando (${counts.SENT})` },
                                { id: 'NEGOTIATING', label: `Negociando (${counts.NEGOTIATING})` },
                                { id: 'ACCEPTED', label: `Aceitas (${counts.ACCEPTED})` },
                                { id: 'REJECTED', label: 'Recusadas' },
                            ].map((f) => (
                                <button key={f.id} onClick={() => setFilter(f.id)}
                                    className={`beet-pill flex-shrink-0 cursor-pointer ${filter === f.id ? 'active' : ''}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
                        ) : filtered.length === 0 ? (
                            <EmptyState icon="📋" title="Nenhuma proposta aqui"
                                action={<Link href="/industry/proposals/new" className="btn-outline text-sm">Criar proposta →</Link>} />
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((p, i) => (
                                    <motion.div key={p.id} className="beet-card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={p.artistName || 'Artista'} size="sm" emoji="🎤" />
                                                <div>
                                                    <p className="font-semibold text-white">{p.artistName || 'Artista'}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <ScoreBeetBadge score={p.artistScore || 0} />
                                                        <span className="text-[10px] text-beet-muted">{TYPE_LABELS[p.type]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusBadge status={p.status} />
                                        </div>

                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                            <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                                <p className="text-[10px] text-beet-muted">Valor</p>
                                                <p className="text-sm font-black text-white">R$ {(Number(p.amount) / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                                <p className="text-[10px] text-beet-muted">Mensagens</p>
                                                <p className="text-sm font-black text-white">{p.messages.filter((m) => !m.isSystem).length}</p>
                                            </div>
                                            <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                                <p className="text-[10px] text-beet-muted">Contratos</p>
                                                <p className="text-sm font-black text-white">{p.contractVersions.length}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <Link href={`/deals/${p.id}`}
                                                className="btn-outline flex-1 py-2 text-center text-xs">
                                                💬 Abrir Deal Room
                                            </Link>
                                            <Link href={`/artist/profile/${p.artistId}`}
                                                className="rounded-xl border px-3 py-2 text-xs text-beet-muted hover:text-white transition-colors"
                                                style={{ borderColor: 'var(--color-border)' }}>
                                                👤
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === 'shortlist' && (
                    <div>
                        {shortlistArtists.length === 0 ? (
                            <EmptyState icon="⭐" title="Shortlist vazia"
                                description="Salve artistas de interesse no Descobrir"
                                action={<Link href="/industry/discover" className="btn-outline text-sm">Descobrir talentos →</Link>} />
                        ) : (
                            <div className="space-y-3">
                                {shortlistArtists.map((a, i) => (
                                    <motion.div key={a.id} className="beet-card flex items-center gap-3 p-4"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                        <Avatar name={a.stageName} size="md" emoji="🎤" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white">{a.stageName}</p>
                                            <p className="text-xs text-beet-muted">{a.genres.join(', ')} · {a.city}, {a.state}</p>
                                        </div>
                                        <ScoreBeetBadge score={a.scoreBeet} />
                                        <div className="flex flex-col gap-1.5">
                                            <Link href={`/artist/profile/${a.id}`} className="btn-outline px-3 py-1.5 text-[10px]">Ver</Link>
                                            <Link href={`/industry/proposals/new?artistId=${a.id}&artistName=${encodeURIComponent(a.stageName)}`}
                                                className="btn-accent px-3 py-1.5 text-[10px] text-center">Proposta</Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
