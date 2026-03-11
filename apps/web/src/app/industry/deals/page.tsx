'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Proposal } from '@/lib/store';
import { Avatar, StatusBadge, ScoreBeetBadge, EmptyState, Skeleton } from '@/components/ui';
import {
    Search, Filter, Plus, Briefcase, Star,
    MessageSquare, FileCheck, ChevronRight,
    ArrowUpDown, Calendar, MapPin, DollarSign
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
    LIVE_SHOW: '🎤 Show', RECORDING: '🎙 Gravação', FEAT: '🤝 Feat',
    MUSIC_VIDEO: '🎬 Clipe', EVENT: '🎉 Evento', OTHER: '📌 Outro',
};

export default function IndustryDeals() {
    useAuthGuard('INDUSTRY');
    const { proposals, industryProfile, shortlists, artists, currentUser } = useStore();
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proposals' | 'shortlist'>('proposals');

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    const myProposals = proposals.filter((p) => p.industryId === industryProfile?.id || p.industryId === 'industry-demo');
    const filteredProposals = filter === 'all' ? myProposals : myProposals.filter((p) => p.status === filter);

    // Flatten categorized shortlists
    const allShortlistIds = Array.from(new Set(Object.values(shortlists).flat()));
    const shortlistArtists = artists.filter((a) => allShortlistIds.includes(a.id));

    const counts = {
        all: myProposals.length,
        SENT: myProposals.filter((p) => ['SENT', 'VIEWED'].includes(p.status)).length,
        NEGOTIATING: myProposals.filter((p) => p.status === 'NEGOTIATING').length,
        ACCEPTED: myProposals.filter((p) => p.status === 'ACCEPTED').length,
    };

    return (
        <div className="min-h-screen bg-beet-black pb-24 lg:pb-12">
            <div className="max-w-5xl mx-auto px-6 pt-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase size={14} className="text-beet-blue" />
                            <span className="text-[10px] font-black text-beet-blue uppercase tracking-[0.2em]">Fluxo de Negócios</span>
                        </div>
                        <h1 className="text-3xl font-display font-black text-white tracking-tighter">
                            CENTRAL DE <span className="text-beet-blue uppercase italic">NEGOCIAÇÕES</span>
                        </h1>
                        <p className="text-sm text-beet-gray mt-1">Gerencie propostas em andamento e sua rede de talentos.</p>
                    </div>

                    <Link
                        href="/industry/proposals/new"
                        className="bg-beet-blue text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-beet-blue/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Nova Proposta
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 mb-8">
                    {[
                        { id: 'proposals', label: 'Propostas', icon: Briefcase, count: counts.all },
                        { id: 'shortlist', label: 'Shortlist', icon: Star, count: shortlistArtists.length }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${tab === t.id ? 'text-white' : 'text-beet-muted hover:text-beet-gray'
                                }`}
                        >
                            <t.icon size={14} />
                            {t.label}
                            {t.count > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${tab === t.id ? 'bg-beet-blue text-white' : 'bg-white/5 text-beet-muted'
                                    }`}>
                                    {t.count}
                                </span>
                            )}
                            {tab === t.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-beet-blue"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {tab === 'proposals' ? (
                        <motion.div
                            key="proposals"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            {/* Filter Bar */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-[10px] font-black text-beet-muted uppercase tracking-widest mr-2 flex items-center gap-1">
                                    <Filter size={12} /> Status:
                                </span>
                                {[
                                    { id: 'all', label: 'Todas' },
                                    { id: 'SENT', label: 'Aguardando' },
                                    { id: 'NEGOTIATING', label: 'Negociando' },
                                    { id: 'ACCEPTED', label: 'Aceitas' },
                                    { id: 'REJECTED', label: 'Recusadas' }
                                ].map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f.id
                                            ? 'bg-beet-blue text-white shadow-lg shadow-beet-blue/20'
                                            : 'bg-white/5 text-beet-muted hover:bg-white/10'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}
                                </div>
                            ) : filteredProposals.length === 0 ? (
                                <EmptyState
                                    icon="📋"
                                    title="Nenhuma proposta encontrada"
                                    description="Tente ajustar seus filtros ou inicie uma nova negociação."
                                    action={<Link href="/industry/discover" className="btn-outline text-sm">Explorar Artistas</Link>}
                                />
                            ) : (
                                <div className="grid gap-4">
                                    {filteredProposals.map((p, i) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="beet-card group border-white/5 hover:border-beet-blue/20 transition-all overflow-hidden"
                                        >
                                            <div className="flex flex-col md:flex-row p-6 gap-6">
                                                {/* Artist Info */}
                                                <div className="flex items-center gap-4 md:border-r border-white/5 md:pr-8 md:min-w-[200px]">
                                                    <Avatar name={p.artistName || "Artista"} size="lg" emoji="🎤" />
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-beet-blue transition-colors truncate">{p.artistName || "Artista"}</h3>
                                                        <div className="mt-1">
                                                            <ScoreBeetBadge score={p.artistScore || 0} size="sm" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Deal Details */}
                                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Tipo</p>
                                                        <p className="text-sm font-bold text-white">{TYPE_LABELS[p.type]}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Valor</p>
                                                        <p className="text-sm font-bold text-white">R$ {Number(p.amount).toLocaleString('pt-BR')}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Atividade</p>
                                                        <div className="flex items-center gap-3 text-beet-gray text-xs">
                                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {p.messages.length}</span>
                                                            <span className="flex items-center gap-1"><FileCheck size={12} /> {p.contractVersions.length}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center lg:justify-end">
                                                        <StatusBadge status={p.status} />
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="flex items-center md:pl-4">
                                                    <Link
                                                        href={`/deals/${p.id}`}
                                                        className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-beet-muted hover:bg-beet-blue hover:text-white transition-all group/btn"
                                                    >
                                                        <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Expire / Response Deadline */}
                                            {p.responseDeadline && (
                                                <div className="px-6 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-beet-muted uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar size={10} /> Expira em: {new Date(p.responseDeadline).toLocaleDateString()}
                                                    </span>
                                                    <Link href={`/deals/${p.id}`} className="text-[9px] font-black text-beet-blue uppercase tracking-tighter hover:underline">Entrar na Sala de Negociação →</Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="shortlist"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            {shortlistArtists.length === 0 ? (
                                <EmptyState
                                    icon="⭐"
                                    title="Shortlist vazia"
                                    description="Explore a base de artistas e salve seus favoritos para futuras negociações."
                                    action={<Link href="/industry/discover" className="btn-accent px-8 py-3 rounded-2xl text-[11px] font-black uppercase">Descobrir Talentos</Link>}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shortlistArtists.map((a, i) => (
                                        <motion.div
                                            key={a.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="beet-card p-5 border-white/5 flex items-center gap-4 group"
                                        >
                                            <Avatar name={a.stageName} imageUrl={a.avatarUrl} size="lg" emoji="🎤" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white group-hover:text-beet-blue transition-colors truncate">{a.stageName}</h3>
                                                    <ScoreBeetBadge score={a.scoreBeet} size="sm" />
                                                </div>
                                                <p className="text-[10px] text-beet-muted uppercase tracking-widest mt-1 flex items-center gap-1">
                                                    <MapPin size={10} /> {a.city}, {a.state}
                                                </p>
                                                <div className="mt-3 flex gap-2">
                                                    <Link
                                                        href={`/industry/proposals/new?artistId=${a.id}&artistName=${encodeURIComponent(a.stageName)}`}
                                                        className="bg-beet-blue/10 text-beet-blue px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-beet-blue/20 hover:bg-beet-blue hover:text-white transition-all"
                                                    >
                                                        Nova Proposta
                                                    </Link>
                                                    <Link
                                                        href={`/artist/profile/${a.id}`}
                                                        className="bg-white/5 text-beet-muted px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                                                    >
                                                        Ver Perfil
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
