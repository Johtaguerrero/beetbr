'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore } from '@/lib/store';
import { Avatar, ScoreBeetBadge, StatusBadge, Skeleton } from '@/components/ui';
import {
    TrendingUp, Users, FileText, Star, Plus,
    ArrowUpRight, ChevronRight, LayoutDashboard,
    Briefcase, Target, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

function KpiCard({ label, value, icon: Icon, sub, color = 'blue' }: { label: string; value: string | number; icon: any; sub?: string; color?: 'blue' | 'green' | 'yellow' }) {
    const colorMap = {
        blue: 'text-beet-blue bg-beet-blue/10 border-beet-blue/20',
        green: 'text-beet-accent bg-beet-accent/10 border-beet-accent/20',
        yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="beet-card p-6 border-white/5 bg-gradient-to-br from-beet-card to-beet-black/40"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">{label}</p>
                    <p className="text-3xl font-display font-black text-white">{value}</p>
                    {sub && <p className="mt-2 text-[10px] font-bold text-beet-gray flex items-center gap-1">
                        <TrendingUp size={10} className="text-beet-accent" /> {sub}
                    </p>}
                </div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
        </motion.div>
    );
}

export default function IndustryDashboard() {
    useAuthGuard('INDUSTRY');
    const { proposals, shortlists, artists, industryProfile, currentUser } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    const myProposals = proposals.filter((p) => p.industryId === industryProfile?.id || p.industryId === 'industry-demo');

    // Stats
    const stats = {
        active: myProposals.filter(p => ['SENT', 'NEGOTIATING'].includes(p.status)).length,
        closed: myProposals.filter(p => p.status === 'ACCEPTED').length,
        talentPool: Object.values(shortlists).reduce((acc, curr) => acc + curr.length, 0),
    };

    // Flatten all shortlists for the "Recent Savings" view
    const allShortlistIds = Array.from(new Set(Object.values(shortlists).flat()));
    const shortlistArtists = artists.filter((a) => allShortlistIds.includes(a.id));

    if (loading) return (
        <div className="px-6 py-8 space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-80 rounded-3xl" />
                <Skeleton className="h-80 rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-beet-black px-6 py-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <LayoutDashboard size={14} className="text-beet-blue" />
                        <span className="text-[10px] font-black text-beet-blue uppercase tracking-[0.2em]">Centro de Operações</span>
                    </div>
                    <h1 className="text-3xl font-display font-black text-white tracking-tighter">
                        OLÁ, <span className="text-beet-blue uppercase italic">{industryProfile?.tradingName || industryProfile?.companyName || 'EMPRESA'}</span>
                    </h1>
                    <p className="text-sm text-beet-gray mt-1">Gerencie suas negociações e scouting de talentos em tempo real.</p>
                </div>

                <Link
                    href="/industry/proposals/new"
                    className="group bg-beet-blue text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-beet-blue/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Nova Proposta
                </Link>
            </div>

            {/* KPI Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <KpiCard label="Negociações Ativas" value={stats.active} icon={Target} sub="3 novas esta semana" color="blue" />
                <KpiCard label="Contratos Fechados" value={stats.closed} icon={Briefcase} color="green" />
                <KpiCard label="Talent Pool (Salvos)" value={stats.talentPool} icon={Users} sub="Crescimento de 12%" color="yellow" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Active Negotiations */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="beet-card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <FileText size={14} className="text-beet-blue" /> Negociações Críticas
                            </h3>
                            <Link href="/industry/deals" className="text-[10px] font-black text-beet-blue uppercase tracking-tighter hover:underline">Ver Todas</Link>
                        </div>

                        <div className="divide-y divide-white/5">
                            {myProposals.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-beet-muted text-sm italic">Nenhuma proposta ativa no momento.</p>
                                </div>
                            ) : (
                                myProposals.slice(0, 5).map(p => (
                                    <Link key={p.id} href={`/deals/${p.id}`} className="flex items-center gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                                        <Avatar name={p.artistName} size="md" emoji="🎤" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white text-sm truncate">{p.artistName}</p>
                                                <StatusBadge status={p.status} />
                                            </div>
                                            <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mt-1">
                                                {p.type} • R$ {Number(p.amount).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className="text-beet-muted group-hover:text-beet-blue group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Talent Watchlist */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="beet-card bg-gradient-to-br from-beet-card to-beet-black">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Star size={14} className="text-yellow-500" /> Watchlist VIP
                            </h3>
                            <Link href="/industry/discover" className="text-[10px] font-black text-beet-muted uppercase tracking-tighter hover:text-white transition-colors">Explorar mais</Link>
                        </div>

                        <div className="p-4 space-y-3">
                            {shortlistArtists.length === 0 ? (
                                <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                                    <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest">Sua watchlist está vazia</p>
                                </div>
                            ) : (
                                shortlistArtists.slice(0, 4).map(a => (
                                    <div key={a.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-beet-blue/20 transition-all">
                                        <Avatar name={a.stageName} imageUrl={a.avatarUrl} size="sm" emoji="🎤" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm">{a.stageName}</p>
                                            <p className="text-[10px] text-beet-muted truncate">{a.genres[0]} • {a.city}</p>
                                        </div>
                                        <ScoreBeetBadge score={a.scoreBeet} size="sm" />
                                    </div>
                                ))
                            )}
                        </div>

                        {industryProfile?.verificationStatus !== 'VERIFIED' && (
                            <div className="m-4 p-5 bg-beet-blue/5 border border-beet-blue/20 rounded-2xl">
                                <p className="text-[11px] font-bold text-white flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-beet-blue" /> Perfil não Verificado
                                </p>
                                <p className="text-[10px] text-beet-gray mt-2 leading-relaxed">
                                    Complete sua documentação para desbloquear o envio de propostas ilimitadas e o selo de confiança.
                                </p>
                                <Link
                                    href={`/industry/profile/${industryProfile?.id || 'me'}`}
                                    className="inline-block mt-4 text-[9px] font-black uppercase text-beet-blue border-b border-beet-blue/30 hover:border-beet-blue"
                                >
                                    Ir para Verificação
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
