'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Star, Filter, ArrowRight, Music, Mic2, Disc, Play } from 'lucide-react';
import { useAuthGuard, Avatar, ScoreBeetBadge } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing } from '@/lib/store';
import { Spinner } from '@/components/ui';

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
            style={{ borderTop: `2px solid ${cat?.color || 'var(--color-accent)'}`, background: 'var(--color-card)' }}
        >
            {/* Category header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="meta-text flex items-center gap-1" style={{ color: cat?.color, fontSize: '10px' }}>
                    {cat?.icon} {cat?.label?.toUpperCase()}
                </span>
                <button onClick={(e) => { e.preventDefault(); onSave(); }}
                    className="text-base transition-transform active:scale-90"
                    title={saved ? 'Remover dos salvos' : 'Salvar anúncio'}>
                    {saved ? '⭐' : '☆'}
                </button>
            </div>

            <Link href={`/industry/marketplace/listing/${listing.id}`} className="flex flex-col flex-1 px-4 pb-4 gap-3" style={{ textDecoration: 'none' }}>
                <div className="aspect-video w-full overflow-hidden rounded-sm bg-black/20 flex items-center justify-center border border-[var(--color-border)]">
                   {listing.images?.[0] ? (
                       <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                   ) : (
                       <div className="text-4xl opacity-20">{cat?.icon || '📦'}</div>
                   )}
                </div>

                <div>
                    <p className="brutalist-text-lg line-clamp-1" style={{ fontSize: '16px' }}>{listing.title}</p>
                    <p className="brutalist-text-sm line-clamp-2" style={{ marginTop: 2, fontSize: '12px', opacity: 0.7 }}>{listing.description}</p>
                </div>

                {/* Seller */}
                <div
                    className="flex items-center gap-2 group/seller no-underline mt-1"
                >
                    <Avatar name={listing.sellerName} imageUrl={listing.sellerAvatarUrl} size="sm" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1">
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700 }} className="text-[var(--color-primary-text,white)] group-hover/seller:text-[var(--color-accent)] transition-colors truncate">{listing.sellerName}</span>
                            {listing.sellerVerified && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--color-blue)', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <ScoreBeetBadge score={listing.sellerScore || 0} size="sm" />
                            <span className="brutalist-meta-text" style={{ fontSize: '9px' }}>{listing.sellerCity || 'Brasil'}</span>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--color-nav-border)' }}>
                    <div>
                        {listing.priceType === 'FIXED' ? (
                            <p className="price-text" style={{ fontSize: '18px', color: 'var(--color-accent)' }}>R$ {Number(listing.price).toLocaleString('pt-BR')}</p>
                        ) : listing.priceType === 'NEGOTIABLE' ? (
                            <div>
                                <p className="price-text" style={{ fontSize: '16px', color: 'var(--color-accent)' }}>R$ {Number(listing.price).toLocaleString('pt-BR')}+</p>
                                <p className="meta-text" style={{ fontSize: '8px', marginTop: 1 }}>negociável</p>
                            </div>
                        ) : (
                            <p className="price-text" style={{ fontSize: '16px', color: 'var(--color-accent)' }}>SOB CONSULTA</p>
                        )}
                    </div>
                    <Link href={`/industry/marketplace/listing/${listing.id}`} className="btn-accent px-3 py-1 text-[9px] font-bold">VER ANÚNCIO</Link>
                </div>
            </Link>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────

const FEATURED_SECTIONS = [
    { title: '🔥 Serviços em Destaque', filter: (l: Listing) => l.views > 20 || l.chats > 5 },
    { title: '✨ Novos Anúncios', filter: (l: Listing) => true }, // Sorted by date anyway
    { title: '🥁 Beats & Instrumentais', filter: (l: Listing) => l.category === 'beats' },
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
        if (selectedCat || search) router.push(`/industry/marketplace?q=${encodeURIComponent(search)}&c=${selectedCat}`);
    };

    return (
        <>
            <div className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:px-6 lg:pb-6 space-y-8">
                {/* Hero */}
                <div style={{
                    background: 'var(--color-nav-bg)',
                    border: '1px solid var(--color-nav-border)',
                    borderTop: '2px solid var(--color-accent)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    padding: '32px 24px 28px',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(0,255,102,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                        <div>
                            <p className="section-label" style={{ marginBottom: 10 }}>SERVIÇOS MUSICAIS</p>
                            <h1 className="page-header text-[var(--color-primary-text,white)]" style={{ marginBottom: 8, fontSize: '42px' }}>MARKET<span style={{ color: 'var(--color-accent)' }}>PLACE</span></h1>
                            <p className="page-subtitle text-[var(--color-primary-text,white)] opacity-80">Compre e venda serviços e produtos musicais com artistas verificados</p>
                        </div>

                        <div className="hidden md:block">
                            {/* Industry specific CTA could go here */}
                        </div>
                    </div>

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
                <div className="bg-white/5 p-4 rounded-sm border border-white/5">
                    <p className="section-label mb-4 opacity-60">EXPLORAR CATEGORIAS</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCat('')}
                            className={`beet-pill cursor-pointer ${!selectedCat ? 'active' : ''}`}>
                            🌐 TODOS
                        </button>
                        {MARKETPLACE_CATEGORIES.map((cat) => (
                            <button key={cat.slug} 
                                className={`beet-pill cursor-pointer ${selectedCat === cat.slug ? 'active' : ''}`}
                                onClick={() => setSelectedCat(cat.slug)}>
                                {cat.icon} {cat.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtered results when searching */}
                {(search || selectedCat) ? (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="brutalist-text-xl">{filtered.length} RESULTADO{filtered.length !== 1 ? 'S' : ''}</h2>
                            <button onClick={() => { setSearch(''); setSelectedCat(''); }} className="text-xs uppercase font-bold text-accent hover:underline">Limpar filtros</button>
                        </div>
                        
                        {filtered.length === 0 ? (
                            <div className="empty-state py-20 border border-dashed border-white/10 rounded-sm">
                                <p className="text-4xl mb-4">🔍</p>
                                <p className="text-[var(--color-primary-text,white)] font-bold uppercase tracking-wider">Nenhum anúncio encontrado</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="space-y-12">
                        {FEATURED_SECTIONS.map((section) => {
                            const items = active.filter(section.filter).slice(0, 6);
                            if (!items.length) return null;
                            return (
                                <div key={section.title}>
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="brutalist-text-xl flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-accent" />
                                            {section.title.toUpperCase()}
                                        </h2>
                                        <Link href={`/industry/marketplace`} className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors">Ver todos →</Link>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map((l) => (
                                            <ListingCard key={l.id} listing={l}
                                                saved={savedListings.includes(l.id)}
                                                onSave={() => toggleSaveListing(l.id)} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

