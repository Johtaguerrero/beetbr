'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MOCK_ARTISTS } from '@/lib/store';
import { Avatar, ScoreBeetBadge, Skeleton, EmptyState, FollowButton, CustomSelect } from '@/components/ui';

const GENRES = ['', 'Funk', 'Trap', 'R&B', 'Pop', 'Sertanejo', 'Forró', 'Gospel', 'Rock', 'Eletrônico', 'MPB'];
const STATES = ['', 'SP', 'RJ', 'MG', 'BA', 'CE', 'RS', 'PR', 'PE'];

const TREND_ICON: Record<string, string> = { up: '▲', down: '▼', stable: '→' };
const TREND_COLOR: Record<string, string> = { up: '#00FF66', down: '#FF2D2D', stable: '#FFD400' };
const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export default function Rankings() {
    useAuthGuard();
    const { artists, fetchArtists } = useStore();
    const [loading, setLoading] = useState(true);
    const [genre, setGenre] = useState('');
    const [state, setState] = useState('');
    const [limit, setLimit] = useState<10 | 20 | 50>(10);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            if (artists.length === 0) {
                await fetchArtists();
            }
            setLoading(false);
        };
        load();
    }, []);

    const getRankings = () => {
        let ranked = [...artists];
        if (genre) ranked = ranked.filter((a) => a.genres.includes(genre));
        if (state) ranked = ranked.filter((a) => a.state === state);
        ranked = ranked.sort((a, b) => b.scoreBeet - a.scoreBeet).slice(0, limit);
        return ranked.map((a) => ({
            ...a,
            trend: (a.metrics?.weeklyGrowth || 0) > 3 ? 'up' : (a.metrics?.weeklyGrowth || 0) < 0 ? 'down' : 'stable',
        }));
    };

    const rankings = getRankings();

    return (
        <>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
                {/* Page header */}
                <div className="mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 20 }}>
                    <p className="section-label" style={{ marginBottom: 8 }}>TOP ARTISTS</p>
                    <h1 className="page-header">RANKINGS<br /><span style={{ color: 'var(--color-accent)' }}>BEATBR</span></h1>
                    <p className="page-subtitle" style={{ marginTop: 8, fontSize: 15 }}>Os artistas em alta na música brasileira</p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <p className="section-label w-full" style={{ marginBottom: 4 }}>FILTRAR POR</p>
                    <CustomSelect 
                        value={genre} 
                        onChange={setGenre}
                        options={[
                            { value: '', label: 'TODOS OS GÊNEROS' },
                            ...GENRES.filter(Boolean).map(g => ({ value: g, label: g.toUpperCase() }))
                        ]}
                        style={{ flex: '1 1 140px' }}
                    />
                    <CustomSelect 
                        value={state} 
                        onChange={setState}
                        options={[
                            { value: '', label: 'TODOS ESTADOS' },
                            ...STATES.filter(Boolean).map(s => ({ value: s, label: s }))
                        ]}
                        style={{ flex: '1 1 120px' }}
                    />
                    <div className="flex gap-1">
                        {([10, 20, 50] as const).map((l) => (
                            <button key={l} onClick={() => setLimit(l)}
                                className={`beet-pill cursor-pointer ${limit === l ? 'active' : ''}`}>TOP {l}</button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                ) : rankings.length === 0 ? (
                    <EmptyState icon="🔍" title="Nenhum resultado" description="Tente remover os filtros"
                        action={<button onClick={() => { setGenre(''); setState(''); }} className="btn-outline text-sm">Limpar filtros</button>} />
                ) : (
                    <div className="space-y-2">
                        {rankings.map((artist, idx) => (
                            <motion.div key={artist.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                                <Link href={`/artist/profile/${artist.id}`}
                                    className="beet-card flex items-center gap-4 p-4"
                                    style={{ textDecoration: 'none', borderLeft: idx < 3 ? `3px solid ${idx === 0 ? '#FFE600' : idx === 1 ? '#aaa' : '#CD7F32'}` : '3px solid rgba(255,255,255,0.06)' }}
                                >
                                    {/* Rank */}
                                    <div style={{ width: 40, flexShrink: 0, textAlign: 'center' }}>
                                        {MEDAL[idx] ? (
                                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', lineHeight: 1 }}>{MEDAL[idx]}</span>
                                        ) : (
                                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>#{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="sm" />

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>{artist.stageName}</p>
                                            {artist.verified && <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700, color: 'var(--color-blue)', letterSpacing: '0.1em' }}>✓ VERIFIED</span>}
                                        </div>
                                        <p className="meta-text" style={{ marginTop: 3 }}>{artist.genres.join(' · ')} · {artist.city}, {artist.state}</p>
                                    </div>

                                    {/* Score + Trend + Follow */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <FollowButton artistId={artist.id} size="sm" showIcon={false} className="hidden md:flex" />
                                        
                                        <div style={{ textAlign: 'right' }}>
                                            <ScoreBeetBadge score={artist.scoreBeet} size="md" />
                                            <div style={{ marginTop: 4, fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, color: TREND_COLOR[artist.trend] }}>
                                                {TREND_ICON[artist.trend]} {Math.abs(artist.metrics?.weeklyGrowth || 0).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

