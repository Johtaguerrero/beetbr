'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ArtistProfile } from '@/lib/store';
import { Avatar, ScoreBeetBadge, TrackPlayer, Skeleton, EmptyState } from '@/components/ui';

function MetricBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color?: string }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div>
            <div className="mb-1 flex justify-between text-xs">
                <span className="text-beet-muted">{label}</span>
                <span className="font-semibold text-white">{value.toFixed(1)}{max === 100 ? '%' : ''}</span>
            </div>
            <div className="h-1.5 rounded-full bg-beet-dark">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color || 'var(--color-accent)' }} />
            </div>
        </div>
    );
}

export default function ArtistProfilePage() {
    useAuthGuard();
    const params = useParams<{ id: string }>();
    const { artists, currentUser, artistProfile: myProfile, proposals } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState<ArtistProfile | null>(null);
    const isSelf = params.id === 'me';

    useEffect(() => {
        setTimeout(() => {
            const foundArtist = isSelf ? myProfile : artists.find((a) => a.id === params.id) || null;
            setArtist(foundArtist);
            setLoading(false);
        }, 400);
    }, [params.id, isSelf, artists, myProfile]);

    if (loading) return (
        <>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        </>
    );

    if (!artist) return (
        <>
            <EmptyState icon="🎤" title="Artista não encontrado" description="Este perfil não existe ou foi removido"
                action={<button onClick={() => router.back()} className="btn-outline text-sm">Voltar</button>} />
        </>
    );

    const isIndustry = currentUser?.role === 'INDUSTRY';

    return (
        <>
            <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
                {/* Cover */}
                <div className="relative mb-6">
                    <div className="h-40 rounded-xl2 bg-gradient-to-br from-beet-dark to-beet-card" style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.1) 0%, rgba(0,0,0,0) 60%), #181818` }} />
                    <div className="absolute -bottom-8 left-5">
                        <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="xl" emoji="🎤" />
                    </div>
                    {isSelf && (
                        <button className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors">
                            ✏️ Editar perfil
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="mb-5 pl-1 pt-9">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display text-2xl font-black text-white">{artist.stageName}</h1>
                                {artist.verified && <span className="text-beet-blue text-lg">✓</span>}
                            </div>
                            <p className="mt-0.5 text-sm text-beet-muted">📍 {artist.city || 'Brasil'}, {artist.state || 'BR'}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(artist.genres || []).map((g) => <span key={g} className="beet-pill text-xs">{g}</span>)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <ScoreBeetBadge score={artist.scoreBeet || 0} size="lg" />
                            {isIndustry && (
                                <Link href={`/industry/proposals/new?artistId=${artist.id}&artistName=${encodeURIComponent(artist.stageName)}`}
                                    className="btn-accent px-5 py-2.5 text-sm">
                                    📋 Enviar proposta
                                </Link>
                            )}
                        </div>
                    </div>
                    {artist.bio && <p className="mt-3 text-sm text-beet-gray leading-relaxed">{artist.bio}</p>}

                    {/* Stats row */}
                    <div className="mt-4 flex gap-5 text-center">
                        {[
                            { label: 'Seguidores', value: artist.followersCount?.toLocaleString('pt-BR') || '0' },
                            { label: 'Plays', value: artist.playsTotal ? (artist.playsTotal >= 1000000 ? `${(artist.playsTotal / 1000000).toFixed(1)}M` : `${Math.round(artist.playsTotal / 1000)}k`) : '0' },
                            { label: 'Posts', value: (useStore.getState().posts || []).filter((p) => p.artistId === artist.id).length.toString() },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="font-black text-white">{stat.value}</p>
                                <p className="text-xs text-beet-muted">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Beet details */}
                <motion.div className="beet-card mb-5 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="section-title mb-4">Score Beet · {Math.round(artist.scoreBeet || 0)}</p>
                    <div className="space-y-3">
                        <MetricBar label="Engajamento" value={artist.metrics?.engagement || 0} max={20} />
                        <MetricBar label="Crescimento semanal" value={artist.metrics?.weeklyGrowth || 0} max={30} color="var(--color-accent-2)" />
                        <MetricBar label="Retenção" value={artist.metrics?.retention || 0} max={100} color="#4D88FF" />
                        <MetricBar label="Consistência" value={artist.metrics?.consistency || 0} max={100} color="#FFD400" />
                    </div>
                </motion.div>

                {/* Recent posts */}
                <div>
                    <p className="section-title mb-3">Publicações recentes</p>
                    {((useStore.getState().posts || []).filter((p) => p.artistId === artist.id)).length === 0 ? (
                        <EmptyState icon="🎵" title="Nenhuma publicação ainda" />
                    ) : (
                        <div className="space-y-3">
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id).slice(0, 3).map((post) => (
                                <div key={post.id} className="beet-card p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-beet-muted">{post.type === 'TRACK' ? '🎵' : post.type === 'VIDEO' ? '🎬' : '📝'}</span>
                                        <p className="flex-1 text-sm text-beet-gray">{post.text?.slice(0, 80)}...</p>
                                    </div>
                                    {post.type === 'TRACK' && <TrackPlayer />}
                                    <p className="mt-2 text-xs text-beet-muted">🎵 {(post.plays || 0).toLocaleString('pt-BR')} plays · ❤️ {post.likes || 0}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
