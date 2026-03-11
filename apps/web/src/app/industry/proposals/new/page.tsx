'use client';
import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ProposalType } from '@/lib/store';
import { Avatar, Spinner, ScoreBeetBadge } from '@/components/ui';
import {
    ChevronLeft, Send, Calendar, Clock, MapPin,
    Globe, ShieldCheck, Info, Briefcase,
    CheckCircle2, Search, X
} from 'lucide-react';

const TYPE_OPTIONS = [
    { value: 'LIVE_SHOW', label: '🎤 Show ao vivo', desc: 'Apresentação em evento ou casa de shows' },
    { value: 'RECORDING', label: '🎙 Gravação', desc: 'Faixa ou álbum em estúdio' },
    { value: 'FEAT', label: '🤝 Colaboração', desc: 'Participação em música/projeto' },
    { value: 'MUSIC_VIDEO', label: '🎬 Videoclipe', desc: 'Gravação de conteúdo visual' },
    { value: 'EVENT', label: '🎉 Presença VIP', desc: 'Participação em evento de marca' },
    { value: 'OTHER', label: '📌 Personalizado', desc: 'Proposta sob medida' },
];

function NewProposalContent() {
    useAuthGuard('INDUSTRY');
    const params = useSearchParams();
    const { artists, createProposal, industryProfile, currentUser, addToast } = useStore();
    const router = useRouter();

    const preArtistId = params.get('artistId') || '';

    const [type, setType] = useState<ProposalType>('LIVE_SHOW');
    const [artistId, setArtistId] = useState(preArtistId);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [online, setOnline] = useState(false);
    const [terms, setTerms] = useState('');
    const [durationHours, setDurationHours] = useState('');
    const [deadlineDays, setDeadlineDays] = useState('7');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedArtist = useMemo(() => artists.find((a) => a.id === artistId), [artists, artistId]);

    const filteredArtists = useMemo(() => {
        if (!searchQuery) return artists.slice(0, 5);
        return artists.filter(a =>
            a.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 8);
    }, [artists, searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artistId || !amount) {
            addToast('Preencha os campos obrigatórios', 'error');
            return;
        }

        setSending(true);
        try {
            await new Promise((r) => setTimeout(r, 1200));

            const proposalId = createProposal({
                industryId: industryProfile?.id || 'industry-demo',
                industryName: industryProfile?.companyName || 'Minha Empresa',
                artistId,
                artistName: selectedArtist?.stageName || 'Artista',
                artistScore: selectedArtist?.scoreBeet || 0,
                type,
                amount: parseFloat(amount),
                date: date || undefined,
                location: location || undefined,
                online,
                terms: terms || undefined,
                durationHours: durationHours ? parseFloat(durationHours) : undefined,
                responseDeadline: new Date(Date.now() + parseInt(deadlineDays) * 24 * 3600000).toISOString(),
                status: 'SENT',
            });

            addToast('Proposta enviada com sucesso!', 'success');
            router.push(`/deals/${proposalId}`);
        } catch (err) {
            addToast('Erro ao enviar proposta', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-beet-black pb-24 lg:pb-12">
            <div className="max-w-4xl mx-auto px-6 pt-8">

                {/* Back & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-beet-muted hover:bg-white/10 hover:text-white transition-all shadow-lg"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Send size={12} className="text-beet-blue" />
                            <span className="text-[10px] font-black text-beet-blue uppercase tracking-[0.2em]">Iniciador de Negócio</span>
                        </div>
                        <h1 className="text-2xl font-display font-black text-white tracking-tight">NOVA PROPOSTA PROFISSIONAL</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Form Area */}
                    <div className="lg:col-span-12">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* 1. Artist Selection */}
                            <div className="beet-card overflow-hidden">
                                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-beet-blue" />
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Passo 1: Seleção de Talento</h3>
                                </div>
                                <div className="p-6">
                                    {selectedArtist ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-2xl bg-beet-blue/5 border border-beet-blue/20 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar name={selectedArtist.stageName} imageUrl={selectedArtist.avatarUrl} size="lg" emoji="🎤" />
                                                <div>
                                                    <p className="font-bold text-white text-lg">{selectedArtist.stageName}</p>
                                                    <p className="text-xs text-beet-muted mt-0.5">{selectedArtist.genres.join(' · ')}</p>
                                                    <div className="mt-2">
                                                        <ScoreBeetBadge score={selectedArtist.scoreBeet} size="sm" showLabel />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setArtistId('')}
                                                className="text-[10px] font-black text-beet-muted uppercase hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <X size={12} /> Alterar
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar artista por nome ou gênero..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-beet-blue focus:bg-white/[0.08] transition-all outline-none"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {filteredArtists.map(a => (
                                                    <button
                                                        type="button"
                                                        key={a.id}
                                                        onClick={() => setArtistId(a.id)}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-beet-blue/30 transition-all text-left group"
                                                    >
                                                        <Avatar name={a.stageName} imageUrl={a.avatarUrl} size="sm" emoji="🎤" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-white text-sm group-hover:text-beet-blue transition-colors">{a.stageName}</p>
                                                            <p className="text-[10px] text-beet-muted truncate">{a.genres[0]} · {a.city}</p>
                                                        </div>
                                                        <ScoreBeetBadge score={a.scoreBeet} size="sm" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Proposal Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Type Selection */}
                                <div className="beet-card overflow-hidden">
                                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-beet-blue" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Passo 2: Categoria</h3>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {TYPE_OPTIONS.map((opt) => (
                                            <button
                                                type="button"
                                                key={opt.value}
                                                onClick={() => setType(opt.value as ProposalType)}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all group ${type === opt.value
                                                        ? 'bg-beet-blue/10 border-beet-blue shadow-lg shadow-beet-blue/10'
                                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <p className={`font-bold text-sm ${type === opt.value ? 'text-beet-blue' : 'text-white'}`}>{opt.label}</p>
                                                <p className="text-[10px] text-beet-muted mt-1 group-hover:text-beet-gray transition-colors">{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Logistics & Values */}
                                <div className="space-y-6">
                                    <div className="beet-card overflow-hidden">
                                        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-beet-blue" />
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Passo 3: Logística e Valor</h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <DollarSign size={10} /> Valor Proposto (BRL)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        placeholder="25.000,00"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:border-beet-blue transition-all outline-none"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Calendar size={10} /> Data do Encontro
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-beet-blue transition-all"
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Clock size={10} /> Duração (Horas)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="2"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-beet-blue transition-all"
                                                        value={durationHours}
                                                        onChange={(e) => setDurationHours(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-xs font-bold text-white flex items-center gap-2"><Globe size={12} /> Trabalho Remoto / Online</p>
                                                        <p className="text-[10px] text-beet-muted mt-1">Sessões em estúdio remoto ou shows live stream.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOnline(!online)}
                                                        className={`h-6 w-11 rounded-full transition-all relative ${online ? 'bg-beet-blue' : 'bg-white/10'}`}
                                                    >
                                                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-all ${online ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                {!online && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <MapPin size={10} /> Localização Presencial
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Arena BRB, Brasília"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-beet-blue transition-all"
                                                            value={location}
                                                            onChange={(e) => setLocation(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="beet-card p-6 bg-beet-blue/5 border-beet-blue/20">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-beet-blue/10 flex items-center justify-center text-beet-blue shrink-0">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase tracking-widest">Proteção BeeatBR</p>
                                                <p className="text-[10px] text-beet-gray mt-1 leading-relaxed">
                                                    Este valor ficará protegido pelo sistema de Escrow até a finalização do serviço. Taxa de plataforma: 5%.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Detailed Terms */}
                            <div className="beet-card overflow-hidden">
                                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-beet-blue" />
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Passo 4: Termos e Condições Detalhados</h3>
                                </div>
                                <div className="p-6">
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-beet-blue focus:bg-white/[0.08] transition-all resize-none min-h-[160px]"
                                        placeholder="Descreva detalhadamente o escopo do serviço, o que está incluso no cachet (hospedagem, transporte, mixagem?), exigências técnicas e obrigações da marca/contratante..."
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                    />

                                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] font-black text-beet-muted uppercase tracking-widest">Validade da Proposta:</label>
                                            <select
                                                className="bg-white/10 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white outline-none focus:border-beet-blue transition-all"
                                                value={deadlineDays}
                                                onChange={(e) => setDeadlineDays(e.target.value)}
                                            >
                                                <option value="3">3 dias</option>
                                                <option value="7">7 dias (Recomendado)</option>
                                                <option value="14">14 dias</option>
                                                <option value="30">30 dias</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending || !artistId || !amount}
                                            className="w-full md:w-auto bg-beet-blue text-white px-12 py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-beet-blue/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                        >
                                            {sending ? <><Spinner size="sm" /> Processando...</> : <><Send size={16} /> Enviar Proposta Oficial</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function NewProposal() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-beet-black"><Spinner /></div>}>
            <NewProposalContent />
        </Suspense>
    );
}
