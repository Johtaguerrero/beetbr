'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    Heart,
    Share2,
    MessageSquare,
    Globe,
    Calendar,
    Zap,
    Shield,
    Flag,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useStore, COLLAB_TYPE_CONFIG, CollabPost, CollabInterest } from '@/lib/store';
import { ScoreBeetBadge, Avatar } from '@/components/ui';
import Link from 'next/link';

export default function CollabDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { collabPosts, currentUser, expressInterest, collabInterests, fetchCollabPostById, savedCollabs, toggleSaveCollab, addToast } = useStore();
    const [loading, setLoading] = React.useState(!collabPosts.find((p: CollabPost) => p.id === params.id));

    const collab = collabPosts.find((p: CollabPost) => p.id === params.id);

    React.useEffect(() => {
        if (!collab && params.id) {
            setLoading(true);
            fetchCollabPostById(params.id as string).finally(() => setLoading(false));
        }
    }, [params.id, collab, fetchCollabPostById]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-beet-green border-t-transparent" />
            </div>
        );
    }

    if (!collab) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h2 className="text-2xl font-bold mb-4">Anúncio não encontrado</h2>
                <button onClick={() => router.back()} className="text-beet-green flex items-center gap-2">
                    <ArrowLeft size={18} /> Voltar
                </button>
            </div>
        );
    }

    const config = COLLAB_TYPE_CONFIG[collab.type];
    const isAuthor = currentUser?.id === collab.authorId;
    const hasExpressedInterest = (collabInterests || []).some((i: CollabInterest) => i.collabPostId === collab.id && i.interestedUserId === currentUser?.id);

    return (
        <div className="min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {collab.coverUrl ? (
                    <img src={collab.coverUrl} alt={collab.title} className="w-full h-full object-cover" />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{
                            background: `linear-gradient(135deg, ${config.color} 0%, #111 100%)`,
                            opacity: 0.8
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-20" style={{ background: 'var(--color-glass-btn)' }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="absolute bottom-8 left-6 right-6 z-20">
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-3"
                        style={{ backgroundColor: `${config.color}30`, color: config.color, border: `1px solid ${config.color}50` }}
                    >
                        {config.icon} {config.label}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black font-outfit leading-tight max-w-3xl">
                        {collab.title}
                    </h1>
                </div>
            </div>

            <div className="px-6 max-w-6xl mx-auto -mt-6 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Meta Items */}
                        <div className="flex flex-wrap gap-4 md:gap-8 pb-8 border-b border-white/10">
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <MapPin size={18} className="text-beet-green" />
                                <span>{collab.city || 'São Paulo'}, {collab.state || 'SP'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <Globe size={18} className="text-beet-green" />
                                <span className="capitalize">{collab.remote ? 'Remoto' : 'Presencial'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <Calendar size={18} className="text-beet-green" />
                                <span>
                                    {collab.deadline && !isNaN(new Date(collab.deadline).getTime()) 
                                        ? `Expira em: ${new Date(collab.deadline).toLocaleDateString('pt-BR')}` 
                                        : 'Sem prazo definido'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold font-outfit uppercase tracking-wider text-beet-green">Descrição</h2>
                            <p className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap">
                                {collab.description}
                            </p>
                        </div>

                        {/* Genres */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold font-outfit uppercase tracking-wider text-beet-green">Gêneros</h2>
                            <div className="flex flex-wrap gap-2">
                                {collab.genres.map((genre: string) => (
                                    <span key={genre} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium">
                                        #{genre}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Author Section Card */}
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <Avatar name={collab.authorName} size="lg" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold">{collab.authorName}</h3>
                                        {collab.authorVerified && <CheckCircle2 size={16} className="text-blue-400" />}
                                        <ScoreBeetBadge score={collab.authorScore || 0} />
                                    </div>
                                    <p className="text-white/40 text-sm">Autor do anúncio</p>
                                </div>
                            </div>
                            <Link
                                href={`/artist/profile/${collab.authorId}`}
                                className="p-3 bg-white/5 rounded-full hover:bg-beet-green hover:text-black transition-all"
                            >
                                <ChevronRight size={24} />
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-28">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col">
                                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Postado em</span>
                                    <span className="text-white/80 text-sm font-medium">{new Date(collab.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-beet-dark/50 px-3 py-1.5 rounded-full border border-white/10">
                                    <Users size={14} className="text-beet-green" />
                                    <span className="text-xs font-bold">{collab.interestCount}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isAuthor ? (
                                    <Link
                                        href="/collabs"
                                        className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-tight flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Gerenciar Anúncio
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => expressInterest(collab.id, 'Tenho interesse em colaborar!')}
                                        disabled={hasExpressedInterest}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all ${hasExpressedInterest
                                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                            : 'bg-beet-green text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.3)]'
                                            }`}
                                    >
                                        {hasExpressedInterest ? (
                                            <>Interesse Enviado <CheckCircle2 size={20} /></>
                                        ) : (
                                            <>Tenho Interesse <Zap size={20} /></>
                                        )}
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => toggleSaveCollab(collab.id)}
                                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                                    >
                                        <Heart 
                                            size={18} 
                                            className={savedCollabs?.includes(collab.id) ? "text-beet-red fill-beet-red" : "text-white/40"} 
                                        /> 
                                        {savedCollabs?.includes(collab.id) ? 'Salvo' : 'Salvar'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: collab.title,
                                                    text: collab.description,
                                                    url: window.location.href
                                                }).catch(() => {});
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                addToast({ message: 'Link copiado!', type: 'success' });
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                                    >
                                        <Share2 size={18} className="text-white/40" /> Partilhar
                                    </button>
                                </div>
                                
                                {!isAuthor && (
                                    <button
                                        onClick={() => {
                                            // Redireciona para o chat ou abre o fluxo de interesse
                                            if (!hasExpressedInterest) {
                                                expressInterest(collab.id, 'Olá! Gostaria de conversar sobre sua collab: ' + collab.title);
                                            } else {
                                                router.push('/artist/deals'); // Fallback para lista de propostas
                                            }
                                        }}
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                    >
                                        <MessageSquare size={18} className="text-beet-green" /> Contato via Chat
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 p-4 bg-beet-dark/50 border border-white/5 rounded-xl space-y-4">
                                <div className="flex gap-3">
                                    <Shield size={20} className="text-beet-green flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-white">Negócio Seguro</h4>
                                        <p className="text-[10px] text-white/40 leading-relaxed">
                                            Sempre negocie pelo chat oficial do BEETBR para sua segurança e portfólio.
                                        </p>
                                    </div>
                                </div>
                                <button className="w-full text-[10px] text-white/20 uppercase font-black hover:text-beet-red transition-all flex items-center justify-center gap-1.5">
                                    <Flag size={12} /> Denunciar Anúncio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
