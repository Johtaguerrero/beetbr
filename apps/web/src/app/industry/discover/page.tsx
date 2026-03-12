'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ArtistProfile } from '@/lib/store';
import { Avatar, ScoreBeetBadge, EmptyState, SectionTitle } from '@/components/ui';
import { api } from '@/lib/api';
import {
    Search, Filter, MapPin, Star, Users, Briefcase,
    LayoutGrid, List, FileText, CheckCircle2,
    ArrowUpRight, Music2, TrendingUp, Info
} from 'lucide-react';
import Link from 'next/link';

const GENRES = ['Trap', 'Rap', 'Funk', 'Pop', 'R&B', 'Gospel', 'Rock', 'MPB', 'Samba', 'Pagode', 'Eletrônica', 'Afrobeat', 'Drill', 'Boom bap'];
const STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS', 'PR', 'PE', 'GO', 'DF', 'SC', 'ES', 'AM'];

function ArtistCard({ artist, viewMode }: { artist: ArtistProfile; viewMode: 'grid' | 'list' }) {
    const { toggleShortlist, isInShortlist, addToast } = useStore();
    const inShortlist = isInShortlist(artist.id);

    const handleShortlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleShortlist(artist.id);
        addToast({
            message: inShortlist ? `${artist.stageName} removido da shortlist` : `${artist.stageName} salvo na shortlist! ⭐`,
            type: inShortlist ? 'info' : 'success',
        });
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="beet-card p-4 hover:border-beet-blue/30 transition-all group"
            >
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="lg" emoji="🎤" />
                        <div className="absolute -bottom-1 -right-1">
                            <ScoreBeetBadge score={artist.scoreBeet} size="sm" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-black text-white truncate">{artist.stageName}</h3>
                            {artist.availableForBooking && (
                                <span className="h-1.5 w-1.5 rounded-full bg-beet-accent animate-pulse" />
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-beet-muted font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {artist.city}, {artist.state}</span>
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                            <span className="text-beet-blue">{artist.genres[0]}</span>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1 px-6 border-l border-white/5">
                        <p className="text-[10px] text-beet-muted font-black uppercase tracking-widest">Plays Totais</p>
                        <p className="text-sm font-display font-black text-white">{(artist.playsTotal / 1000).toFixed(0)}K</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShortlist}
                            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${inShortlist ? 'bg-beet-blue text-white' : 'bg-white/5 text-beet-muted hover:bg-white/10'
                                }`}
                        >
                            <Star size={18} fill={inShortlist ? "currentColor" : "none"} />
                        </button>
                        <Link
                            href={`/artist/profile/${artist.id}`}
                            className="px-6 py-2.5 bg-beet-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Ver Perfil
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="beet-card overflow-hidden group hover:border-beet-blue/40 transition-all flex flex-col"
        >
            <div className="relative h-32 overflow-hidden bg-beet-dark">
                {artist.coverUrl ? (
                    <img src={api.getMediaUrl(artist.coverUrl)} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" alt={artist.stageName} />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-beet-black via-transparent to-transparent opacity-80" />

                <button
                    onClick={handleShortlist}
                    className={`absolute top-3 right-3 h-9 w-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all shadow-lg ${inShortlist ? 'bg-beet-blue text-white' : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                >
                    <Star size={16} fill={inShortlist ? "currentColor" : "none"} />
                </button>

                <div className="absolute -bottom-6 left-4">
                    <div className="relative">
                        <Avatar name={artist.stageName} imageUrl={artist.avatarUrl} size="md" emoji="🎤" className="border-4 border-beet-black shadow-xl" />
                        <div className="absolute -bottom-1 -right-1">
                            <ScoreBeetBadge score={artist.scoreBeet} size="sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 px-4 pb-4 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-display font-black text-white text-base leading-tight truncate">{artist.stageName}</h3>
                    <p className="text-[10px] text-beet-muted font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                        <MapPin size={10} className="text-beet-blue" />
                        {artist.city}, {artist.state}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                    {artist.genres.slice(0, 2).map(g => (
                        <span key={g} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-beet-gray uppercase tracking-wider">
                            {g}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-white/5">
                    <div>
                        <p className="text-[8px] text-beet-muted font-black uppercase tracking-widest mb-0.5">Plays</p>
                        <p className="text-xs font-display font-black text-white">{(artist.playsTotal / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-beet-muted font-black uppercase tracking-widest mb-0.5">Status</p>
                        <div className="flex items-center gap-1">
                            {artist.availableForBooking ? (
                                <span className="text-[9px] font-black text-beet-accent uppercase tracking-tighter">Reservável</span>
                            ) : (
                                <span className="text-[9px] font-black text-beet-muted uppercase tracking-tighter">Ocupado</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex gap-2">
                    <Link
                        href={`/artist/profile/${artist.id}`}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all"
                    >
                        Perfil
                    </Link>
                    <Link
                        href={`/industry/proposals/new?artistId=${artist.id}`}
                        className="flex-1 px-4 py-2 bg-beet-blue text-white text-[9px] font-black uppercase tracking-widest text-center rounded-xl shadow-lg shadow-beet-blue/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        Proposta
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function Discover() {
    useAuthGuard('INDUSTRY');
    const { artists } = useStore();

    // Filters
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedState, setSelectedState] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);
    const [hasPortfolio, setHasPortfolio] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    const filteredArtists = useMemo(() => {
        return artists.filter(a => {
            const matchesSearch = !search || a.stageName.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
            const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(g => a.genres.includes(g));
            const matchesState = !selectedState || a.state === selectedState;
            const matchesScore = a.scoreBeet >= minScore;
            const matchesAvail = !isAvailable || a.availableForBooking;
            const matchesPortfolio = !hasPortfolio || a.portfolioPdfUrl;
            // For now, isPremium is a mock field
            return matchesSearch && matchesGenre && matchesState && matchesScore && matchesAvail && matchesPortfolio;
        });
    }, [artists, search, selectedGenres, selectedState, minScore, isAvailable, hasPortfolio]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
    };

    return (
        <div className="flex h-screen bg-beet-black overflow-hidden">
            {/* Professional Sidebar Filters */}
            <aside className="hidden lg:flex flex-col w-72 bg-beet-card border-r border-white/5 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-beet-blue flex items-center gap-2">
                        <Filter size={14} /> Filtros Avançados
                    </h2>
                    {(search || selectedGenres.length > 0 || selectedState || minScore > 0 || isAvailable || hasPortfolio) && (
                        <button
                            onClick={() => {
                                setSearch(''); setSelectedGenres([]); setSelectedState(''); setMinScore(0); setIsAvailable(false); setHasPortfolio(false);
                            }}
                            className="text-[9px] font-black uppercase text-beet-muted hover:text-white transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {/* Search */}
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">Pesquisa Direta</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beet-muted" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nome, cidade ou tag..."
                                className="w-full bg-beet-dark/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-beet-blue outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Genres */}
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">Nicho Musical</label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(g => (
                                <button
                                    key={g}
                                    onClick={() => toggleGenre(g)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter border transition-all ${selectedGenres.includes(g)
                                            ? 'bg-beet-blue border-beet-blue text-white shadow-lg shadow-beet-blue/20'
                                            : 'bg-white/5 border-white/5 text-beet-muted hover:border-white/10'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">Localização (UF)</label>
                        <div className="flex flex-wrap gap-2">
                            {STATES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedState(selectedState === s ? '' : s)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${selectedState === s
                                            ? 'bg-beet-blue border-beet-blue text-white shadow-lg shadow-beet-blue/20'
                                            : 'bg-white/5 border-white/5 text-beet-muted hover:border-white/10'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Beeat Score */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Beeat Score Mínimo</label>
                            <span className="text-xs font-black text-beet-blue">{minScore}+</span>
                        </div>
                        <input
                            type="range" min="0" max="95" step="5" value={minScore}
                            onChange={(e) => setMinScore(Number(e.target.value))}
                            className="w-full h-1 bg-beet-dark rounded-lg appearance-none cursor-pointer accent-beet-blue"
                        />
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 pt-2">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-white group-hover:text-beet-blue transition-colors">Disponível para Contrato</p>
                                <p className="text-[9px] text-beet-muted uppercase tracking-tighter">Status de agenda aberto</p>
                            </div>
                            <button
                                onClick={() => setIsAvailable(!isAvailable)}
                                className={`h-6 w-11 rounded-full transition-all relative ${isAvailable ? 'bg-beet-blue' : 'bg-white/10'}`}
                            >
                                <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isAvailable ? 'left-6' : 'left-1'}`} />
                            </button>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-white group-hover:text-beet-blue transition-colors">Portfólio em PDF</p>
                                <p className="text-[9px] text-beet-muted uppercase tracking-tighter">Possui material profissional</p>
                            </div>
                            <button
                                onClick={() => setHasPortfolio(!hasPortfolio)}
                                className={`h-6 w-11 rounded-full transition-all relative ${hasPortfolio ? 'bg-beet-blue' : 'bg-white/10'}`}
                            >
                                <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${hasPortfolio ? 'left-6' : 'left-1'}`} />
                            </button>
                        </label>
                    </div>
                </div>

                <div className="mt-auto p-6 bg-beet-blue/5 border-t border-white/5">
                    <div className="flex items-center gap-3 text-beet-blue">
                        <TrendingUp size={18} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Dica AI</p>
                            <p className="text-[11px] text-beet-muted leading-tight mt-0.5">Artistas com Score {'>'} 75 têm 3x mais engajamento.</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Discovery Area */}
            <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 flex flex-col">
                {/* Header Context Bar */}
                <div className="sticky top-16 lg:top-0 z-20 bg-beet-black/80 backdrop-blur-xl border-b border-white/5">
                    <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2 w-2 rounded-full bg-beet-blue shadow-[0_0_8px_rgba(0,132,255,0.6)]" />
                                <span className="text-[10px] font-black text-beet-blue uppercase tracking-[0.2em]">Beeat Scouting Hub</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tighter uppercase italic">
                                Descobrir <span className="text-beet-blue">Talentos</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-beet-blue text-white shadow-lg shadow-beet-blue/20' : 'text-beet-muted hover:text-white'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-beet-blue text-white shadow-lg shadow-beet-blue/20' : 'text-beet-muted hover:text-white'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                            <div className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl hidden md:block">
                                <p className="text-[10px] font-black text-beet-muted uppercase tracking-widest">
                                    <span className="text-white">{filteredArtists.length}</span> resultados
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="p-6">
                    {filteredArtists.length === 0 ? (
                        <div className="mt-12">
                            <EmptyState
                                icon="🔭"
                                title="Nenhum artista encontrado"
                                description="Não encontramos talentos com estes filtros específicos. Tente expandir sua busca."
                            />
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className={viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "space-y-4 max-w-5xl mx-auto"
                            }
                        >
                            <AnimatePresence>
                                {filteredArtists.map((artist) => (
                                    <ArtistCard key={artist.id} artist={artist} viewMode={viewMode} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
