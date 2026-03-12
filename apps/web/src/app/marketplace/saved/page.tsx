'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES } from '@/lib/store';
import { ScoreBeetBadge, EmptyState } from '@/components/ui';

export default function SavedListings() {
    useAuthGuard();
    const { listings, savedListings, toggleSaveListing, chatThreads, currentUser } = useStore();
    const [tab, setTab] = useState<'saved' | 'chats'>('saved');

    const saved = listings.filter((l) => savedListings.includes(l.id));

    const myChats = chatThreads.filter(
        (t) => t.type === 'MARKETPLACE' && (t.participants?.some(p => p.id === currentUser?.id))
    );

    return (
        <>
            <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:px-6 lg:pb-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-primary-text,white)]">📚 Meus Interesses</h1>
                    <p className="text-sm text-beet-muted mt-1">Anúncios salvos e conversas do marketplace</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: 'var(--color-border)' }}>
                    {[
                        { id: 'saved', label: `⭐ Salvos (${saved.length})` },
                        { id: 'chats', label: `💬 Chats (${myChats.length})` },
                    ].map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id as any)}
                            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                            style={{
                                background: tab === t.id ? 'var(--color-accent-dim)' : 'transparent',
                                color: tab === t.id ? 'var(--color-accent)' : 'var(--color-muted)',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Saved listings */}
                {tab === 'saved' && (
                    <>
                        {saved.length === 0 ? (
                            <EmptyState icon="⭐" title="Nenhum anúncio salvo"
                                description="Salve anúncios interessantes para acessar rapidamente"
                                action={<Link href="/marketplace" className="btn-outline text-sm">Explorar Marketplace →</Link>} />
                        ) : (
                            <div className="space-y-3">
                                {saved.map((listing, i) => {
                                    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === listing.category);
                                    return (
                                        <motion.div key={listing.id} className="beet-card p-4 flex gap-3 items-start"
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                                                style={{ background: `${cat?.color}18` }}>
                                                {cat?.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/marketplace/listing/${listing.id}`}>
                                                    <p className="font-semibold text-[var(--color-primary-text,white)] text-sm hover:text-neon transition-colors line-clamp-1">{listing.title}</p>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-beet-muted">{listing.sellerName}</span>
                                                    <ScoreBeetBadge score={listing.sellerScore || 0} />
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="font-black text-[var(--color-primary-text,white)] text-sm">
                                                    R$ {listing.price.toLocaleString('pt-BR')}
                                                    {listing.priceType === 'NEGOTIABLE' && '+'}
                                                </p>
                                                <div className="flex gap-1 mt-1">
                                                    <Link href={`/marketplace/listing/${listing.id}`}
                                                        className="btn-outline px-2 py-1 text-[10px]">Ver</Link>
                                                    <button onClick={() => toggleSaveListing(listing.id)}
                                                        className="rounded-lg border px-2 py-1 text-[10px] text-beet-red border-beet-red/30 hover:bg-beet-red/10 transition-colors"
                                                        title="Remover dos salvos">⭐</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Marketplace chats */}
                {tab === 'chats' && (
                    <>
                        {myChats.length === 0 ? (
                            <EmptyState icon="💬" title="Nenhuma conversa ainda"
                                description="Inicie uma conversa ao clicar 'Falar no Chat' em qualquer anúncio"
                                action={<Link href="/marketplace" className="btn-outline text-sm">Ver anúncios →</Link>} />
                        ) : (
                            <div className="space-y-3">
                                {myChats.map((chat, i) => {
                                    const lastMsg = chat.messages?.[chat.messages.length - 1];
                                    const otherParticipant = chat.participants?.find(p => p.id !== currentUser?.id);
                                    const otherName = otherParticipant?.name || 'Usuário';
                                    const isBuyer = chat.metadata?.buyerId === currentUser?.id;
                                    return (
                                        <motion.div key={chat.id}
                                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <Link href={`/marketplace/chat/${chat.id}`}
                                                className="beet-card flex items-center gap-3 p-4 hover:bg-beet-card/80 transition-colors">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
                                                    style={{ background: 'var(--color-accent-dim)' }}>🛍️</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-[var(--color-primary-text,white)] text-sm line-clamp-1">{chat.listing?.title || 'Anúncio'}</p>
                                                    <p className="text-xs text-beet-muted">{isBuyer ? `Vendedor: ${otherName}` : `Comprador: ${otherName}`}</p>
                                                    {lastMsg && (
                                                        <p className="text-xs text-beet-muted mt-0.5 line-clamp-1">{lastMsg.content}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-beet-muted flex-shrink-0">{chat.messages?.length || 0} msgs</span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
