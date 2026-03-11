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
    const [portfolioSubTab, setPortfolioSubTab] = useState<'tracks' | 'videos' | 'lyrics' | 'photos' | 'pdf'>('tracks');

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
            {/* Banner cinematográfico 3:1 */}
            <div
                className={`relative w-full aspect-[3/1] md:h-[320px] lg:h-[420px] rounded-2xl bg-beet-dark overflow-hidden group shadow-2xl ${isSelf ? 'cursor-pointer' : ''}`}
                onClick={() => isSelf && coverInputRef.current?.click()}
            >
                {artist.coverUrl && !bannerError ? (
                    <div className="relative w-full h-full">
                        <img src={api.getMediaUrl(artist.coverUrl)} className="w-full h-full object-cover" alt="Banner" onError={() => setBannerError(true)} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-beet-dark to-beet-card flex items-center justify-center" style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.1) 0%, rgba(0,0,0,0) 60%), #181818` }}>
                        {!artist.coverUrl && <span className="text-beet-muted font-mono text-[10px] uppercase tracking-widest">Sem Banner Definido</span>}
                    </div>
                )}
                {isSelf && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                            {uploading.cover ? 'Carregando...' : '📷 Alterar Banner Profissional'}
                        </span>
                    </div>
                )}
            </div>

            {/* Botão de Edição Superior */}
            {isSelf && (
                <button onClick={() => setIsEditModalOpen(true)} className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10 z-20">
                    ✏️ Editar perfil
                </button>
            )}

            {/* Avatar sobreposto parcialmente */}
            <div className="absolute -bottom-12 left-8 md:left-12 group z-10">
                <div className={`relative ${isSelf ? 'cursor-pointer' : ''}`} onClick={() => isSelf && avatarInputRef.current?.click()}>
                    <div className="p-1.5 bg-beet-dark rounded-full shadow-2xl border border-white/5">
                        <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="xl" emoji="🎤" />
                    </div>
                    {isSelf && (
                        <div className="absolute inset-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">{uploading.avatar ? '...' : 'Trocar'}</span>
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


            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

            <div className="mb-5 pl-1 pt-16 md:pt-20">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-tighter italic">{artist.stageName}</h1>
                            {artist.verified && <span className="text-beet-blue text-xl shadow-beet-blue/20 drop-shadow-md">✓</span>}
                        </div>
                        {artist.realName && <p className="text-xs text-beet-muted font-medium mb-1">{artist.realName} {artist.pronouns && `(${artist.pronouns})`}</p>}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-beet-muted font-medium flex items-center gap-1.5">
                                📍 {artist.city || 'Brasil'}, {artist.state || 'BR'}
                            </span>
                            {artist.availabilityStatus && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-beet-accent/10 text-beet-accent border border-beet-accent/20">
                                    • {artist.availabilityStatus}
                                </span>
                            )}
                        </div>
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
                    {/* Sub-tabs de portfólio */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'tracks', label: 'Músicas', icon: '🎵' },
                            { id: 'videos', label: 'Vídeos', icon: '🎬' },
                            { id: 'lyrics', label: 'Letras', icon: '📝' },
                            { id: 'photos', label: 'Fotos', icon: '🖼️' },
                            { id: 'pdf', label: 'PDF Profissional', icon: '📄' }
                        ].map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setPortfolioSubTab(sub.id as any)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${portfolioSubTab === sub.id ? 'bg-beet-accent text-beet-black border-beet-accent shadow-[0_0_15px_rgba(0,255,102,0.3)]' : 'bg-beet-dark text-beet-muted border-white/5 hover:border-white/20'}`}
                            >
                                {sub.icon} {sub.label}
                            </button>
                        ))}
                    </div>

                    {portfolioSubTab === 'tracks' && (
                        <div className="grid grid-cols-1 gap-4">
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id && p.type === 'TRACK').map((post) => (
                                <div key={post.id} className="beet-card overflow-hidden group hover:border-beet-blue/30 transition-all cursor-pointer">
                                    <div className="p-4 flex gap-4">
                                        <div className="h-16 w-16 rounded-lg bg-beet-dark flex items-center justify-center flex-shrink-0 text-2xl shadow-inner border border-white/5">
                                            🎵
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium line-clamp-2">{post.text || 'Sem título'}</p>
                                            <div className="mt-2 flex items-center gap-3 text-[10px] text-beet-muted font-bold uppercase tracking-tighter">
                                                <span>▶️ {(post.plays || 0).toLocaleString('pt-BR')}</span>
                                                <span>❤️ {post.likes || 0}</span>
                                                <span>🕒 {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                        <TrackPlayer />
                                    </div>
                                </div>
                            ))}
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id && p.type === 'TRACK').length === 0 && (
                                <EmptyState icon="🎵" title="Nenhuma música ainda" description="O artista ainda não publicou faixas de destaque." />
                            )}
                        </div>
                    )}

                    {portfolioSubTab === 'videos' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id && p.type === 'VIDEO').map((post) => (
                                <div key={post.id} className="beet-card overflow-hidden aspect-video relative group border-white/5 hover:border-beet-accent/30 transition-all">
                                    <div className="absolute inset-0 bg-beet-dark flex items-center justify-center text-4xl opacity-50">🎬</div>
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-black/60 backdrop-blur-md">
                                        <p className="text-xs text-white font-medium line-clamp-1">{post.text || 'Video Clip'}</p>
                                    </div>
                                </div>
                            ))}
                            {(useStore.getState().posts || []).filter((p) => p.artistId === artist.id && p.type === 'VIDEO').length === 0 && (
                                <div className="col-span-full"><EmptyState icon="🎬" title="Nenhum vídeo" /></div>
                            )}
                        </div>
                    )}

                    {portfolioSubTab === 'lyrics' && (
                        <div className="space-y-4">
                            <div className="beet-card p-4 border-dashed border-white/10 opacity-60">
                                <p className="text-xs text-beet-muted font-mono uppercase text-center py-4 italic">Modulo de Letras em fase de sincronização...</p>
                            </div>
                        </div>
                    )}

                    {portfolioSubTab === 'photos' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square bg-beet-dark rounded-xl border border-white/5 overflow-hidden group">
                                    <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">📸</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {portfolioSubTab === 'pdf' && (
                        <div className="beet-card p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-beet-card to-beet-black border-beet-accent/10">
                            <div className="h-20 w-20 rounded-2xl bg-beet-accent/10 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,102,0.1)]">
                                📄
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Portfólio Profissional (Presskit)</h3>
                                <p className="text-sm text-beet-muted max-w-sm mt-2">
                                    Dossiê completo com biografia, fotos de alta, mapa de palco e contatos profissionais para contratantes.
                                </p>
                            </div>
                            {artist.portfolioPdfUrl ? (
                                <a
                                    href={api.getMediaUrl(artist.portfolioPdfUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-accent px-10 py-4 text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                                >
                                    📥 Baixar Portfólio (PDF)
                                </a>
                            ) : (
                                <div className="p-4 border border-white/5 rounded-xl bg-black/20">
                                    <p className="text-xs text-beet-muted uppercase font-bold tracking-widest">Aguardando upload do artista</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="beet-card p-6">
                        <p className="section-title mb-4 text-beet-blue">Biografia Completa</p>
                        <p className="text-sm text-beet-gray leading-relaxed pl-1 mb-6 whitespace-pre-wrap">
                            {artist.bioFull || artist.bio || 'O artista ainda não preencheu sua biografia completa.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                            <div>
                                <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mb-3">🏷️ Classificação</p>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] text-beet-muted block mb-1">Gênero Principal</span>
                                        <div className="flex flex-wrap gap-1">{(artist.genres || []).map(g => <span key={g} className="text-[10px] bg-beet-dark border border-white/5 px-2.5 py-1 rounded-lg text-white font-bold">{g}</span>)}</div>
                                    </div>
                                    {(artist.subGenres && artist.subGenres.length > 0) && (
                                        <div>
                                            <span className="text-[10px] text-beet-muted block mb-1">Subgêneros</span>
                                            <div className="flex flex-wrap gap-1">{(artist.subGenres).map(g => <span key={g} className="text-[10px] bg-beet-dark border border-white/5 px-2.5 py-1 rounded-lg text-beet-blue font-medium">{g}</span>)}</div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-[10px] text-beet-muted block mb-1">Funções</span>
                                        <div className="flex flex-wrap gap-1">{(artist.roles || []).map(r => <span key={r} className="text-[10px] bg-beet-blue/10 border border-beet-blue/20 px-2.5 py-1 rounded-lg text-beet-blue uppercase font-black">{r}</span>)}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mb-3">📍 Localização & Status</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-beet-dark flex items-center justify-center border border-white/5 text-sm">🌎</div>
                                        <div>
                                            <p className="text-xs text-white font-bold">{artist.city}, {artist.state}</p>
                                            <p className="text-[9px] text-beet-muted uppercase font-medium">Cidade / Estado</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-beet-dark flex items-center justify-center border border-white/5 text-sm">🚀</div>
                                        <div>
                                            <p className="text-xs text-white font-bold">{artist.status || 'Profissional'}</p>
                                            <p className="text-[9px] text-beet-muted uppercase font-medium">Momento de Carreira</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="beet-card p-6 border-beet-accent/5">
                        <p className="section-title mb-5 flex items-center gap-2">🤝 Disponibilidade para Negócios</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {artist.professionalQuestions && Object.entries(artist.professionalQuestions as any).map(([q, a]: any) => (
                                <div key={q} className="p-3 bg-beet-dark rounded-xl border border-white/5 flex justify-between items-center group hover:border-beet-accent/20 transition-all">
                                    <span className="text-[10px] text-beet-muted font-bold group-hover:text-white transition-colors">{q}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${a === 'Sim' ? 'text-beet-accent' : a === 'Não' ? 'text-red-400' : 'text-beet-blue'}`}>{a}</span>
                                </div>
                            ))}
                            {!artist.professionalQuestions && (
                                <div className="col-span-full py-4 text-center">
                                    <p className="text-xs text-beet-muted italic">Perguntas profissionais ainda não respondidas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Redes Sociais */}
                    <div className="flex flex-wrap gap-4 justify-center py-4">
                        {[
                            { id: 'instagram', icon: '📸', url: artist.instagram },
                            { id: 'spotify', icon: '🎧', url: artist.spotifyUrl },
                            { id: 'youtube', icon: '🎬', url: artist.youtubeUrl },
                            { id: 'tiktok', icon: '🎵', url: artist.tiktokUrl },
                            { id: 'soundcloud', icon: '☁️', url: artist.soundcloudUrl },
                            { id: 'website', icon: '🌐', url: artist.website }
                        ].filter(s => s.url).map(social => (
                            <a key={social.id} href={social.url!} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-xl bg-beet-dark border border-white/5 flex items-center justify-center text-xl hover:bg-beet-card hover:border-beet-accent/30 transition-all shadow-lg active:scale-95">
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </div >
    );
}
