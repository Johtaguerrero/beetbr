'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing } from '@/lib/store';
import { Avatar, ScoreBeetBadge, Skeleton } from '@/components/ui';

// ── Listing Card ──────────────────────────────────────────────

function ListingCard({ listing, saved, onSave }: { listing: Listing; saved: boolean; onSave: () => void }) {
    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category);
    return (
        <motion.div
            className="beet-card overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            style={{ borderTop: `2px solid ${cat?.color || 'var(--color-accent)'}` }}
        >
            {/* Category header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="meta-text flex items-center gap-1" style={{ color: cat?.color }}>
                    {cat?.icon} {cat?.label}
                </span>
                <button onClick={(e) => { e.preventDefault(); onSave(); }}
                    className="text-base transition-transform active:scale-90"
                    title={saved ? 'Remover dos salvos' : 'Salvar anúncio'}>
                    {saved ? '⭐' : '☆'}
                </button>
            </div>

            <Link href={`/marketplace/listing/${listing.id}`} className="flex flex-col flex-1 px-4 pb-4 gap-3" style={{ textDecoration: 'none' }}>
                <div>
                    <p className="brutalist-text-lg line-clamp-2">{listing.title}</p>
                    <p className="brutalist-text-sm line-clamp-2" style={{ marginTop: 4 }}>{listing.description}</p>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2">
                    <Avatar name={listing.sellerName} imageUrl={listing.sellerAvatarUrl} size="xs" />
                    <div>
                        <div className="flex items-center gap-1">
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700 }} className="text-[var(--color-primary-text,white)]">{listing.sellerName}</span>
                            {listing.sellerVerified && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--color-blue)', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            <ScoreBeetBadge score={listing.sellerScore || 0} />
                            <span className="brutalist-meta-text">{listing.sellerCity || 'Brasil'}</span>
                        </div>
                    </div>
                </div>

                {/* Rating + delivery */}
                <div className="flex items-center gap-2" style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--color-muted)', letterSpacing: '0.06em' }}>
                    {listing.reviewCount !== undefined && listing.reviewCount > 0 && listing.rating !== undefined && (
                        <span>⭐ {listing.rating.toFixed(1)} ({listing.reviewCount})</span>
                    )}
                    {listing.deliveryDays !== undefined && (
                        <span>⏱ {listing.deliveryDays}d</span>
                    )}
                    <span>{listing.type === 'product' ? '📦 PRODUTO' : '🛠 SERVIÇO'}</span>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div>
                        {listing.priceType === 'fixed' ? (
                            <p className="price-text">R$ {listing.price.toLocaleString('pt-BR')}</p>
                        ) : (
                            <div>
                                <p className="price-text">A partir de R$ {listing.price.toLocaleString('pt-BR')}</p>
                                <p className="meta-text" style={{ fontSize: '8px', marginTop: 2 }}>valor a combinar</p>
                            </div>
                        )}
                    </div>
                    <span className="meta-text" style={{ fontSize: '8px' }}>{listing.chats} CHATS</span>
                </div>
            </Link>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────

const FEATURED_SECTIONS = [
    { title: '🔥 Serviços mais procurados', filter: (l: Listing) => l.chats > 15 },
    { title: '🥁 Beats em alta', filter: (l: Listing) => l.category === 'beats' },
    { title: '🎬 Edição de Vídeo', filter: (l: Listing) => l.category === 'edicao-video' || l.category === 'videoclipe' },
];

export default function MarketplaceHome() {
    useAuthGuard();
    const { listings, toggleSaveListing, savedListings } = useStore();
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState<string>('');
    const router = useRouter();

    const active = listings.filter((l) => (l.status as string).toUpperCase() === 'ACTIVE');

    const filtered = active.filter((l) => {
        if (selectedCat && l.category !== selectedCat) return false;
        if (search && !l.title.toLowerCase().includes(search.toLowerCase()) &&
            !l.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCat) router.push(`/marketplace/c/${selectedCat}?q=${encodeURIComponent(search)}`);
    };

    return (
        <>
            <div className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:px-6 lg:pb-6 space-y-8">
                {/* Hero */}
                <div style={{
                    background: 'var(--color-nav-bg)',
                    border: '1px solid var(--color-border)',
                    borderTop: '2px solid var(--color-accent)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    padding: '28px 24px 24px',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(0,255,102,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <p className="section-label" style={{ marginBottom: 10 }}>SERVIÇOS MUSICAIS</p>
                    <h1 className="page-header text-[var(--color-primary-text,white)]" style={{ marginBottom: 8 }}>MARKET<span style={{ color: 'var(--color-accent)' }}>PLACE</span></h1>
                    <p className="page-subtitle text-[var(--color-primary-text,white)] opacity-80" style={{ marginBottom: 20 }}>Compre e venda serviços e produtos musicais com artistas verificados</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            className="beet-input flex-1 min-w-0"
                            placeholder="Buscar beats, mixagem, letras, feat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn-accent px-6 flex-shrink-0" style={{ fontSize: '14px', letterSpacing: '0.1em' }}>BUSCAR</button>
                    </form>
                </div>

                {/* Categories */}
                <div>
                    <p className="section-label mb-3">EXPLORAR CATEGORIAS</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCat('')}
                            className={`beet-pill cursor-pointer ${!selectedCat ? 'active' : ''}`}>
                            🎵 TODOS
                        </button>
                        {MARKETPLACE_CATEGORIES.map((cat) => (
                            <Link key={cat.slug} href={`/marketplace/c/${cat.slug}`}>
                                <button className={`beet-pill cursor-pointer ${selectedCat === cat.slug ? 'active' : ''}`}
                                    onClick={() => setSelectedCat(cat.slug)}>
                                    {cat.icon} {cat.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filtered results when searching */}
                {(search || selectedCat) ? (
                    <div>
                        <p className="section-title mb-3">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-4xl">🔍</p>
                                <p className="text-[var(--color-primary-text,white)] font-semibold">Nenhum anúncio encontrado</p>
                                <button onClick={() => { setSearch(''); setSelectedCat(''); }} className="btn-outline text-sm">Limpar filtros</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((l) => (
                                    <ListingCard key={l.id} listing={l}
                                        saved={savedListings.includes(l.id)}
                                        onSave={() => toggleSaveListing(l.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Featured sections
                    FEATURED_SECTIONS.map((section) => {
                        const items = active.filter(section.filter);
                        if (!items.length) return null;
                        return (
                            <div key={section.title}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="page-header-sm" style={{ fontSize: '1.25rem' }}>{section.title}</p>
                                    <span className="meta-text">{items.length} ANÚNICIOS</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((l) => (
                                        <ListingCard key={l.id} listing={l}
                                            saved={savedListings.includes(l.id)}
                                            onSave={() => toggleSaveListing(l.id)} />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}

