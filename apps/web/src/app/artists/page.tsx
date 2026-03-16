'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type ArtistProfile } from '@/lib/store';
import { 
    EmptyState, 
    Spinner, 
    Avatar, 
    ScoreBeetBadge 
} from '@/components/ui';
import { ArtistShowcaseCard } from '@/components/artist/ArtistShowcaseCard';
import { 
    Search, 
    Filter, 
    MapPin, 
    TrendingUp, 
    Star, 
    Users, 
    LayoutGrid, 
    List, 
    Music, 
    ChevronDown, 
    X,
    Briefcase,
    FileText,
    Globe,
    CheckCircle2,
    ArrowUpDown
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';

const GENRES = ['Trap', 'Rap', 'Funk', 'Pop', 'R&B', 'Gospel', 'Rock', 'MPB', 'Samba', 'Pagode', 'Eletrônica', 'Afrobeat', 'Drill', 'Boom bap'];
const STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS', 'PR', 'PE', 'GO', 'DF', 'SC', 'ES', 'AM'];
const PROF_EXPERIENCE = [
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
    { value: 'PROFESSIONAL', label: 'Profissional' }
];

export default function AllArtistsPage() {
    const { artists, fetchArtists } = useStore();
    const [isLoadingArtists, setIsLoadingArtists] = useState(true);
    
    // View state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

    // Filter States
    const [search, setSearch] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [subGenreSearch, setSubGenreSearch] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [sortBy, setSortBy] = useState<'relevance' | 'score' | 'followers' | 'engagement'>('relevance');
    
    // Switch Filters
    const [isPremium, setIsPremium] = useState(false);
    const [availableForHire, setAvailableForHire] = useState(false);
    const [openForCollab, setOpenForCollab] = useState(false);
    const [hasPortfolio, setHasPortfolio] = useState(false);
    const [hasMusicPlatforms, setHasMusicPlatforms] = useState(false);
    const [travelAvailability, setTravelAvailability] = useState(false);
    const [issueInvoice, setIssueInvoice] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState('');

    useEffect(() => {
        const load = async () => {
            setIsLoadingArtists(true);
            await fetchArtists();
            setIsLoadingArtists(false);
        };
        load();
    }, []);

    const filteredArtists = useMemo(() => {
        let result = [...artists];

        // Search
        if (search) {
            const lowSearch = search.toLowerCase();
            result = result.filter(a => 
                a.stageName.toLowerCase().includes(lowSearch) || 
                a.city.toLowerCase().includes(lowSearch) ||
                a.genres.some(g => g.toLowerCase().includes(lowSearch))
            );
        }

        // Location
        if (selectedState) result = result.filter(a => a.state === selectedState);
        if (selectedCity) result = result.filter(a => a.city.toLowerCase().includes(selectedCity.toLowerCase()));

        // Genres
        if (selectedGenres.length > 0) {
            result = result.filter(a => selectedGenres.some(g => a.genres.includes(g)));
        }

        // Subgenres
        if (subGenreSearch) {
            const lowSub = subGenreSearch.toLowerCase();
            result = result.filter(a => a.subGenres?.some(s => s.toLowerCase().includes(lowSub)));
        }

        // Score
        if (minScore > 0) result = result.filter(a => a.scoreBeet >= minScore);

        // Switches & Professional Questions
        if (isPremium) result = result.filter(a => a.verified); // Mocking premium as verified for now
        if (availableForHire) result = result.filter(a => a.professionalQuestions?.availableForHire === 'YES');
        if (openForCollab) result = result.filter(a => a.professionalQuestions?.featsAndCollabs === 'YES');
        if (hasPortfolio) result = result.filter(a => a.portfolioPdfUrl || a.professionalQuestions?.hasPdfPortfolio === 'YES');
        if (hasMusicPlatforms) result = result.filter(a => a.professionalQuestions?.digitalPlatforms === 'YES');
        if (travelAvailability) result = result.filter(a => a.professionalQuestions?.travelAvailability === 'YES');
        if (issueInvoice) result = result.filter(a => a.professionalQuestions?.invoiceIssuance === 'YES');
        if (selectedExperience) result = result.filter(a => a.professionalQuestions?.stageExperience === selectedExperience);

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'score') return b.scoreBeet - a.scoreBeet;
            if (sortBy === 'followers') return (b.followerCountTotal || 0) - (a.followerCountTotal || 0);
            if (sortBy === 'engagement') return (b.metrics?.engagement || 0) - (a.metrics?.engagement || 0);
            // Default: relevance (Score * Engagement factor)
            return (b.scoreBeet * (b.metrics?.engagement || 1)) - (a.scoreBeet * (a.metrics?.engagement || 1));
        });

        return result;
    }, [
        artists, search, selectedGenres, selectedState, selectedCity, minScore, 
        isPremium, availableForHire, openForCollab, hasPortfolio, 
        hasMusicPlatforms, travelAvailability, issueInvoice, selectedExperience, sortBy
    ]);

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev => 
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedGenres([]);
        setSubGenreSearch('');
        setSelectedState('');
        setSelectedCity('');
        setMinScore(0);
        setIsPremium(false);
        setAvailableForHire(false);
        setOpenForCollab(false);
        setHasPortfolio(false);
        setHasMusicPlatforms(false);
        setTravelAvailability(false);
        setIssueInvoice(false);
        setSelectedExperience('');
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedGenres.length > 0) count++;
        if (subGenreSearch) count++;
        if (selectedState) count++;
        if (selectedCity) count++;
        if (minScore > 0) count++;
        if (isPremium) count++;
        if (availableForHire) count++;
        if (openForCollab) count++;
        if (hasPortfolio) count++;
        if (hasMusicPlatforms) count++;
        if (travelAvailability) count++;
        if (issueInvoice) count++;
        if (selectedExperience) count++;
        return count;
    }, [
        selectedGenres, selectedState, selectedCity, minScore, isPremium, 
        availableForHire, openForCollab, hasPortfolio, hasMusicPlatforms, 
        travelAvailability, issueInvoice, selectedExperience
    ]);

    return (
        <AppShell>
            <div className="flex h-[calc(100vh-64px)] lg:h-screen bg-beet-black overflow-hidden relative">
                
                {/* ── Sidebar Filters ────────────────────────────────────── */}
                <aside 
                    className={`
                        fixed inset-y-0 left-0 z-40 w-80 bg-beet-card border-r border-white/5 
                        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                        ${isFilterSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        overflow-y-auto custom-scrollbar flex flex-col
                    `}
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-beet-card z-10">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-beet-accent" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Filtros</h2>
                        </div>
                        {activeFilterCount > 0 && (
                            <button 
                                onClick={clearFilters}
                                className="text-[10px] font-black uppercase text-beet-accent hover:underline"
                            >
                                Limpar ({activeFilterCount})
                            </button>
                        )}
                        <button 
                            onClick={() => setIsFilterSidebarOpen(false)}
                            className="lg:hidden p-2 text-beet-muted"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8 flex-1">
                        {/* Search */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Busca Direta</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beet-muted" size={14} />
                                <input 
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Nome, cidade ou nicho..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-beet-accent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Gêneros Musicais</label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(g => (
                                    <button 
                                        key={g}
                                        onClick={() => toggleGenre(g)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                            selectedGenres.includes(g) 
                                            ? 'bg-beet-accent border-beet-accent text-black shadow-lg shadow-beet-accent/20' 
                                            : 'bg-white/5 border-white/5 text-beet-muted hover:border-white/10'
                                        }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subgenres */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Subgêneros / Tags</label>
                            <div className="relative">
                                <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-beet-muted" size={14} />
                                <input 
                                    type="text"
                                    value={subGenreSearch}
                                    onChange={(e) => setSubGenreSearch(e.target.value)}
                                    placeholder="Ex: Lo-fi, Synthwave..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-beet-accent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Estado (UF)</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATES.map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setSelectedState(selectedState === s ? '' : s)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                                                selectedState === s 
                                                ? 'bg-beet-accent border-beet-accent text-black' 
                                                : 'bg-white/5 border-white/5 text-beet-muted hover:border-white/10'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Cidade</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-beet-muted" size={14} />
                                    <input 
                                        type="text"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        placeholder="Ex: São Paulo"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-beet-accent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Beeat Score */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Score Beeat Mínimo</label>
                                <span className="text-xs font-black text-beet-accent">{minScore}+</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" step="5" value={minScore}
                                onChange={(e) => setMinScore(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-beet-accent"
                            />
                        </div>

                        {/* Switches */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            {[
                                { label: 'Artistas Premium', sub: 'Apenas verificados', state: isPremium, set: setIsPremium },
                                { label: 'Disponível p/ Contrato', sub: 'Contratação ativa', state: availableForHire, set: setAvailableForHire },
                                { label: 'Aberto a Collabs', sub: 'Feats e parcerias', state: openForCollab, set: setOpenForCollab },
                                { label: 'Portfólio PDF', sub: 'Possui material técnico', state: hasPortfolio, set: setHasPortfolio },
                                { label: 'Em Plataformas Digital', sub: 'Spotify, Deezer, etc.', state: hasMusicPlatforms, set: setHasMusicPlatforms },
                                { label: 'Disponível p/ Viajar', sub: 'Shows em outras cidades', state: travelAvailability, set: setTravelAvailability },
                                { label: 'Emite Nota Fiscal', sub: 'Faturamento profissional', state: issueInvoice, set: setIssueInvoice },
                            ].map((row, i) => (
                                <label key={i} className="flex items-center justify-between cursor-pointer group">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-white group-hover:text-beet-accent transition-colors">{row.label}</p>
                                        <p className="text-[9px] text-beet-muted uppercase tracking-tighter">{row.sub}</p>
                                    </div>
                                    <button 
                                        onClick={() => row.set(!row.state)}
                                        className={`h-5 w-10 rounded-full transition-all relative ${row.state ? 'bg-beet-accent' : 'bg-white/10'}`}
                                    >
                                        <div className={`h-3 w-3 bg-white rounded-full absolute top-1 transition-all ${row.state ? 'left-6 bg-black' : 'left-1'}`} />
                                    </button>
                                </label>
                            ))}
                        </div>

                        {/* Experience Select */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Experiência de Palco</label>
                            <select 
                                value={selectedExperience}
                                onChange={(e) => setSelectedExperience(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-beet-accent appearance-none capitalize"
                            >
                                <option value="">Qualquer Nível</option>
                                {PROF_EXPERIENCE.map(exp => (
                                    <option key={exp.value} value={exp.value}>{exp.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content Area ───────────────────────────────────── */}
                <main className="flex-1 flex flex-col min-w-0 bg-beet-black overflow-hidden relative">
                    
                    {/* Header Bar */}
                    <div className="p-6 md:p-10 border-b border-white/5 bg-beet-black/40 backdrop-blur-xl z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-beet-accent shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                                <span className="text-[10px] font-black text-beet-accent uppercase tracking-[0.3em]">Curadoria Beeat</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter">
                                Todos os <span className="text-beet-accent">Artistas</span>
                            </h1>
                            <p className="text-beet-muted text-sm mt-2 max-w-md">Explore a maior vitrine de talentos musicais do Brasil. Filtre por gênero, score e disponibilidade.</p>
                        </div>

                        <div className="flex items-center flex-wrap gap-4 self-end md:self-auto">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2">
                                <ArrowUpDown size={14} className="text-beet-accent" />
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="bg-transparent text-[10px] font-black uppercase text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="relevance">Mais Relevantes</option>
                                    <option value="score">Maior Score</option>
                                    <option value="followers">Mais Seguidores</option>
                                    <option value="engagement">Engajamento</option>
                                </select>
                            </div>

                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-beet-accent text-black shadow-lg shadow-beet-accent/20' : 'text-beet-muted hover:text-white'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-beet-accent text-black shadow-lg shadow-beet-accent/20' : 'text-beet-muted hover:text-white'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            <button 
                                onClick={() => setIsFilterSidebarOpen(true)}
                                className="lg:hidden p-3 bg-beet-accent text-black rounded-xl shadow-lg"
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Artists Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32">
                        {isLoadingArtists ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Spinner size="lg" />
                                <p className="text-[10px] font-black text-beet-muted uppercase tracking-widest animate-pulse">Sincronizando Talentos...</p>
                            </div>
                        ) : filteredArtists.length === 0 ? (
                            <div className="py-20">
                                <EmptyState 
                                    icon="🌌" 
                                    title="Nenhum artista encontrado"
                                    description="Tente ajustar seus filtros ou mudar os termos da busca."
                                    action={<button onClick={clearFilters} className="btn-accent px-10">LIMPAR TUDO</button>}
                                />
                            </div>
                        ) : (
                            <motion.div 
                                layout
                                className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8" 
                                    : "space-y-4 max-w-5xl mx-auto"
                                }
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredArtists.map((artist) => (
                                        <ArtistShowcaseCard key={artist.id} artist={artist} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>

                    {/* Result Count Status (Mobile) */}
                    <div className="absolute bottom-24 right-6 lg:bottom-10 lg:right-10 z-30">
                        <div className="bg-beet-accent text-black px-6 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2">
                             <Users size={16} fill="currentColor" />
                             {filteredArtists.length < artists.length ? (
                                 <span>{filteredArtists.length} FILTRADOS</span>
                             ) : (
                                 <span>{artists.length} ARTISTAS NO BRASIL</span>
                             )}
                        </div>
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
