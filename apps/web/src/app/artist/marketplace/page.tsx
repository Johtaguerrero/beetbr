'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing, type ListingStatus } from '@/lib/store';
import { Skeleton, EmptyState } from '@/components/ui';

const STATUS_TABS: { id: ListingStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'ACTIVE', label: '🟢 Ativos' },
    { id: 'PAUSED', label: '⏸ Pausados' },
    { id: 'CLOSED', label: '🔴 Encerrados' },
];

function ListingMetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="rounded-xl bg-beet-dark p-3 text-center">
            <p className="text-lg">{icon}</p>
            <p className="font-black text-white text-base">{value}</p>
            <p className="text-[10px] text-beet-muted">{label}</p>
        </div>
    );
}

export default function SellerPanel() {
    useAuthGuard('ARTIST');
    const { listings, artistProfile, updateListingStatus, addToast } = useStore();
    const [tab, setTab] = useState<ListingStatus | 'all'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(t);
    }, []);

    const myListings = listings.filter((l) => l.sellerId === artistProfile?.id || l.sellerId === 'artist-demo');
    const filtered = tab === 'all' ? myListings : myListings.filter((l) => l.status === tab);

    const totalViews = myListings.reduce((s, l) => s + l.views, 0);
    const totalChats = myListings.reduce((s, l) => s + l.chats, 0);
    const totalSaves = myListings.reduce((s, l) => s + l.saves, 0);
    const activeCount = myListings.filter((l) => (l.status as string).toUpperCase() === 'ACTIVE').length;

    const handleDuplicate = (listing: Listing) => {
        addToast({ message: 'Anúncio duplicado (rascunho criado).', type: 'success' });
    };

    return (
        <AppShell>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">🛍️ Meu Marketplace</h1>
                        <p className="text-sm text-beet-muted mt-1">Gerencie seus anúncios e leads</p>
                    </div>
                    <Link href="/artist/marketplace/new" className="btn-accent text-sm px-4 py-2.5">+ Novo</Link>
                </div>

                {/* Overview metrics */}
                <div className="grid grid-cols-4 gap-3">
                    <ListingMetricCard label="Anúncios" value={String(activeCount)} icon="📋" />
                    <ListingMetricCard label="Views" value={totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews)} icon="👁" />
                    <ListingMetricCard label="Chats" value={String(totalChats)} icon="💬" />
                    <ListingMetricCard label="Salvos" value={String(totalSaves)} icon="⭐" />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: 'var(--color-border)' }}>
                    {STATUS_TABS.map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                            style={{
                                background: tab === t.id ? 'var(--color-accent-dim)' : 'transparent',
                                color: tab === t.id ? 'var(--color-accent)' : 'var(--color-muted)',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Listing list */}
                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
                ) : myListings.length === 0 ? (
                    <EmptyState icon="🛍️" title="Nenhum anúncio ainda"
                        description="Publique seu primeiro serviço ou produto musical"
                        action={<Link href="/artist/marketplace/new" className="btn-accent text-sm">+ Criar anúncio</Link>} />
                ) : filtered.length === 0 ? (
                    <EmptyState icon="🔍" title={`Sem anúncios com status "${tab}"`} />
                ) : (
                    <div className="space-y-4">
                        {filtered.map((listing, i) => {
                            const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category);
                            return (
                                <motion.div key={listing.id} className="beet-card p-5 space-y-4"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">{cat?.icon}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: (listing.status as string).toUpperCase() === 'ACTIVE' ? 'rgba(0,255,102,0.12)' : (listing.status as string).toUpperCase() === 'PAUSED' ? 'rgba(255,212,0,0.12)' : 'rgba(255,45,45,0.1)', color: (listing.status as string).toUpperCase() === 'ACTIVE' ? '#00FF66' : (listing.status as string).toUpperCase() === 'PAUSED' ? '#FFD400' : '#FF6060' }}>
                                                    {(listing.status as string).toUpperCase() === 'ACTIVE' ? '🟢 Ativo' : (listing.status as string).toUpperCase() === 'PAUSED' ? '⏸ Pausado' : '🔴 Encerrado'}
                                                </span>
                                            </div>
                                            <p className="font-semibold text-white text-sm line-clamp-1">{listing.title}</p>
                                            <p className="text-xs text-beet-muted mt-0.5">
                                                {listing.priceType === 'fixed' ? `R$ ${listing.price.toLocaleString()}` : `A partir de R$ ${listing.price.toLocaleString()}`}
                                                {listing.deliveryDays && ` · ${listing.deliveryDays}d`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                            <p className="text-[10px] text-beet-muted">Views</p>
                                            <p className="text-sm font-black text-white">{listing.views}</p>
                                        </div>
                                        <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                            <p className="text-[10px] text-beet-muted">Chats</p>
                                            <p className="text-sm font-black text-white">{listing.chats}</p>
                                        </div>
                                        <div className="rounded-xl bg-beet-dark p-2.5 text-center">
                                            <p className="text-[10px] text-beet-muted">Salvos</p>
                                            <p className="text-sm font-black text-white">{listing.saves}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={`/marketplace/listing/${listing.id}`}
                                            className="btn-outline px-3 py-1.5 text-xs">👁 Ver</Link>
                                        <button onClick={() => handleDuplicate(listing)}
                                            className="btn-outline px-3 py-1.5 text-xs">📋 Duplicar</button>
                                        {listing.status === 'ACTIVE' ? (
                                            <button onClick={() => updateListingStatus(listing.id, 'PAUSED')}
                                                className="btn-outline px-3 py-1.5 text-xs text-beet-yellow border-beet-yellow/30 hover:bg-beet-yellow/10">⏸ Pausar</button>
                                        ) : listing.status === 'PAUSED' ? (
                                            <button onClick={() => updateListingStatus(listing.id, 'ACTIVE')}
                                                className="btn-outline px-3 py-1.5 text-xs text-beet-green border-beet-green/30">▶ Reativar</button>
                                        ) : null}
                                        {listing.status !== 'CLOSED' && (
                                            <button onClick={() => updateListingStatus(listing.id, 'CLOSED')}
                                                className="btn-outline px-3 py-1.5 text-xs text-beet-red border-beet-red/30 hover:bg-beet-red/10">🔴 Encerrar</button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
