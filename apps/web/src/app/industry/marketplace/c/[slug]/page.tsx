'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing, type MarketplaceCategory } from '@/lib/store';
import { ScoreBeetBadge, Skeleton } from '@/components/ui';

const SORT_OPTIONS = [
    { id: 'relevance', label: 'Relevância' },
    { id: 'price_asc', label: 'Menor preço' },
    { id: 'price_desc', label: 'Maior preço' },
    { id: 'score', label: 'Melhor score' },
    { id: 'recent', label: 'Mais recentes' },
];

function ListingRow({ listing, saved, onSave }: { listing: Listing; saved: boolean; onSave: () => void }) {
    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category);
    return (
        <motion.div className="beet-card p-4 flex gap-4" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            {/* Type icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ background: `${cat?.color}18` }}>
                {cat?.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/industry/marketplace/listing/${listing.id}`}>
                        <p className="font-semibold text-[var(--color-primary-text,white)] text-sm hover:text-neon transition-colors line-clamp-1">{listing.title}</p>
                    </Link>
                    <button onClick={onSave} className="flex-shrink-0 text-base">{saved ? '⭐' : '☆'}</button>
                </div>
                <p className="text-xs text-beet-muted mt-0.5 line-clamp-1">{listing.description}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <div className="flex items-center gap-1">
                        <span className="text-beet-muted">{listing.sellerName}</span>
                        {listing.sellerVerified && <span className="text-beet-blue">✓</span>}
                    </div>
                    <ScoreBeetBadge score={listing.sellerScore || 0} />
                    {listing.reviewCount && listing.reviewCount > 0 && listing.rating !== undefined && (
                        <span className="text-beet-muted">⭐ {listing.rating.toFixed(1)} ({listing.reviewCount})</span>
                    )}
                    {listing.deliveryDays && <span className="text-beet-muted">⏱ {listing.deliveryDays}d</span>}
                </div>
            </div>

            <div className="flex-shrink-0 text-right">
                {listing.priceType === 'FIXED' ? (
                    <p className="font-black text-[var(--color-primary-text,white)]">R${listing.price.toLocaleString('pt-BR')}</p>
                ) : (
                    <>
                        <p className="font-black text-[var(--color-primary-text,white)]">R${listing.price.toLocaleString('pt-BR')}+</p>
                        <p className="text-[10px] text-beet-muted">a combinar</p>
                    </>
                )}
                <Link href={`/industry/marketplace/listing/${listing.id}`}
                    className="mt-1 inline-block rounded-lg border px-3 py-1 text-[10px] text-beet-muted hover:text-[var(--color-primary-text,white)] hover:border-neon transition-colors"
                    style={{ borderColor: 'var(--color-border)' }}>
                    Ver →
                </Link>
            </div>
        </motion.div>
    );
}

export default function CategoryPage() {
    useAuthGuard();
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as MarketplaceCategory;
    const q = searchParams.get('q') || '';

    const { listings, savedListings, toggleSaveListing } = useStore();

    const [sort, setSort] = useState('relevance');
    const [maxPrice, setMaxPrice] = useState(10000);
    const [minPrice, setMinPrice] = useState(0);
    const [typeFilter, setTypeFilter] = useState<'' | 'product' | 'service'>('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [search, setSearch] = useState(q);
    const [loading, setLoading] = useState(true);

    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
    const isAll = !slug || (slug as string) === 'all';

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(t);
    }, []);

    const applySort = (items: Listing[]) => {
        switch (sort) {
            case 'price_asc': return [...items].sort((a, b) => a.price - b.price);
            case 'price_desc': return [...items].sort((a, b) => b.price - a.price);
            case 'score': return [...items].sort((a, b) => (b.sellerScore || 0) - (a.sellerScore || 0));
            case 'recent': return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            default: return [...items].sort((a, b) => ((b.chats || 0) + (b.saves || 0) * 2) - ((a.chats || 0) + (a.saves || 0) * 2));
        }
    };

    const filtered = applySort(
        listings.filter((l) => {
            if ((l.status as string).toUpperCase() !== 'ACTIVE') return false;
            if (!isAll && l.category !== slug) return false;
            if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
            if (typeFilter && l.type !== typeFilter) return false;
            if (verifiedOnly && !l.sellerVerified) return false;
            if (l.price < minPrice || l.price > maxPrice) return false;
            return true;
        })
    );

    return (
        <>
            <div className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:px-6 lg:pb-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-beet-muted text-xs mb-2">
                        <Link href="/industry/marketplace" className="hover:text-[var(--color-primary-text,white)]">Marketplace</Link>
                        <span>›</span>
                        <span className="text-[var(--color-primary-text,white)]">{cat?.label || 'Todos'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-primary-text,white)] flex items-center gap-2">
                        <span>{cat?.icon || '🛍️'}</span>
                        <span>{cat?.label || 'Todos os anúncios'}</span>
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar filters */}
                    <aside className="w-full lg:w-56 flex-shrink-0 space-y-4">
                        <div className="beet-card p-4 space-y-4">
                            <p className="section-title">Filtros</p>

                            <div>
                                <p className="text-xs text-[var(--color-primary-text,white)] font-semibold mb-2">Busca</p>
                                <input className="beet-input text-xs py-2" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div>
                                <p className="text-xs text-[var(--color-primary-text,white)] font-semibold mb-2">Tipo</p>
                                <div className="flex gap-1 flex-wrap">
                                    {[['', 'Todos'], ['product', '📦 Produto'], ['service', '🛠 Serviço']].map(([v, l]) => (
                                        <button key={v} onClick={() => setTypeFilter(v as any)}
                                            className={`beet-pill cursor-pointer text-[10px] ${typeFilter === v ? 'active' : ''}`}>{l}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-[var(--color-primary-text,white)] font-semibold mb-2">Preço máximo: R${maxPrice.toLocaleString()}</p>
                                <input type="range" min={0} max={10000} step={50} value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-beet-blue" />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="rounded accent-beet-blue" />
                                <span className="text-xs text-beet-muted">Só verificados ✓</span>
                            </label>

                            <button onClick={() => { setSearch(''); setTypeFilter(''); setMaxPrice(10000); setVerifiedOnly(false); }}
                                className="btn-outline w-full py-1.5 text-xs">Limpar filtros</button>
                        </div>

                        {/* Category chips */}
                        <div className="beet-card p-4">
                            <p className="section-title mb-3">Categorias</p>
                            <div className="space-y-1">
                                <Link href="/industry/marketplace">
                                    <button className={`sidebar-link w-full ${isAll ? 'active' : ''}`}>🛍️ <span>Todos</span></button>
                                </Link>
                                {MARKETPLACE_CATEGORIES.map((c) => (
                                    <Link key={c.slug} href={`/industry/marketplace/c/${c.slug}`}>
                                        <button className={`sidebar-link w-full ${slug === c.slug ? 'active' : ''}`}>
                                            {c.icon} <span className="text-xs">{c.label}</span>
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Listings */}
                    <div className="flex-1 min-w-0">
                        {/* Sort + count */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <p className="text-sm text-beet-muted">{filtered.length} anúncio{filtered.length !== 1 ? 's' : ''}</p>
                            <select className="beet-input py-1.5 text-xs w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
                                {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </div>

                        {loading ? (
                            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-5xl">😔</p>
                                <p className="text-[var(--color-primary-text,white)] font-semibold">Nenhum anúncio encontrado</p>
                                <Link href="/industry/marketplace" className="btn-outline text-sm">Ver todos →</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map((l, i) => (
                                    <ListingRow key={l.id} listing={l}
                                        saved={savedListings.includes(l.id)}
                                        onSave={() => toggleSaveListing(l.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
