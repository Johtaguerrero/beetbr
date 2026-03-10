'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Search, Plus, MapPin, Clock, Users,
    CheckCircle2, MoreVertical, Heart, Share2, Zap,
    Filter, Radio, X
} from 'lucide-react';
import Link from 'next/link';
import { useStore, COLLAB_TYPE_CONFIG, CollabPost, CollabType } from '@/lib/store';
import { ScoreBeetBadge, Avatar } from '@/components/ui';

const COLLAB_FILTERS = [
    { id: 'all', label: 'TODOS', mono: 'ALL' },
    { id: 'FEAT', label: 'FEAT', mono: 'FT' },
    { id: 'PRODUCER', label: 'PRODUTORES', mono: 'PRD' },
    { id: 'MIX_MASTER', label: 'MIX/MASTER', mono: 'MIX' },
    { id: 'SONGWRITER', label: 'COMPOSITORES', mono: 'SNG' },
    { id: 'MUSICIAN', label: 'MÚSICOS', mono: 'MUS' },
    { id: 'OTHER', label: 'OUTROS', mono: 'OTH' },
];

export default function CollabsPage() {
    const { collabPosts, currentUser } = useStore();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const filteredCollabs = collabPosts.filter((collab: CollabPost) => {
        const matchesFilter = activeFilter === 'all' || collab.type === activeFilter;
        const matchesSearch =
            collab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collab.authorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch && (collab.status === 'ACTIVE' || (collab.status as string) === 'active');
    });

    return (
        <div className="min-h-screen pb-24 lg:pb-8" style={{ background: 'var(--color-bg)' }}>

            {/* ═══ HEADER ═══ */}
            <div className="sticky top-0 z-30 px-4 pt-4 pb-3" style={{
                background: 'var(--color-nav-bg)',
                backdropFilter: 'blur(24px)',
                borderBottom: '1px solid var(--color-nav-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}>
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.5), transparent)',
                }} />

                {/* Title row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={currentUser?.role === 'INDUSTRY' ? '/industry/dashboard' : '/artist/feed'}
                            className="flex h-8 w-8 items-center justify-center transition-all"
                            style={{
                                border: '1px solid var(--color-nav-border)',
                                borderRadius: '2px',
                                color: 'var(--color-muted)',
                            }}
                        >
                            <ArrowLeft size={16} strokeWidth={2} />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
                                    COLABORAÇÕES
                                </h1>
                                {/* Live indicator */}
                                <div className="flex items-center gap-1 px-2 py-0.5" style={{
                                    border: '1px solid rgba(0,255,136,0.3)',
                                    borderRadius: '2px',
                                    background: 'rgba(0,255,136,0.08)',
                                }}>
                                    <div className="h-1.5 w-1.5 rounded-full bg-beet-green animate-pulse" style={{ boxShadow: '0 0 6px #00FF88' }} />
                                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--color-accent)', letterSpacing: '0.1em' }}>LIVE</span>
                                </div>
                            </div>
                            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
                                {filteredCollabs.length} ANÚNCIOS ATIVOS
                            </p>
                        </div>
                    </div>

                    {/* New collab CTA */}
                    <Link href="/collabs/new" className="btn-glow flex items-center gap-2" style={{ padding: '9px 16px', fontSize: '10px' }}>
                        <Plus size={14} strokeWidth={2.5} />
                        NOVA COLLAB
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: searchFocused ? 'var(--color-accent)' : 'var(--color-muted)' }}
                        strokeWidth={2}
                    />
                    <input
                        type="text"
                        placeholder="> buscar por collab, artista ou gênero..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="beet-input pl-9 pr-10 py-2.5 text-sm"
                        style={{ clipPath: 'none', borderRadius: '2px' }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--color-muted)' }}
                        >
                            <X size={14} strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {COLLAB_FILTERS.map(filter => {
                        const active = activeFilter === filter.id;
                        return (
                            <motion.button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                whileTap={{ scale: 0.94 }}
                                className="flex items-center gap-1.5 whitespace-nowrap transition-all flex-shrink-0"
                                style={{
                                    fontFamily: 'Space Mono, monospace',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    padding: '6px 12px',
                                    borderRadius: '2px',
                                    border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-nav-border)',
                                    background: active ? 'var(--color-accent)' : 'var(--color-glass-btn)',
                                    color: active ? '#000' : 'var(--color-muted)',
                                    boxShadow: active ? '2px 2px 0 rgba(0,255,136,0.4), 0 0 12px rgba(0,255,136,0.2)' : 'none',
                                    transform: active ? 'translate(-1px,-1px)' : 'none',
                                }}
                            >
                                {filter.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div className="px-4 py-6 max-w-5xl mx-auto">
                {filteredCollabs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCollabs.map((collab, index) => (
                            <CollabCard key={collab.id} collab={collab} index={index} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center" style={{
                            border: '1px solid rgba(0,255,136,0.2)',
                            borderRadius: '2px',
                            background: 'rgba(0,255,136,0.04)',
                        }}>
                            <Users size={28} strokeWidth={1.5} style={{ color: 'rgba(0,255,136,0.5)' }} />
                        </div>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '0.1em' }}>
                            NENHUM ANÚNCIO ENCONTRADO
                        </p>
                        <button
                            onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                            className="mt-4 btn-ghost"
                            style={{ fontSize: '9px' }}
                        >
                            LIMPAR FILTROS
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ═══ COLLAB CARD ═══
function CollabCard({ collab, index }: { collab: CollabPost; index: number }) {
    const config = COLLAB_TYPE_CONFIG[collab.type];
    const { expressInterest, currentUser } = useStore();
    const isAuthor = currentUser?.id === collab.authorId;
    const [liked, setLiked] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden"
            style={{
                background: 'var(--color-card)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `2px solid ${config.color}`,
                borderRadius: '2px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${config.color}60`;
                (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 0 ${config.color}40, 0 8px 32px rgba(0,0,0,0.7)`;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
                (e.currentTarget as HTMLElement).style.borderLeftColor = config.color;
            }}
        >
            {/* Corner accent glow */}
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{
                background: `radial-gradient(circle at top right, ${config.color}18, transparent 65%)`,
            }} />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{
                background: `linear-gradient(90deg, ${config.color}60, transparent)`,
            }} />

            <div className="p-5 flex flex-col h-full relative">

                {/* ── Author row ── */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar name={collab.authorName} imageUrl={collab.authorAvatarUrl} size="sm" />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {collab.authorName}
                                </span>
                                {collab.authorVerified && (
                                    <CheckCircle2 size={11} style={{ color: '#00E5FF' }} />
                                )}
                                <ScoreBeetBadge score={collab.authorScore || 0} size="sm" />
                            </div>
                            <div className="flex items-center gap-1 mt-0.5" style={{
                                fontFamily: 'Space Mono, monospace',
                                fontSize: '9px',
                                color: 'var(--color-muted)',
                                letterSpacing: '0.06em',
                            }}>
                                <MapPin size={8} strokeWidth={2} />
                                {collab.authorCity}, {collab.authorState}
                            </div>
                        </div>
                    </div>

                    <button className="transition-colors p-1.5" style={{ color: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                    >
                        <MoreVertical size={16} strokeWidth={1.75} />
                    </button>
                </div>

                {/* ── Type badge ── */}
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5" style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '8px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        padding: '3px 8px',
                        borderRadius: '2px',
                        background: `${config.color}18`,
                        border: `1px solid ${config.color}40`,
                        color: config.color,
                    }}>
                        <Zap size={9} strokeWidth={2.5} />
                        LOOKING FOR {config.label.toUpperCase()}
                    </span>
                </div>

                {/* ── Title + description ── */}
                <div className="flex-grow mb-4">
                    <h3 className="text-base font-black text-white mb-1.5 leading-tight group-hover:text-beet-green transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {collab.title}
                    </h3>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {collab.description}
                    </p>
                </div>

                {/* ── Genres ── */}
                {collab.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {collab.genres.slice(0, 3).map(genre => (
                            <span key={genre} style={{
                                fontFamily: 'Space Mono, monospace',
                                fontSize: '8px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                padding: '2px 8px',
                                borderRadius: '2px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.35)',
                                background: 'rgba(255,255,255,0.03)',
                            }}>
                                #{genre.toUpperCase()}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1" style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '9px',
                        color: 'var(--color-muted)',
                        letterSpacing: '0.04em',
                    }}>
                        <Clock size={10} strokeWidth={2} />
                        HÁ 2H
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Like */}
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setLiked(!liked)}
                            className="flex h-7 w-7 items-center justify-center transition-all"
                            style={{
                                borderRadius: '2px',
                                border: liked ? '1px solid rgba(255,0,85,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                background: liked ? 'rgba(255,0,85,0.1)' : 'transparent',
                                color: liked ? '#FF0055' : 'rgba(255,255,255,0.30)',
                                boxShadow: liked ? '0 0 10px rgba(255,0,85,0.2)' : 'none',
                            }}
                        >
                            <Heart size={13} strokeWidth={2} fill={liked ? '#FF0055' : 'none'} />
                        </motion.button>

                        {/* Share */}
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            className="flex h-7 w-7 items-center justify-center transition-all"
                            style={{
                                borderRadius: '2px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.30)',
                            }}
                        >
                            <Share2 size={13} strokeWidth={2} />
                        </motion.button>

                        {/* CTA */}
                        {isAuthor ? (
                            <Link href="/artist/collabs">
                                <motion.span
                                    whileHover={{ x: -1, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="inline-flex items-center gap-1.5 transition-all"
                                    style={{
                                        fontFamily: 'Space Mono, monospace',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        padding: '6px 12px',
                                        borderRadius: '2px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: 'var(--color-gray)',
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    GERENCIAR
                                </motion.span>
                            </Link>
                        ) : (
                            <motion.button
                                whileHover={{ x: -2, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => expressInterest(collab.id, '')}
                                className="inline-flex items-center gap-1.5 transition-all"
                                style={{
                                    fontFamily: 'Syne, sans-serif',
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    letterSpacing: '0.1em',
                                    padding: '7px 14px',
                                    borderRadius: '2px',
                                    border: `1px solid ${config.color}`,
                                    background: `${config.color}18`,
                                    color: config.color,
                                    boxShadow: `2px 2px 0 ${config.color}40`,
                                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                    cursor: 'pointer',
                                }}
                            >
                                <Zap size={11} strokeWidth={2.5} />
                                TENHO INTERESSE
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Invisible link overlay */}
            <Link href={`/collabs/${collab.id}`} className="absolute inset-x-0 top-0 h-[calc(100%-68px)] z-10" />
        </motion.div>
    );
}
