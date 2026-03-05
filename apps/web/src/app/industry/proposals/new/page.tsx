'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type ProposalType } from '@/lib/store';
import { Avatar, Spinner } from '@/components/ui';

const TYPE_OPTIONS = [
    { value: 'LIVE_SHOW', label: '🎤 Show ao vivo', desc: 'Apresentação ao vivo em evento ou casa de shows' },
    { value: 'RECORDING', label: '🎙 Gravação', desc: 'Faixa ou álbum gravado em estúdio' },
    { value: 'FEAT', label: '🤝 Feat', desc: 'Colaboração em música já existente' },
    { value: 'MUSIC_VIDEO', label: '🎬 Clipe', desc: 'Gravação de videoclipe' },
    { value: 'EVENT', label: '🎉 Evento', desc: 'Participação em evento específico' },
    { value: 'OTHER', label: '📌 Outro', desc: 'Proposta personalizada' },
];

function NewProposalContent() {
    useAuthGuard('INDUSTRY');
    const params = useSearchParams();
    const { artists, createProposal, industryProfile, currentUser } = useStore();
    const router = useRouter();

    const preArtistId = params.get('artistId') || '';
    const preArtistName = params.get('artistName') || '';

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

    const selectedArtist = artists.find((a) => a.id === artistId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artistId || !amount) return;
        setSending(true);
        await new Promise((r) => setTimeout(r, 1000));

        const proposalId = createProposal({
            industryId: industryProfile?.id || 'industry-demo',
            industryName: industryProfile?.companyName || 'Minha Empresa',
            artistId,
            artistName: selectedArtist?.stageName || '',
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

        router.push(`/deals/${proposalId}`);
    };

    return (
        <AppShell>
            <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:px-6 lg:pb-6 overflow-y-auto max-h-screen">
                <div className="mb-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-beet-muted">←</button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Nova Proposta</h1>
                        {selectedArtist && <p className="text-sm text-beet-muted">Para {selectedArtist.stageName}</p>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Artist selector */}
                    <div className="beet-card p-5">
                        <p className="section-title mb-3">Artista *</p>
                        {selectedArtist ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar name={selectedArtist.stageName} size="sm" emoji="🎤" />
                                    <div>
                                        <p className="font-semibold text-white">{selectedArtist.stageName}</p>
                                        <p className="text-xs text-beet-muted">{selectedArtist.genres.join(', ')} · {selectedArtist.city}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setArtistId('')} className="text-xs text-beet-muted hover:text-white">Trocar</button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {artists.map((a) => (
                                    <button type="button" key={a.id} onClick={() => setArtistId(a.id)}
                                        className="w-full flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors text-left">
                                        <Avatar name={a.stageName} size="sm" emoji="🎤" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white">{a.stageName}</p>
                                            <p className="text-[10px] text-beet-muted">{a.genres.join(', ')}</p>
                                        </div>
                                        <span className="score-badge text-[10px]">🐝 {Math.round(a.scoreBeet)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Proposal type */}
                    <div className="beet-card p-5">
                        <p className="section-title mb-3">Tipo de proposta *</p>
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                            {TYPE_OPTIONS.map((opt) => (
                                <button type="button" key={opt.value} onClick={() => setType(opt.value as ProposalType)}
                                    className="rounded-xl border p-3 text-left transition-all"
                                    style={{ borderColor: type === opt.value ? '#0057FF' : 'var(--color-border)', background: type === opt.value ? 'rgba(0,87,255,0.12)' : 'transparent' }}>
                                    <p className="text-sm font-semibold" style={{ color: type === opt.value ? '#0057FF' : 'var(--color-gray)' }}>{opt.label}</p>
                                    <p className="mt-0.5 text-[10px] text-beet-muted">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Financial & logistics */}
                    <div className="beet-card p-5 space-y-4">
                        <p className="section-title">Valores e logística</p>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <div>
                                <label className="section-title mb-1.5 block text-[11px]">Valor proposto (R$) *</label>
                                <input className="beet-input" type="number" placeholder="15000" required
                                    value={amount} onChange={(e) => setAmount(e.target.value)} />
                            </div>
                            <div>
                                <label className="section-title mb-1.5 block text-[11px]">Duração (horas)</label>
                                <input className="beet-input" type="number" placeholder="2" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} />
                            </div>
                            <div>
                                <label className="section-title mb-1.5 block text-[11px]">Data do evento</label>
                                <input className="beet-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="section-title mb-1.5 block text-[11px]">Prazo para resposta</label>
                                <select className="beet-input" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)}>
                                    <option value="3">3 dias</option>
                                    <option value="7">7 dias</option>
                                    <option value="14">14 dias</option>
                                    <option value="30">30 dias</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white">Online</p>
                                <p className="text-xs text-beet-muted">Evento ou gravação remota</p>
                            </div>
                            <button type="button" onClick={() => setOnline(!online)}
                                className="relative h-5 w-9 rounded-full transition-all"
                                style={{ background: online ? '#0057FF' : 'var(--color-border)' }}>
                                <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: online ? '18px' : '2px' }} />
                            </button>
                        </div>

                        {!online && (
                            <div>
                                <label className="section-title mb-1.5 block text-[11px]">Localização</label>
                                <input className="beet-input" placeholder="Ex: Allianz Parque, São Paulo" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="beet-card p-5">
                        <p className="section-title mb-3">Termos e condições</p>
                        <textarea className="beet-input" rows={4}
                            placeholder="Descreva os detalhes da proposta, o que está incluído, obrigações de cada parte..."
                            value={terms} onChange={(e) => setTerms(e.target.value)} />
                    </div>

                    <button type="submit" disabled={sending || !artistId || !amount}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold rounded-full text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        style={{ background: '#0057FF', color: 'white' }}>
                        {sending ? <><Spinner size="sm" /> Enviando proposta...</> : '📋 Enviar proposta'}
                    </button>
                </form>
            </div>
        </AppShell>
    );
}

export default function NewProposal() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-beet-black"><Spinner /></div>}>
            <NewProposalContent />
        </Suspense>
    );
}
