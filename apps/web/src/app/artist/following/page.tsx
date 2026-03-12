'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Search, Loader2, Music2, Users, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

export default function FollowingPage() {
    const { followingProfiles, fetchFollowingDetailed, isAuthenticated } = useStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchFollowingDetailed().finally(() => setLoading(false));
        }
    }, [isAuthenticated, fetchFollowingDetailed]);

    const filtered = (followingProfiles || []).filter(p => 
        p.stageName.toLowerCase().includes(search.toLowerCase()) ||
        p.genres.some(g => g.toLowerCase().includes(search.toLowerCase()))
    );

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Users size={48} className="text-beet-muted opacity-20" />
                <h2 className="text-xl font-bold">Faça login para ver quem você segue</h2>
                <Link href="/auth" className="bg-beet-accent text-black px-6 py-2 rounded-full font-bold">Entrar</Link>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-beet-accent mb-2">
                        <ArrowLeft size={16} />
                        <Link href="/artist/feed" className="text-xs uppercase font-bold tracking-widest hover:underline">Volar para Feed</Link>
                    </div>
                    <h1 className="text-4xl font-black text-white italic">CONEXÕES<span className="text-beet-accent">.</span></h1>
                    <p className="text-beet-muted text-sm mt-1">Artistas e profissionais que você acompanha.</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted group-focus-within:text-beet-accent transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou gênero..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-beet-dark/60 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-beet-accent/50 focus:outline-none transition-all outline-none"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-beet-accent" size={32} />
                    <span className="text-beet-muted font-mono text-xs uppercase tracking-widest">Carregando Conexões...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                    <Users size={48} className="text-beet-muted opacity-10" />
                    <p className="text-beet-muted font-medium">{search ? 'Nenhum artista encontrado para esta busca.' : 'Você ainda não segue ninguém.'}</p>
                    {search ? (
                        <button onClick={() => setSearch('')} className="text-beet-accent text-sm hover:underline font-bold">Limpar busca</button>
                    ) : (
                        <Link href="/artist/rankings" className="text-beet-accent text-sm hover:underline font-bold">Explorar talentos</Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((profile, idx) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-beet-dark/40 border border-white/5 rounded-3xl overflow-hidden hover:border-beet-accent/20 transition-all flex flex-col"
                            >
                                <Link href={`/artist/profile/${profile.id}`} className="relative h-32 overflow-hidden">
                                    <img 
                                        src={profile.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1470&auto=format&fit=crop'} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-beet-dark via-beet-dark/50 to-transparent" />
                                    
                                    <div className="absolute -bottom-6 left-6">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-beet-dark shadow-2xl">
                                            <img 
                                                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?q=80&w=1374&auto=format&fit=crop'} 
                                                alt={profile.stageName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-6 pt-10 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-beet-accent transition-colors truncate">
                                            {profile.stageName}
                                        </h3>
                                        <div className="flex items-center gap-1 bg-beet-accent/10 border border-beet-accent/20 px-2 py-0.5 rounded-full">
                                            <span className="text-[10px] font-black text-beet-accent">{profile.scoreBeet}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {profile.genres.slice(0, 2).map(genre => (
                                            <span key={genre} className="bg-white/5 text-beet-muted text-[10px] uppercase font-bold tracking-tighter px-2 py-0.5 rounded-md">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <Link 
                                            href={`/artist/profile/${profile.id}`}
                                            className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl text-center transition-all border border-white/5"
                                        >
                                            Ver Perfil
                                        </Link>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.href = `/collabs/new?targetArtistId=${profile.id}`;
                                            }}
                                            className="bg-beet-accent hover:bg-beet-accent/80 text-black text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                                        >
                                            <MessageSquarePlus size={14} />
                                            Colab
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
