'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ArtistProfile } from '@/lib/store';
import { Avatar, ScoreBeetBadge, GenrePill, EmptyState } from '@/components/ui';

const GENRES = ['Funk', 'Trap', 'R&B', 'Pop', 'Sertanejo', 'Forró', 'Gospel', 'Rock', 'Eletrônico', 'Indie', 'MPB'];
const STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS', 'PR', 'PE', 'GO', 'DF'];

function ArtistCard({ artist }: { artist: ArtistProfile }) {
    const { toggleShortlist, isInShortlist, addToast } = useStore();
    const inShortlist = isInShortlist(artist.id);

    const handleShortlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleShortlist(artist.id);
        addToast({
            message: inShortlist ? `${artist.stageName} removido da shortlist` : `${artist.stageName} adicionado à shortlist! ⭐`,
            type: inShortlist ? 'info' : 'success',
        });
    };

    return (
        <motion.div className="beet-card overflow-hidden" whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400 }}
            style={{ borderTop: '2px solid rgba(0,255,136,0.3)' }}
        >
            {/* Cover banner */}
            <div className="relative h-24 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.07) 0%, #101010 100%)' }}>
                <span style={{ fontSize: '2.5rem' }}>🎤</span>
                <button onClick={handleShortlist}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{ borderRadius: '2px', background: inShortlist ? 'rgba(255,212,0,0.15)' : 'rgba(0,0,0,0.6)', border: `1px solid ${inShortlist ? '#FFD400' : 'var(--color-border)'}` }}>
                    {inShortlist ? '⭐' : '☆'}
                </button>
            </div>
            <div style={{ padding: '14px 14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{artist.stageName}</p>
                        <p className="meta-text" style={{ marginTop: 4 }}>📍 {artist.city}, {artist.state}</p>
                    </div>
                    <ScoreBeetBadge score={artist.scoreBeet} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {artist.genres.slice(0, 3).map((g) => <span key={g} className="beet-pill">{g}</span>)}
                </div>
                <div className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span>🎵 {(artist.playsTotal / 1000).toFixed(0)}K PLAYS</span>
                    {artist.availableForBooking && <span style={{ color: 'var(--color-accent)' }}>● DISPONÍVEL</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/artist/profile/${artist.id}`} className="btn-outline flex-1 text-center" style={{ padding: '10px 8px', fontSize: '10px' }}>VER PERFIL</Link>
                    <Link href={`/industry/proposals/new?artistId=${artist.id}&artistName=${encodeURIComponent(artist.stageName)}`} className="btn-accent flex-1 text-center" style={{ padding: '10px 8px', fontSize: '10px' }}>PROPOSTA</Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function Discover() {
    useAuthGuard('INDUSTRY');
    const { artists } = useStore();
    const [searchState, setSearchState] = useState('');
    const [genres, setGenres] = useState<string[]>([]);
    const [minScore, setMinScore] = useState(0);
    const [availOnly, setAvailOnly] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const filteredArtists = artists.filter((a) => {
        if (searchState && a.state !== searchState) return false;
        if (genres.length > 0 && !genres.some((g) => a.genres.includes(g))) return false;
        if (a.scoreBeet < minScore) return false;
        if (availOnly && !a.availableForBooking) return false;
        return true;
    });

    const toggleGenre = (g: string) =>
        setGenres((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

    const clearFilters = () => { setSearchState(''); setGenres([]); setMinScore(0); setAvailOnly(false); };

    const hasFilters = searchState || genres.length > 0 || minScore > 0 || availOnly;

    return (
        <AppShell>
            <div className="flex h-screen overflow-hidden">
                {/* Desktop sidebar filters */}
                <aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r p-5 space-y-5 pb-8 lg:block"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <p className="page-header-sm" style={{ fontSize: '1.3rem' }}>FILTROS</p>
                        {hasFilters && <button onClick={clearFilters} className="meta-text" style={{ color: 'var(--color-accent)', cursor: 'pointer' }}>LIMPAR</button>}
                    </div>

                    <div>
                        <p className="section-title mb-2">Estado</p>
                        <div className="flex flex-wrap gap-1.5">
                            {STATES.map((s) => (
                                <button key={s} onClick={() => setSearchState(searchState === s ? '' : s)}
                                    className={`beet-pill cursor-pointer text-xs ${searchState === s ? 'active' : ''}`}>{s}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="section-title mb-2">Gênero</p>
                        <div className="flex flex-wrap gap-1.5">
                            {GENRES.map((g) => <GenrePill key={g} genre={g} active={genres.includes(g)} onClick={() => toggleGenre(g)} />)}
                        </div>
                    </div>

                    <div>
                        <p className="section-title mb-2">Score Beet mínimo: {minScore}</p>
                        <input type="range" min={0} max={95} step={5} value={minScore}
                            onChange={(e) => setMinScore(Number(e.target.value))} className="w-full" style={{ accentColor: '#0057FF' }} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white">Disponíveis agora</p>
                            <p className="text-[10px] text-beet-muted">Apenas artistas para contratação</p>
                        </div>
                        <button onClick={() => setAvailOnly(!availOnly)}
                            className="relative h-5 w-9 rounded-full transition-all"
                            style={{ background: availOnly ? '#0057FF' : 'var(--color-border)' }}>
                            <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                                style={{ left: availOnly ? '18px' : '2px' }} />
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div style={{
                        position: 'sticky', top: 0, zIndex: 10,
                        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(2,2,10,0.95)',
                        padding: '14px 16px',
                        backdropFilter: 'blur(16px)',
                    }}>
                        <div>
                            <p className="section-label" style={{ marginBottom: 4 }}>INDUSTRY DISCOVER</p>
                            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>
                                DESCOBRIR <span style={{ color: 'var(--color-blue)' }}>TALENTOS</span>
                            </h1>
                            <p className="meta-text" style={{ marginTop: 4 }}>{filteredArtists.length} ARTISTAS ENCONTRADOS</p>
                        </div>

                        {/* Mobile filter button */}
                        <button onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`flex items-center gap-1.5 btn-outline text-xs py-1.5 lg:hidden ${hasFilters ? 'border-beet-blue text-beet-blue' : ''}`}>
                            🔧 Filtros {hasFilters && `(${[searchState ? 1 : 0, genres.length, minScore > 0 ? 1 : 0, availOnly ? 1 : 0].reduce((a, b) => a + b, 0)})`}
                        </button>
                    </div>

                    {/* Mobile filters dropdown */}
                    {filtersOpen && (
                        <div className="border-b px-4 py-4 space-y-4 lg:hidden" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex flex-wrap gap-1.5">
                                {STATES.map((s) => (
                                    <button key={s} onClick={() => setSearchState(searchState === s ? '' : s)}
                                        className={`beet-pill cursor-pointer text-xs ${searchState === s ? 'active' : ''}`}>{s}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {GENRES.map((g) => <GenrePill key={g} genre={g} active={genres.includes(g)} onClick={() => toggleGenre(g)} />)}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-beet-muted">Score ≥ {minScore}</p>
                                <input type="range" min={0} max={95} step={5} value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))} className="flex-1" style={{ accentColor: '#0057FF' }} />
                            </div>
                        </div>
                    )}

                    <div className="p-4 pb-24 lg:pb-6">
                        {filteredArtists.length === 0 ? (
                            <EmptyState icon="🔍" title="Nenhum artista encontrado"
                                description="Tente ajustar os filtros para ver mais resultados"
                                action={<button onClick={clearFilters} className="btn-outline text-sm">Limpar filtros</button>} />
                        ) : (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                                {filteredArtists.map((a, i) => (
                                    <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                                        <ArtistCard artist={a} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
