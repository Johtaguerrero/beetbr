'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ArtistProfile } from '@/lib/store';
import { Avatar, ScoreBeetBadge, TrackPlayer, Skeleton, EmptyState } from '@/components/ui';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { api } from '@/lib/api';

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
    const { artists, currentUser, artistProfile: myProfile, updateArtistProfile, toggleFollow, isFollowing, toggleShortlist, isInShortlist } = useStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState<ArtistProfile | null>(null);
    const [uploading, setUploading] = useState<{ avatar?: boolean; cover?: boolean }>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bannerError, setBannerError] = useState(false);
    const [activeTab, setActiveTab] = useState<'portfolio' | 'metrics' | 'about'>('portfolio');

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const followed = artist ? isFollowing(artist.id) : false;
    const inShortlist = artist ? isInShortlist(artist.id) : false;
    const isSelf = params.id === 'me' || (currentUser && params.id === currentUser.id) || (myProfile && params.id === myProfile.id);

    useEffect(() => {
        const fetchArtist = async () => {
            setLoading(true);
            try {
                if (isSelf || params.id === 'me') {
                    if (myProfile) {
                        setArtist(myProfile);
                    } else {
                        // Fallback or wait for profile to load?
                        // If it's 'me' but no myProfile, maybe user isn't an artist
                    }
                } else {
                    const foundArtist = artists.find((a) => a.id === params.id);
                    if (foundArtist) {
                        setArtist(foundArtist);
                    } else {
                        const res: any = await api.artists.getPublic(params.id);
                        if (res.data) setArtist(res.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching artist:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [params.id, isSelf, artists, myProfile]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const { url } = await api.upload(file);
            await updateArtistProfile({ [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: url });
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            alert(`Erro ao carregar ${type}. Tente novamente.`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <div className="flex gap-4 items-end -mt-12 ml-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2 mb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-40 rounded-xl" />
        </div>
    );

    if (!artist) return (
        <EmptyState icon="🎤" title="Artista não encontrado" description="Este perfil não existe ou foi removido"
            action={<button onClick={() => router.back()} className="btn-outline text-sm">Voltar</button>} />
    );

    const isIndustry = currentUser?.role === 'INDUSTRY';

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
            <div className="relative mb-6">
                <div
                    className={`h-40 rounded-xl bg-beet-dark overflow-hidden group ${isSelf ? 'cursor-pointer' : ''}`}
                    onClick={() => isSelf && coverInputRef.current?.click()}
                >
                    {artist.coverUrl && !bannerError ? (
                        <img src={api.getMediaUrl(artist.coverUrl)} className="w-full h-full object-cover" alt="Banner" onError={() => setBannerError(true)} />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-beet-dark to-beet-card" style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.1) 0%, rgba(0,0,0,0) 60%), #181818` }} />
                    )}
                    {isSelf && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {uploading.cover ? 'Carregando...' : '📷 Alterar Banner'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute -bottom-8 left-5 group">
                    <div className={`relative ${isSelf ? 'cursor-pointer' : ''}`} onClick={() => isSelf && avatarInputRef.current?.click()}>
                        <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="xl" emoji="🎤" />
                        {isSelf && (
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold uppercase tracking-wider">{uploading.avatar ? '...' : 'Trocar'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {isSelf && (
                    <div className="hidden">
                        <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                        <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                    </div>
                )}

                {isSelf && (
                    <button onClick={() => setIsEditModalOpen(true)} className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10">
                        ✏️ Editar perfil
                    </button>
                )}
            </div>

            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

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
                            <div className="flex flex-col gap-2">
                                <button onClick={() => toggleFollow(artist.id)} className={`btn-${followed ? 'outline' : 'accent'} px-6 py-2.5 text-sm font-bold w-full shadow-lg transition-transform active:scale-95`}>
                                    {followed ? '👤 Seguindo' : '👤 Seguir Artista'}
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleShortlist(artist.id)} className={`flex-1 rounded-xl p-2.5 border transition-colors flex items-center justify-center gap-2 ${inShortlist ? 'bg-beet-blue/10 border-beet-blue text-beet-blue' : 'bg-beet-card border-white/5 text-beet-muted hover:border-white/20'}`}>
                                        {inShortlist ? '★' : '☆'} <span className="text-[10px] font-bold uppercase">Shortlist</span>
                                    </button>
                                    <Link href={`/industry/proposals/new?artistId=${artist.id}&artistName=${encodeURIComponent(artist.stageName)}`} className="flex-1 btn-white px-3 py-2.5 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-2">
                                        📋 Proposta
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {artist.bio && <p className="mt-4 text-sm text-beet-gray leading-relaxed max-w-2xl">{artist.bio}</p>}

                <div className="mt-6 flex gap-8 border-t border-white/5 pt-4">
                    {[
                        { label: 'Seguidores', value: artist.followersCount?.toLocaleString('pt-BR') || '0', icon: '👥' },
                        { label: 'Plays', value: artist.playsTotal ? (artist.playsTotal >= 1000000 ? `${(artist.playsTotal / 1000000).toFixed(1)}M` : `${Math.round(artist.playsTotal / 1000)}k`) : '0', icon: '▶️' },
                        { label: 'Engajamento', value: `${artist.metrics?.engagement || 0}%`, icon: '🔥' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-start translate-z-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-beet-muted flex items-center gap-1">{stat.icon} {stat.label}</span>
                            <p className="text-lg font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6 flex gap-1 rounded-2xl bg-beet-dark p-1 border border-white/5">
                {[{ id: 'portfolio', label: 'Portfólio', icon: '🎵' }, { id: 'metrics', label: 'Análise Beet', icon: '📊' }, { id: 'about', label: 'Sobre', icon: '📄' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-beet-card text-beet-blue shadow-lg border border-white/5' : 'text-beet-muted hover:text-white'}`}>
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'metrics' && (
                <motion.div className="beet-card mb-5 p-5 shadow-2xl relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ScoreBeetBadge score={artist.scoreBeet || 0} size="lg" />
                    </div>
                    <p className="section-title mb-5 flex items-center gap-2">Métricas de Performance <span className="text-xs bg-beet-blue/20 text-beet-blue px-2 py-0.5 rounded-full">Atualizado hoje</span></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <MetricBar label="Engajamento Geral" value={artist.metrics?.engagement || 0} max={20} />
                            <MetricBar label="Crescimento semanal" value={artist.metrics?.weeklyGrowth || 0} max={30} color="var(--color-accent-2)" />
                        </div>
                        <div className="space-y-4">
                            <MetricBar label="Retenção de Público" value={artist.metrics?.retention || 0} max={100} color="#4D88FF" />
                            <MetricBar label="Consistência de Postagens" value={artist.metrics?.consistency || 0} max={100} color="#FFD400" />
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'portfolio' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="section-title mb-4 flex items-center justify-between">Obras e Mídias <span className="text-[10px] text-beet-muted font-normal">{(useStore.getState().posts || []).filter((p) => p.artistId === artist.id).length} itens</span></p>
                    {((useStore.getState().posts || []).filter((p) => p.artistId === artist.id)).length === 0 ? (
                        <EmptyState icon="🎵" title="Nenhuma publicação ainda" />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id).map((post) => (
                                <div key={post.id} className="beet-card overflow-hidden group hover:border-beet-blue/30 transition-all cursor-pointer">
                                    <div className="p-4 flex gap-4">
                                        <div className="h-16 w-16 rounded-lg bg-beet-dark flex items-center justify-center flex-shrink-0 text-2xl shadow-inner border border-white/5">
                                            {post.type === 'TRACK' ? '🎵' : post.type === 'VIDEO' ? '🎬' : '📝'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium line-clamp-2">{post.text || 'Sem descrição'}</p>
                                            <div className="mt-2 flex items-center gap-3 text-[10px] text-beet-muted font-bold uppercase tracking-tighter">
                                                <span>▶️ {(post.plays || 0).toLocaleString('pt-BR')}</span>
                                                <span>❤️ {post.likes || 0}</span>
                                                <span>🕒 {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {post.type === 'TRACK' && <div className="px-4 pb-4"><TrackPlayer /></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="beet-card p-6">
                    <p className="section-title mb-4 text-beet-blue">Sobre o Artista</p>
                    <p className="text-sm text-beet-gray leading-relaxed italic border-l-2 border-beet-blue/30 pl-4 mb-6">"{artist.bio || 'Sem biografia disponível.'}"</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-beet-dark p-3">
                            <p className="text-[10px] text-beet-muted uppercase font-bold mb-1">Gêneros</p>
                            <div className="flex flex-wrap gap-1">{(artist.genres || []).map(g => <span key={g} className="text-[10px] bg-beet-card px-2 py-0.5 rounded-lg text-white">{g}</span>)}</div>
                        </div>
                        <div className="rounded-xl bg-beet-dark p-3">
                            <p className="text-[10px] text-beet-muted uppercase font-bold mb-1">Localização</p>
                            <p className="text-xs text-white">📍 {artist.city}, {artist.state}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
