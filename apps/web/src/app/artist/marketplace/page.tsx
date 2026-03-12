'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing, type ListingStatus } from '@/lib/store';
import { Skeleton, EmptyState } from '@/components/ui';

const STATUS_TABS: { id: ListingStatus | 'all' | 'leads'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'ACTIVE', label: '🟢 Ativos' },
    { id: 'leads', label: '💬 Leads / Chats' },
    { id: 'PAUSED', label: '⏸ Pausados' },
];

function ListingMetricCard({ label, value, icon, trend }: { label: string; value: string; icon: string; trend?: string }) {
    return (
        <div className="beet-card p-4 flex flex-col items-center text-center justify-between group hover:border-beet-green/40">
            <div className="w-10 h-10 rounded-full bg-beet-dark flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform shadow-inner">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] text-beet-muted uppercase tracking-widest font-bold mt-1">{label}</p>
            </div>
            {trend && (
                <div className="mt-2 text-[9px] font-bold text-beet-green bg-beet-green/10 px-2 py-0.5 rounded uppercase">
                    {trend}
                </div>
            )}
        </div>
    );
}

export default function SellerPanel() {
    useAuthGuard('ARTIST');
    const { listings, artistProfile, updateListingStatus, addToast, chatThreads } = useStore();
    const [tab, setTab] = useState<ListingStatus | 'all' | 'leads'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(t);
    }, []);

    const myListings = listings.filter((l) => l.sellerId === artistProfile?.id || l.sellerId === 'artist-demo');
    const filtered = tab === 'all' ? myListings : tab === 'leads' ? [] : myListings.filter((l) => l.status === tab);

    // Filter chat threads related to seller's listings
    const myLeads = chatThreads.filter(chat =>
        chat.type === 'MARKETPLACE' && chat.metadata?.listingId &&
        myListings.some(l => l.id === chat.metadata?.listingId)
    );

    const totalViews = myListings.reduce((s, l) => s + l.views, 0);
    const totalChats = myListings.reduce((s, l) => s + l.chats, 0);
    const totalSaves = myListings.reduce((s, l) => s + l.saves, 0);
    const activeCount = myListings.filter((l) => (l.status as string).toUpperCase() === 'ACTIVE').length;

    const handleDuplicate = (listing: Listing) => {
        addToast({ message: 'Anúncio duplicado (rascunho criado).', type: 'success' });
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 pb-32 lg:px-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Seller <span className="text-beet-green">Hub</span>
                    </h1>
                    <p className="text-sm text-beet-muted mt-2 font-medium">Controle total sobre seu inventário e vendas</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-outline text-[11px] px-6 py-3">RELATÓRIOS</button>
                    <Link href="/artist/marketplace/new" className="btn-accent text-[11px] px-8 py-3">+ NOVO ANÚNCIO</Link>
                </div>
            </div>

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <ListingMetricCard label="Anúncios Ativos" value={String(activeCount)} icon="📋" trend="+2 este mês" />
                <ListingMetricCard label="Visualizações" value={totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews)} icon="👁" trend="+12% vs last week" />
                <ListingMetricCard label="Novos Leads" value={String(totalChats)} icon="💬" trend="5 pendentes" />
                <ListingMetricCard label="Taxa Conversão" value="4.2%" icon="🚀" trend="Acima da média" />
            </div>

            {/* Dashboard Tabs */}
            <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-px overflow-x-auto scrollbar-none">
                {STATUS_TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative
                            ${tab === t.id ? 'text-beet-green' : 'text-beet-muted hover:text-white'}`}>
                        {t.label}
                        {tab === t.id && (
                            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-beet-green shadow-[0_0_10px_var(--color-accent-glow)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            ) : tab === 'leads' ? (
                <div className="space-y-4">
                    {myLeads.length === 0 ? (
                        <EmptyState icon="💬" title="Nenhuma conversa ativa" description="Seus leads aparecerão aqui assim que alguém se interessar pelos seus anúncios." />
                    ) : (
                        myLeads.map((chat) => (
                            <div key={chat.id} className="beet-card p-5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-beet-dark flex items-center justify-center border border-white/10 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.metadata?.buyerId || chat.id}`} alt="Buyer" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">Interesse no Anúncio #{(chat.metadata?.listingId || '').split('-')[0]}</p>
                                        <p className="text-[11px] text-beet-muted mt-0.5">Última mensagem: {chat.messages?.[chat.messages.length - 1]?.content || 'Nenhuma mensagem'}</p>
                                    </div>
                                </div>
                                <Link href={`/artist/marketplace/chat/${chat.id}`} className="btn-accent px-6 py-2 text-[10px]">RESPONDER</Link>
                            </div>
                        ))
                    )}
                </div>
            ) : myListings.length === 0 ? (
                <EmptyState icon="🛍️" title="Sua vitrine está vazia"
                    description="Comece a vender seus serviços ou produtos hoje mesmo e impulsione sua carreira."
                    action={<Link href="/artist/marketplace/new" className="btn-accent text-sm px-8">+ CRIAR MEU PRIMEIRO ANÚNCIO</Link>} />
            ) : filtered.length === 0 ? (
                <EmptyState icon="🔍" title="Nenhum resultado encontrado" description="Tente mudar os filtros ou criar um novo anúncio." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((listing, i) => {
                        const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category);
                        const statusColors = {
                            ACTIVE: { bg: 'bg-beet-green/10', text: 'text-beet-green', label: 'ATÍVO' },
                            PAUSED: { bg: 'bg-beet-yellow/10', text: 'text-beet-yellow', label: 'PAUSADO' },
                            CLOSED: { bg: 'bg-beet-red/10', text: 'text-beet-red', label: 'FECHADO' }
                        } as any;
                        const status = statusColors[(listing.status as string).toUpperCase()] || statusColors.ACTIVE;

                        return (
                            <motion.div key={listing.id} className="beet-card overflow-hidden flex flex-col"
                                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <div className="aspect-video w-full bg-beet-dark relative overflow-hidden group">
                                    {listing.images && listing.images[0] ? (
                                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-beet-muted flex-col gap-2">
                                            <span className="text-3xl opacity-20">🖼️</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest">Sem Imagem</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded tracking-tighter ${status.bg} ${status.text} backdrop-blur-md`}>
                                            {status.label}
                                        </span>
                                        <span className="text-[9px] font-black px-3 py-1 rounded tracking-tighter bg-black/40 text-white backdrop-blur-md">
                                            {cat?.icon} {cat?.label.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-white leading-tight mb-2 uppercase tracking-tighter line-clamp-1">{listing.title}</h3>
                                        <div className="flex items-end justify-between mb-4">
                                            <p className="text-xl font-black text-beet-green tracking-tighter">
                                                R$ {listing.price.toLocaleString()}
                                                <span className="text-[11px] text-beet-muted font-medium ml-1">
                                                    {listing.priceType === 'FIXED' ? 'FIXO' : 'A COMBINAR'}
                                                </span>
                                            </p>
                                            <div className="flex gap-3 text-beet-muted">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px]">👁</span>
                                                    <span className="text-xs font-bold text-white/80">{listing.views}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px]">💬</span>
                                                    <span className="text-xs font-bold text-white/80">{listing.chats}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                                        <Link href={`/marketplace/listing/${listing.id}`}
                                            className="btn-outline px-4 py-2.5 text-[10px] w-full text-center">VISUALIZAR</Link>

                                        {listing.status === 'ACTIVE' ? (
                                            <button onClick={() => updateListingStatus(listing.id, 'PAUSED')}
                                                className="btn-outline px-4 py-2.5 text-[10px] border-beet-yellow/30 text-beet-yellow hover:bg-beet-yellow/10">PAUSAR</button>
                                        ) : (
                                            <button onClick={() => updateListingStatus(listing.id, 'ACTIVE')}
                                                className="btn-outline px-4 py-2.5 text-[10px] border-beet-green/30 text-beet-green hover:bg-beet-green/10">ATIVAR</button>
                                        )}

                                        <button onClick={() => handleDuplicate(listing)}
                                            className="btn-outline px-4 py-2.5 text-[10px]">DUPLICAR</button>

                                        {listing.status !== 'CLOSED' && (
                                            <button onClick={() => updateListingStatus(listing.id, 'CLOSED')}
                                                className="btn-outline px-4 py-2.5 text-[10px] border-beet-red/30 text-beet-red hover:bg-beet-red/10">ENCERRAR</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
