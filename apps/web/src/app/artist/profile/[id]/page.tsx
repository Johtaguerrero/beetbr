'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ArtistProfile } from '@/lib/store';
import { Avatar, ScoreBeetBadge, TrackPlayer, Skeleton, EmptyState, FollowButton } from '@/components/ui';
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

import { PROFESSIONAL_QUESTIONS_LABELS, QUESTION_VALUE_LABELS } from './constants';

export default function ArtistProfilePage() {
    useAuthGuard();
    const params = useParams<{ id: string }>();
    const { 
        artists, currentUser, artistProfile: myProfile, updateArtistProfile, 
        toggleFollow, isFollowing, toggleShortlist, isInShortlist, 
        getProfilePosts, restorePost, addToast 
    } = useStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState<ArtistProfile | null>(null);
    const [uploading, setUploading] = useState<{ avatar?: boolean; cover?: boolean }>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bannerError, setBannerError] = useState(false);
    const [activeTab, setActiveTab] = useState<'portfolio' | 'metrics' | 'about'>('portfolio');
    const [portfolioSubTab, setPortfolioSubTab] = useState<'tracks' | 'videos' | 'lyrics' | 'photos' | 'pdf'>('videos');

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
            addToast({ message: `${type === 'avatar' ? 'Avatar' : 'Banner'} atualizado com sucesso!`, type: 'success' });
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            addToast({ message: `Erro ao carregar ${type}. Tente novamente.`, type: 'error' });
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
        <div className="mx-auto max-w-5xl pb-24 lg:pb-12">
            {/* 1. HEADER VISUAL (BANNER & AVATAR OVERLAP) */}
            <div className="relative mb-20 md:mb-24 px-4 pt-4">
                {/* Banner cinematográfico - Maior no mobile */}
                <div
                    className={`relative w-full h-[280px] md:h-auto md:aspect-[3/1] rounded-3xl bg-beet-dark overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 ${isSelf ? 'cursor-pointer' : ''}`}
                    onClick={() => isSelf && coverInputRef.current?.click()}
                >
                    {artist.coverUrl && !bannerError ? (
                        <div className="relative w-full h-full">
                            <img src={api.getMediaUrl(artist.coverUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" onError={() => setBannerError(true)} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-beet-dark to-beet-card flex items-center justify-center p-8 text-center" style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.1) 0%, rgba(0,0,0,0) 60%), #121212` }}>
                            {!artist.coverUrl && (
                                <div className="space-y-2">
                                    <span className="text-beet-muted font-display text-4xl opacity-20">BEEAT</span>
                                    <p className="text-beet-muted font-mono text-[10px] uppercase tracking-[0.3em]">Ambiente Artístico Premium</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Overlay de edição (Banner) */}
                    {isSelf && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
                            <div className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                                {uploading.cover ? 'Carregando...' : '📷 Alterar Banner Profissional'}
                            </div>
                        </div>
                    )}


                </div>

                {/* Avatar sobreposto centralizado/alinhado */}
                <div className="absolute -bottom-12 md:-bottom-16 left-10 md:left-14 group z-20">
                    <div className={`relative ${isSelf ? 'cursor-pointer' : ''}`} onClick={() => isSelf && avatarInputRef.current?.click()}>
                        <div className="p-1.5 bg-beet-black rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden">
                            <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="xl" className="!w-24 !h-24 md:!w-40 md:!h-40 border-2 border-beet-accent/30" />

                            {/* Glow Neon sutil no avatar */}
                            <div className="absolute inset-0 rounded-full border border-beet-accent/20 pointer-events-none" />
                        </div>

                        {isSelf && (
                            <div className="absolute inset-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm z-10 border border-white/20">
                                <span className="text-[10px] text-white font-black uppercase tracking-[0.15em]">{uploading.avatar ? '...' : 'Alterar'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Badge flutuante próximo ao avatar */}
                <div className="absolute -bottom-6 left-28 md:left-48 z-30 transform -translate-x-1/2 md:translate-x-0">
                    <ScoreBeetBadge score={artist.scoreBeet || 0} size="lg" showLabel />
                </div>

                {/* Edit Button - Agora logo abaixo do banner no mobile/desktop */}
                {isSelf && (
                    <div className="absolute top-4 right-8 z-30">
                        <button onClick={() => setIsEditModalOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 transition-all flex items-center gap-2">
                            ✏️ Editar Perfil
                        </button>
                    </div>
                )}
            </div>

            {/* 2. IDENTIDADE & INFO PRINCIPAIS */}
            <div className="px-4 md:px-8 mt-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-4">
                        <div>
                            <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                                {artist.stageName}
                                {artist.verified && <span className="ml-3 text-beet-accent text-2xl align-top">★</span>}
                            </h1>
                            {artist.realName && <p className="text-[11px] text-beet-muted font-bold uppercase tracking-widest mt-2 ml-1">{artist.realName} {artist.pronouns && `• ${artist.pronouns}`}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-white font-medium flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                📍 {artist.city}, {artist.state}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-beet-accent/10 text-beet-accent border border-beet-accent/20">
                                {artist.availabilityStatus || 'Disponível'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-beet-blue/10 text-beet-blue border border-beet-blue/20">
                                {artist.status || (artist.roles && artist.roles[0]) || (artist.genres && artist.genres[0]) || 'Artista'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {(artist.genres || []).map((g) => (
                                <span key={g} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md bg-beet-dark border border-white/5 text-beet-muted hover:text-white transition-colors">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {artist.bio && (
                            <p className="text-sm text-white/70 line-clamp-3 mb-2 max-w-2xl mx-auto md:mx-0 leading-relaxed italic">
                                "{artist.bio}"
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-[240px]">
                        {/* Ações principais (Visão Empresa ou Dono) */}
                        <div className="grid grid-cols-2 gap-2">
                            {!isSelf ? (
                                <FollowButton artistId={artist.id} size="md" className="col-span-2 h-12" />
                            ) : (
                                <button className="btn-outline h-12 text-[10px] font-black uppercase tracking-widest shadow-xl col-span-2 cursor-default opacity-60">
                                    🏠 Meu Perfil
                                </button>
                            )}

                            {isIndustry && (
                                <>
                                    <button onClick={() => toggleShortlist(artist.id)} className={`h-12 rounded-xl border transition-all flex items-center justify-center gap-2 ${inShortlist ? 'bg-beet-blue/20 border-beet-blue text-beet-blue shadow-[0_0_15px_rgba(77,136,255,0.2)]' : 'bg-beet-card border-white/5 text-beet-muted hover:border-white/20'}`}>
                                        {inShortlist ? '★' : '☆'} <span className="text-[10px] font-black uppercase">Shortlist</span>
                                    </button>
                                    <Link href={`/industry/proposals/new?artistId=${artist.id}&artistName=${encodeURIComponent(artist.stageName)}`} className="h-12 btn-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                                        📋 Proposta
                                    </Link>
                                </>
                            )}

                            {artist.portfolioPdfUrl && (
                                <a href={api.getMediaUrl(artist.portfolioPdfUrl)} target="_blank" className="h-12 bg-beet-card border border-white/10 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-beet-dark transition-all col-span-2">
                                    📥 PDF portifolio baixar
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Métricas Rápidas (Banner Slim) */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Seguidores', value: artist.followerCountTotal?.toLocaleString('pt-BR') || '0', icon: '👥' },
                        { label: 'Plays', value: artist.playsTotal ? (artist.playsTotal >= 1000000 ? `${(artist.playsTotal / 1000000).toFixed(1)}M` : `${Math.round(artist.playsTotal / 1000)}k`) : '0', icon: '▶️' },
                        { label: 'Indústria', value: artist.followerCountIndustry?.toLocaleString('pt-BR') || '0', icon: '🏢' },
                        { label: 'Artistas', value: artist.followerCountArtist?.toLocaleString('pt-BR') || '0', icon: '🎸' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-beet-dark/40 border border-white/5 rounded-2xl p-4 hover:border-beet-accent/30 transition-all group">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-beet-muted flex items-center gap-2 group-hover:text-beet-accent">
                                {stat.icon} {stat.label}
                            </span>
                            <p className="text-xl font-black text-white mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {artist.bio && (
                    <div className="mt-8">
                        <p className="text-xs text-beet-muted font-black uppercase tracking-[0.2em] mb-3">Bio Curta</p>
                        <p className="text-sm text-beet-gray leading-relaxed max-w-3xl border-l-2 border-beet-accent/30 pl-4">{artist.bio}</p>
                    </div>
                )}
            </div>

            <div className="mt-12 px-4 md:px-8">
                {/* 3. TABS PRINCIPAIS */}
                <div className="mb-8 flex gap-2 rounded-2xl bg-beet-black p-1.5 border border-white/5 shadow-2xl">
                    {[{ id: 'portfolio', label: 'Portfólio', icon: '🎨' }, { id: 'metrics', label: 'Análise Beeat', icon: '📊' }, { id: 'about', label: 'Sobre', icon: '👤' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-beet-card text-beet-accent shadow-xl border border-white/10' : 'text-white/60 hover:text-white'}`}>
                            <span className="text-lg">{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'metrics' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Score Beeat Breakdown */}
                        <div className="beet-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-beet-card to-beet-black border-beet-accent/10">
                            <div className="absolute -top-12 -right-12 h-48 w-48 bg-beet-accent/5 rounded-full blur-3xl" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="space-y-4 max-w-md">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beet-accent/10 border border-beet-accent/20 text-[10px] font-black uppercase tracking-widest text-beet-accent">
                                        ✨ Score Beeat™ Pro
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Sua Identidade Digital Profissional</h2>
                                    <p className="text-sm text-beet-muted leading-relaxed">
                                        Seu score é calculado com base na completude do seu perfil, engajamento real e relevância no ecossistema musical.
                                    </p>
                                    <div className="pt-4 flex items-center gap-6">
                                        <div>
                                            <p className="text-[10px] text-beet-muted uppercase font-black mb-1">Status Atual</p>
                                            <p className="text-lg text-white font-black uppercase tracking-tighter">{(artist.scoreBeet || 0) > 80 ? '👑 Elite' : (artist.scoreBeet || 0) > 50 ? '🥈 Pro' : '🥉 Starter'}</p>
                                        </div>
                                        <div className="h-10 w-px bg-white/10" />
                                        <div>
                                            <p className="text-[10px] text-beet-muted uppercase font-black mb-1">Posição Nacional</p>
                                            <p className="text-lg text-beet-accent font-black uppercase tracking-tighter">#{artist.ranking || '1.242'}º</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <svg className="h-40 w-40 transform -rotate-90">
                                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={440} strokeDashoffset={440 - (440 * (artist.scoreBeet || 0)) / 100} className="text-beet-accent transition-all duration-1000 ease-out" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-4xl font-black text-white italic">{Math.round(artist.scoreBeet || 0)}</span>
                                            <span className="text-[10px] text-beet-muted uppercase font-black -mt-1 tracking-widest">Beeats</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[9px] text-beet-muted uppercase font-bold tracking-[0.2em]">Sincronizado com API Beeat v3.1</p>
                                </div>
                            </div>
                        </div>

                        {/* Métricas Detalhadas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Engajamento', value: artist.metrics?.engagement || '12.4%', sub: '+2.1% esta semana', icon: '🔥', color: 'text-beet-accent' },
                                { label: 'Viralidade', value: artist.metrics?.viralIndex || 'Alta', sub: 'Música 3 em alta no feed', icon: '🚀', color: 'text-beet-blue' },
                                { label: 'Reach Total', value: (artist.metrics?.reach || '154k'), sub: '42k via Marketplace', icon: '🌎', color: 'text-white' }
                            ].map((card, i) => (
                                <div key={i} className="beet-card p-6 flex flex-col items-center text-center group hover:scale-[1.02] transition-all cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:bg-white/10 transition-colors">
                                        {card.icon}
                                    </div>
                                    <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mb-1">{card.label}</p>
                                    <p className={`text-2xl font-black italic uppercase tracking-tighter ${card.color}`}>{card.value}</p>
                                    <p className="text-[9px] text-beet-muted/60 mt-2 font-bold uppercase">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Radar de Crescimento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="beet-card p-6">
                                <p className="section-title mb-6 flex items-center gap-2">💹 Evolução de Ativos</p>
                                <div className="space-y-5">
                                    <MetricBar label="Retenção de Público (Fans)" value={78} max={100} color="#00FF66" />
                                    <MetricBar label="Autoridade de Nicho" value={45} max={100} color="#4D88FF" />
                                    <MetricBar label="Consistência de Lançamentos" value={92} max={100} color="#FFD400" />
                                    <MetricBar label="Atratividade p/ Contratantes" value={64} max={100} color="#FF2D55" />
                                </div>
                            </div>

                            <div className="beet-card p-6 bg-beet-blue/5 border-beet-blue/10 flex flex-col">
                                <p className="section-title mb-4 flex items-center gap-2 text-beet-blue">💡 Dicas de Especialista</p>
                                <div className="flex-1 space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border-l-2 border-beet-blue">
                                        <p className="text-xs text-white font-bold mb-1">Otimize seu Presskit</p>
                                        <p className="text-[10px] text-beet-muted leading-relaxed">Adicionar um portfólio PDF profissional aumenta seu score em 10 pontos e sua visibilidade em 35%.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border-l-2 border-beet-accent">
                                        <p className="text-xs text-white font-bold mb-1">Mantenha a Constância</p>
                                        <p className="text-[10px] text-beet-muted leading-relaxed">Artistas que postam updates semanais no feed retêm 3x mais seguidores orgânicos.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(true)} className="mt-6 w-full py-3 bg-beet-blue text-[10px] font-black uppercase tracking-widest text-white rounded-xl hover:bg-beet-blue/80 transition-all shadow-xl shadow-beet-blue/10">
                                    🚀 Melhorar Perfil Agora
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'portfolio' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Sub-tabs de portfólio */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { id: 'videos', label: 'Vídeos', icon: '🎬' },
                                { id: 'photos', label: 'Fotos', icon: '🖼️' },
                                { id: 'tracks', label: 'Músicas', icon: '🎵' },
                                { id: 'lyrics', label: 'Letras', icon: '📝' },
                                { id: 'pdf', label: 'PDF Portfólio', icon: '📄' }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => setPortfolioSubTab(sub.id as any)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${portfolioSubTab === sub.id ? 'bg-beet-accent text-beet-black border-beet-accent shadow-[0_0_15px_rgba(0,255,102,0.3)]' : 'bg-beet-dark text-white/60 border-white/5 hover:border-white/20'}`}
                                >
                                    {sub.icon} {sub.label}
                                </button>
                            ))}
                        </div>

                        {portfolioSubTab === 'tracks' && (
                            <div className="grid grid-cols-1 gap-4">
                                {getProfilePosts(artist.id, 'TRACK').sort((a, b) => (a.status === 'PINNED' ? -1 : b.status === 'PINNED' ? 1 : 0)).map((post) => (
                                    <div key={post.id} className="beet-card overflow-hidden group hover:border-beet-accent/20 transition-all" style={{ opacity: post.status === 'ARCHIVED' ? 0.5 : 1 }}>
                                        <div className="p-5 flex gap-5 items-center">
                                            <div className="h-20 w-20 rounded-2xl bg-beet-dark flex items-center justify-center flex-shrink-0 text-3xl shadow-inner border border-white/5 group-hover:bg-beet-accent/5 transition-colors">
                                                🎵
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base text-white font-bold tracking-tight line-clamp-1">{post.text || 'Single sem título'}</p>
                                                    {post.status === 'PINNED' && <span className="text-[9px] bg-beet-accent/10 text-beet-accent px-2 py-0.5 rounded font-bold uppercase">📌 Fixado</span>}
                                                    {post.status === 'ARCHIVED' && isSelf && <span className="text-[9px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-bold uppercase">Arquivado</span>}
                                                </div>
                                                <p className="text-[10px] text-beet-muted font-black uppercase tracking-widest mt-1">Lançamento Oficial</p>
                                                <div className="mt-4 flex items-center gap-4 text-[10px] text-beet-muted font-bold uppercase tracking-tighter">
                                                    <span className="flex items-center gap-1">▶️ <span className="text-white">{(post.plays || 0).toLocaleString('pt-BR')}</span></span>
                                                    <span className="flex items-center gap-1">❤️ <span className="text-white">{post.likes || 0}</span></span>
                                                    <span className="bg-white/5 px-2 py-1 rounded-md">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {post.status === 'ARCHIVED' && isSelf && (
                                                <button onClick={() => restorePost(post.id)} className="text-[9px] text-beet-accent font-bold uppercase tracking-wider hover:bg-beet-accent/10 px-3 py-1.5 rounded transition-colors">Restaurar</button>
                                            )}
                                        </div>
                                        <div className="px-5 pb-5 pt-2">
                                            <TrackPlayer url={post.mediaUrl} />
                                        </div>
                                    </div>
                                ))}
                                {getProfilePosts(artist.id, 'TRACK').length === 0 && (
                                    <EmptyState icon="🎵" title="Nenhuma música ainda" description="O artista ainda não publicou faixas de destaque." />
                                )}
                            </div>
                        )}

                        {portfolioSubTab === 'videos' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {getProfilePosts(artist.id, 'VIDEO').sort((a, b) => (a.status === 'PINNED' ? -1 : b.status === 'PINNED' ? 1 : 0)).map((post) => (
                                    <div key={post.id} className="beet-card overflow-hidden aspect-video relative group border-white/5 hover:border-beet-accent/30 transition-all shadow-2xl cursor-pointer" style={{ opacity: post.status === 'ARCHIVED' ? 0.5 : 1 }}>
                                        {post.mediaUrl ? (
                                            <video src={api.getMediaUrl(post.mediaUrl)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 bg-beet-dark flex items-center justify-center text-6xl opacity-20">🎬</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                            <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-110 group-hover:scale-125 transition-transform">
                                                <span className="ml-1">▶️</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-white font-bold tracking-tight line-clamp-1 flex-1">{post.text || 'Clipe Oficial'}</p>
                                                {post.status === 'PINNED' && <span className="text-[8px] bg-beet-accent/10 text-beet-accent px-1.5 py-0.5 rounded font-bold">📌</span>}
                                            </div>
                                            <p className="text-[9px] text-beet-muted font-black uppercase tracking-widest mt-1">Video Release</p>
                                        </div>
                                    </div>
                                ))}
                                {getProfilePosts(artist.id, 'VIDEO').length === 0 && (
                                    <div className="col-span-full py-12"><EmptyState icon="🎬" title="Nenhum clipe disponível" description="Em breve novos vídeos serão adicionados." /></div>
                                )}
                            </div>
                        )}

                        {portfolioSubTab === 'lyrics' && (
                            <div className="space-y-4">
                                {getProfilePosts(artist.id, 'LYRIC').length > 0 ? (
                                    getProfilePosts(artist.id, 'LYRIC').sort((a, b) => (a.status === 'PINNED' ? -1 : b.status === 'PINNED' ? 1 : 0)).map(post => (
                                        <div key={post.id} className="beet-card p-6" style={{ opacity: post.status === 'ARCHIVED' ? 0.5 : 1 }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-lg">📝</span>
                                                <p className="text-sm font-bold text-white">{post.text?.split('\n')[0] || 'Composição'}</p>
                                                {post.status === 'PINNED' && <span className="text-[9px] bg-beet-accent/10 text-beet-accent px-2 py-0.5 rounded font-bold uppercase">📌 Fixado</span>}
                                            </div>
                                            <p className="text-sm text-beet-gray whitespace-pre-wrap leading-relaxed">{post.text}</p>
                                            <p className="text-[9px] text-beet-muted mt-3 uppercase font-bold tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="beet-card p-10 flex flex-col items-center justify-center text-center bg-black/20 border-dashed border-white/10">
                                        <div className="text-4xl mb-4 opacity-40">📝</div>
                                        <p className="text-sm text-beet-muted font-bold uppercase tracking-widest">Sincronização de Letras</p>
                                        <p className="text-[10px] text-beet-muted/50 mt-1 max-w-xs">As composições deste artista estão sendo revisadas para publicação oficial.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {portfolioSubTab === 'photos' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {getProfilePosts(artist.id, 'IMAGE').length > 0 ? (
                                    getProfilePosts(artist.id, 'IMAGE').sort((a, b) => (a.status === 'PINNED' ? -1 : b.status === 'PINNED' ? 1 : 0)).map(post => (
                                        <div key={post.id} className="aspect-square bg-beet-dark rounded-2xl border border-white/5 overflow-hidden group relative cursor-pointer hover:border-beet-accent/30 transition-all" style={{ opacity: post.status === 'ARCHIVED' ? 0.5 : 1 }}>
                                            {post.mediaUrl ? (
                                                <img src={api.getMediaUrl(post.mediaUrl)} alt={post.text || 'Foto'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-10 text-5xl">🖼️</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {post.status === 'PINNED' && <span className="absolute top-2 left-2 text-[8px] bg-beet-accent/20 text-beet-accent px-1.5 py-0.5 rounded font-bold">📌</span>}
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-square bg-beet-dark rounded-2xl border border-white/5 overflow-hidden group relative cursor-pointer hover:border-beet-accent/30 transition-all">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-40 transition-opacity text-5xl">🖼️</div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))
                                )}
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
                            <p className="section-title mb-5 flex items-center gap-2">🤝 Perfil Profissional (Q&A)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {artist.professionalQuestions && Object.entries(artist.professionalQuestions as any).map(([q, a]: any) => (
                                    <div key={q} className="p-3 bg-beet-dark/50 rounded-xl border border-white/5 flex justify-between items-center group hover:border-beet-accent/20 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-beet-muted font-bold group-hover:text-white transition-colors">
                                                {PROFESSIONAL_QUESTIONS_LABELS[q] || q}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 ${['YES', 'SOLO', 'BANDA', 'PROFESSIONAL', 'SIM'].includes(String(a).toUpperCase()) ? 'text-beet-accent' : ['NO', 'NÃO'].includes(String(a).toUpperCase()) ? 'text-red-400' : 'text-beet-blue'}`}>
                                            {QUESTION_VALUE_LABELS[String(a).toUpperCase()] || String(a)}
                                        </span>
                                    </div>
                                ))}
                                {!artist.professionalQuestions && (
                                    <div className="col-span-full py-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-xs text-beet-muted font-bold uppercase tracking-widest">Aguardando preenchimento do artista</p>
                                        <p className="text-[10px] text-beet-muted/50 mt-1">Este artista ainda não completou seu perfil profissional.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Provas Sociais */}
                        <div className="beet-card p-6">
                            <p className="section-title mb-6 flex items-center gap-2">🏅 Provas Sociais & Credibilidade</p>

                            <div className="space-y-8">
                                {[
                                    { label: 'Colaborações', items: artist.socialProofs?.collaboratedArtists, icon: '🤝' },
                                    { label: 'Palcos & Venues', items: artist.socialProofs?.venuesPlayed, icon: '🏟️' },
                                    { label: 'Festivais', items: artist.socialProofs?.festivals, icon: '🎡' },
                                    { label: 'Marcas Parceiras', items: artist.socialProofs?.partnerBrands, icon: '💎' }
                                ].filter(sec => sec.items && sec.items.length > 0).map(section => (
                                    <div key={section.label}>
                                        <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                                            {section.icon} {section.label}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {section.items?.map(item => (
                                                <span key={item} className="text-[10px] bg-beet-dark border border-white/5 px-3 py-1.5 rounded-lg text-white font-medium hover:border-beet-accent/30 transition-colors">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {artist.socialProofs?.testimonials && artist.socialProofs.testimonials.length > 0 && (
                                    <div className="pt-4">
                                        <p className="text-[10px] text-beet-muted uppercase font-black tracking-widest mb-4">💬 Depoimentos</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {artist.socialProofs.testimonials.map((t, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border-l border-beet-accent relative italic">
                                                    <p className="text-sm text-beet-gray leading-relaxed">"{t.text}"</p>
                                                    <p className="text-[10px] text-beet-accent font-black uppercase mt-3">— {t.author}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(!artist.socialProofs || Object.values(artist.socialProofs).every(v => !v || (Array.isArray(v) && v.length === 0))) && (
                                    <div className="py-4 text-center">
                                        <p className="text-xs text-beet-muted italic">Nenhuma prova social adicionada ainda.</p>
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
            </div>

            {/* Modal de Edição (Geral) */}
            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

            {/* Inputs de Upload Ocultos */}
            {isSelf && (
                <div className="hidden">
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                    <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                </div>
            )}
        </div>
    );
}
