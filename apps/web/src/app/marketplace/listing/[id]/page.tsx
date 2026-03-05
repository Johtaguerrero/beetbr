'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES } from '@/lib/store';
import { ScoreBeetBadge, Avatar } from '@/components/ui';

// ── Anti-fraud Banner ─────────────────────────────────────────

function AntiFraudBanner() {
    return (
        <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'rgba(255,212,0,0.3)', background: 'rgba(255,212,0,0.06)' }}>
            <span className="text-xl flex-shrink-0">🛡️</span>
            <div>
                <p className="text-xs font-bold text-beet-yellow mb-1">Segurança BEETBR</p>
                <p className="text-[11px] text-beet-muted leading-relaxed">
                    Negocie sempre pelo chat do BEETBR. Nunca faça pagamentos fora da plataforma sem verificação.
                    Desconfie de preços muito abaixo do mercado.
                </p>
            </div>
        </div>
    );
}

// ── Waveform Demo ─────────────────────────────────────────────

function DemoPlayer({ title }: { title: string }) {
    const [playing, setPlaying] = useState(false);
    const BARS = 28;
    return (
        <div className="beet-card p-4 flex items-center gap-3">
            <button onClick={() => setPlaying(!playing)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base transition-transform active:scale-90"
                style={{ background: playing ? 'var(--color-accent)' : 'var(--color-accent-dim)', color: playing ? 'var(--color-bg)' : 'var(--color-accent)' }}>
                {playing ? '⏸' : '▶'}
            </button>
            <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--color-primary-text,white)] mb-1">Demo — {title}</p>
                <div className="flex items-end gap-[2px] h-6">
                    {Array.from({ length: BARS }).map((_, i) => (
                        <div key={i} className="waveform-bar rounded-sm flex-1"
                            style={{ height: `${30 + Math.sin(i * 0.8) * 25 + Math.random() * 20}%`, animationDelay: `${i * 0.04}s`, animationPlayState: playing ? 'running' : 'paused' }} />
                    ))}
                </div>
            </div>
            <span className="text-[10px] text-beet-muted flex-shrink-0">0:30</span>
        </div>
    );
}

export default function ListingDetail() {
    useAuthGuard();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { listings, savedListings, toggleSaveListing, startMarketplaceChat, isAuthenticated } = useStore();
    const [reported, setReported] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    const listing = listings.find((l) => l.id === id);
    const cat = listing ? MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category) : null;
    const isSaved = savedListings.includes(id);

    const handleStartChat = async () => {
        if (!listing) return;
        setChatLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        const chatId = startMarketplaceChat(listing.id, listing.title, listing.sellerId, listing.sellerName);
        setChatLoading(false);
        router.push(`/marketplace/chat/${chatId}`);
    };

    const handleReport = () => {
        setReported(true);
        setTimeout(() => setReported(false), 3000);
    };

    if (!listing) {
        return (
            <AppShell>
                <div className="empty-state">
                    <p className="text-5xl">😕</p>
                    <p className="text-[var(--color-primary-text,white)] font-semibold">Anúncio não encontrado</p>
                    <Link href="/marketplace" className="btn-outline text-sm">Voltar ao Marketplace</Link>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-4xl px-4 py-6 pb-28 lg:px-6 lg:pb-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-beet-muted mb-5">
                    <Link href="/marketplace" className="hover:text-[var(--color-primary-text,white)]">Marketplace</Link>
                    <span>›</span>
                    <Link href={`/marketplace/c/${listing.category}`} className="hover:text-[var(--color-primary-text,white)]">{cat?.label}</Link>
                    <span>›</span>
                    <span className="text-[var(--color-primary-text,white)] line-clamp-1">{listing.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-5">
                        {/* Title + category */}
                        <div>
                            <span className="flex items-center gap-1 rounded-full w-fit px-2.5 py-0.5 mb-3 text-[11px] font-bold"
                                style={{ background: `${cat?.color}18`, color: cat?.color }}>
                                {cat?.icon} {cat?.label}
                            </span>
                            <h1 className="text-xl lg:text-2xl font-bold text-[var(--color-primary-text,white)] leading-snug">{listing.title}</h1>

                            {/* Metrics */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-beet-muted">
                                {listing.reviewCount && listing.reviewCount > 0 && listing.rating !== undefined && (
                                    <span>⭐ {listing.rating.toFixed(1)} ({listing.reviewCount} avaliações)</span>
                                )}
                                <span>👁 {(listing.views || 0).toLocaleString()} views</span>
                                <span>💬 {listing.chats || 0} chats</span>
                                <span>{listing.type === 'product' ? '📦 Produto digital' : '🛠 Serviço'}</span>
                            </div>
                        </div>

                        {/* Demo player (if has sample) */}
                        {listing.hasSample && (
                            <div>
                                <p className="section-title mb-2">Amostra demo</p>
                                <DemoPlayer title={listing.title} />
                            </div>
                        )}

                        {/* Description */}
                        <div className="beet-card p-5">
                            <p className="section-title mb-3">Descrição completa</p>
                            <p className="text-sm text-beet-muted leading-relaxed">{listing.description}</p>

                            {listing.tags && listing.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {listing.tags.map((tag) => (
                                        <span key={tag} className="beet-pill text-[10px]">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scope */}
                        <div className="beet-card p-5">
                            <p className="section-title mb-3">O que está incluído</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-beet-muted">
                                    <span>⏱</span>
                                    <span>{listing.deliveryDays ? `Prazo: ${listing.deliveryDays} dias úteis` : 'Prazo a combinar'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-beet-muted">
                                    <span>🔄</span>
                                    <span>{listing.revisions !== undefined ? `${listing.revisions} revisões` : 'Revisões a combinar'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-beet-muted">
                                    <span>{listing.deliveryMethod === 'presencial' ? '📍' : listing.deliveryMethod === 'online' ? '🎥' : '📁'}</span>
                                    <span className="capitalize">{listing.deliveryMethod}</span>
                                </div>
                                {listing.requiresBriefing && (
                                    <div className="flex items-center gap-2 text-beet-muted">
                                        <span>📝</span>
                                        <span>Briefing obrigatório</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Anti-fraud */}
                        <AntiFraudBanner />

                        {/* Report */}
                        <div className="flex justify-end">
                            <button onClick={handleReport}
                                className="text-xs text-beet-muted hover:text-beet-red transition-colors flex items-center gap-1">
                                {reported ? '✅ Denúncia enviada' : '🚩 Reportar anúncio'}
                            </button>
                        </div>
                    </div>

                    {/* Sticky sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                        {/* Price card */}
                        <div className="beet-card p-5 lg:sticky lg:top-6 space-y-4">
                            <div>
                                {listing.priceType === 'fixed' ? (
                                    <p className="font-black text-[var(--color-primary-text,white)] text-2xl">R$ {listing.price.toLocaleString('pt-BR')}</p>
                                ) : (
                                    <div>
                                        <p className="font-black text-[var(--color-primary-text,white)] text-2xl">R$ {listing.price.toLocaleString('pt-BR')}+</p>
                                        <p className="text-xs text-beet-muted">valor a combinar</p>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleStartChat} disabled={chatLoading}
                                className="btn-accent w-full py-3 text-sm">
                                {chatLoading ? '⏳ Iniciando...' : '💬 Falar no Chat'}
                            </button>

                            <button onClick={() => toggleSaveListing(listing.id)}
                                className="btn-outline w-full py-2.5 text-sm">
                                {isSaved ? '⭐ Salvo' : '☆ Salvar anúncio'}
                            </button>

                            <p className="text-[10px] text-beet-muted text-center leading-relaxed">
                                Após iniciar o chat, o contato do vendedor será liberado dentro da conversa.
                            </p>
                        </div>

                        {/* Seller card */}
                        <div className="beet-card p-5">
                            <p className="section-title mb-3">Sobre o vendedor</p>
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar name={listing.sellerName} size="md" emoji="🎤" />
                                <div>
                                    <div className="flex items-center gap-1">
                                        <p className="font-semibold text-[var(--color-primary-text,white)] text-sm">{listing.sellerName}</p>
                                        {listing.sellerVerified && (
                                            <span className="text-[10px] font-bold text-beet-blue bg-beet-blue/10 px-1.5 py-0.5 rounded-full">✓ Verificado</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-beet-muted">{listing.sellerCity}, {listing.sellerState}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <ScoreBeetBadge score={listing.sellerScore || 0} size="md" />
                                {listing.reviewCount && listing.reviewCount > 0 && listing.rating !== undefined && (
                                    <span className="text-xs text-beet-muted">⭐ {listing.rating.toFixed(1)} · {listing.reviewCount} avaliações</span>
                                )}
                            </div>
                            <Link href={`/artist/profile/${listing.sellerId}`}
                                className="btn-outline w-full py-2 text-xs text-center">
                                Ver perfil completo →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
