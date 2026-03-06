'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Proposal } from '@/lib/store';
import { Avatar, StatusBadge, ScoreBeetBadge, EmptyState, Skeleton } from '@/components/ui';

const TYPE_LABELS: Record<string, string> = {
    LIVE_SHOW: '🎤 Show ao vivo', RECORDING: '🎙 Gravação', FEAT: '🤝 Feat',
    MUSIC_VIDEO: '🎬 Clipe', EVENT: '🎉 Evento', OTHER: '📌 Outro',
};

function ProposalCard({ proposal, role }: { proposal: Proposal; role: 'ARTIST' | 'INDUSTRY' }) {
    const { acceptProposal, rejectProposal, cancelProposal } = useStore();
    const isArtist = role === 'ARTIST';
    const canAct = isArtist && ['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status);
    const canCancel = !isArtist && ['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status);
    const unread = proposal.messages.filter((m) => !m.isSystem).length;

    return (
        <motion.div className="beet-card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Avatar name={(isArtist ? proposal.industryName : proposal.artistName) || 'Usuário'} size="sm"
                        emoji={isArtist ? '🏢' : '🎤'} isIndustry={isArtist} />
                    <div>
                        <p className="font-semibold text-white">{(isArtist ? proposal.industryName : proposal.artistName) || 'Usuário'}</p>
                        <p className="text-xs text-beet-muted">{TYPE_LABELS[proposal.type]} · {isArtist ? '' : <><ScoreBeetBadge score={proposal.artistScore || 0} /></>}</p>
                    </div>
                </div>
                <StatusBadge status={proposal.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex-1 rounded-xl bg-beet-dark p-3">
                    <p className="text-[10px] text-beet-muted">Valor</p>
                    <p className="text-lg font-black text-neon">R$ {Number(proposal.amount).toLocaleString('pt-BR')}</p>
                </div>
                {proposal.date && (
                    <div className="flex-1 rounded-xl bg-beet-dark p-3">
                        <p className="text-[10px] text-beet-muted">Data</p>
                        <p className="text-sm font-semibold text-white">{new Date(proposal.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                )}
                {proposal.location && (
                    <div className="flex-1 rounded-xl bg-beet-dark p-3">
                        <p className="text-[10px] text-beet-muted">Local</p>
                        <p className="text-sm font-semibold text-white truncate">{proposal.location}</p>
                    </div>
                )}
            </div>

            {proposal.terms && (
                <p className="mt-3 text-xs text-beet-muted line-clamp-2 leading-relaxed">{proposal.terms}</p>
            )}

            <div className="mt-4 flex items-center gap-2">
                <Link href={`/deals/${proposal.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-gray)' }}>
                    💬 Deal Room {unread > 0 && <span className="rounded-full bg-beet-red px-1.5 text-[10px] text-white">{unread}</span>}
                </Link>
                {canAct && (
                    <button onClick={() => acceptProposal(proposal.id)}
                        className="flex-1 rounded-xl py-2.5 text-sm font-bold text-beet-black transition-all hover:scale-[1.02]"
                        style={{ background: 'var(--color-accent)' }}>
                        ✓ Aceitar
                    </button>
                )}
                {canAct && (
                    <button onClick={() => { if (confirm('Recusar esta proposta?')) rejectProposal(proposal.id); }}
                        className="rounded-xl border px-3 py-2.5 text-sm text-beet-red hover:bg-beet-red/10 transition-all"
                        style={{ borderColor: 'rgba(255,45,45,0.3)' }}>
                        ✕
                    </button>
                )}
                {canCancel && (
                    <button onClick={() => { if (confirm('Cancelar esta proposta?')) cancelProposal(proposal.id); }}
                        className="rounded-xl border px-3 py-2.5 text-sm text-beet-muted hover:text-beet-red hover:border-beet-red/30 transition-all"
                        style={{ borderColor: 'var(--color-border)' }}>
                        🚫
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default function ArtistDeals() {
    useAuthGuard('ARTIST');
    const { proposals, currentUser, artistProfile } = useStore();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(t);
    }, []);

    const myProposals = proposals.filter((p) => p.artistId === artistProfile?.id || p.artistId === 'artist-1');
    const filtered = filter === 'all' ? myProposals : myProposals.filter((p) => p.status === filter);

    const counts = {
        all: myProposals.length,
        new: myProposals.filter((p) => ['SENT', 'VIEWED'].includes(p.status)).length,
        NEGOTIATING: myProposals.filter((p) => p.status === 'NEGOTIATING').length,
        ACCEPTED: myProposals.filter((p) => p.status === 'ACCEPTED').length,
    };

    return (
        <>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-white">Minhas Negociações</h1>
                    <p className="text-sm text-beet-muted mt-1">Propostas recebidas de empresas</p>
                </div>

                {/* Summary strip */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                    {[
                        { label: 'Recebidas', value: counts.all, color: '#aaa' },
                        { label: 'Em negociação', value: counts.NEGOTIATING, color: '#FFD400' },
                        { label: 'Aceitas', value: counts.ACCEPTED, color: '#00FF66' },
                    ].map((s) => (
                        <div key={s.label} className="beet-card p-3 text-center">
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[10px] text-beet-muted">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {[
                        { id: 'all', label: `Todas (${counts.all})` },
                        { id: 'new', label: `Novas (${counts.new})` },
                        { id: 'NEGOTIATING', label: 'Em negociação' },
                        { id: 'ACCEPTED', label: 'Aceitas' },
                        { id: 'REJECTED', label: 'Recusadas' },
                    ].map((f) => (
                        <button key={f.id} onClick={() => setFilter(f.id)}
                            className={`beet-pill flex-shrink-0 cursor-pointer ${filter === f.id ? 'active' : ''}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <EmptyState icon="📋" title="Nenhuma proposta aqui" description="Propostas de empresas aparecerão aqui" />
                ) : (
                    <div className="space-y-4">
                        {filtered.map((p) => <ProposalCard key={p.id} proposal={p} role="ARTIST" />)}
                    </div>
                )}
            </div>
        </>
    );
}
