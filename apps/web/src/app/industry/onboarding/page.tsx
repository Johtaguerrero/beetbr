'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useAuthGuard } from '@/components/shell/AppShell';
import { Spinner, GenrePill } from '@/components/ui';

const NICHES = ['Funk', 'Trap', 'R&B', 'Pop', 'Sertanejo', 'Forró', 'Gospel', 'Rock', 'Eletrônico', 'Indie', 'MPB', 'Samba'];
const STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS', 'PR', 'PE', 'GO', 'DF'];
const COMPANY_TYPES = ['LABEL', 'PUBLISHER', 'AGENCY', 'BRAND', 'PRODUCER', 'EVENT', 'OTHER'];
const TYPE_LABELS: Record<string, string> = {
    LABEL: '🎵 Gravadora', PUBLISHER: '📝 Publisher', AGENCY: '🤝 Agência',
    BRAND: '🏷 Marca', PRODUCER: '🎚 Produtora', EVENT: '🎟 Eventos', OTHER: '📌 Outro',
};
const STEPS = ['Sua empresa', 'Nichos e mercado', 'Preferências'];

export default function IndustryOnboarding() {
    useAuthGuard('INDUSTRY');
    const { updateArtistProfile } = useStore();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [type, setType] = useState('LABEL');
    const [cnpj, setCnpj] = useState('');
    const [website, setWebsite] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('SP');
    const [niches, setNiches] = useState<string[]>([]);
    const [maxBudget, setMaxBudget] = useState(10000);
    const [saving, setSaving] = useState(false);

    const toggleNiche = (n: string) =>
        setNiches((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

    const handleFinish = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        router.push('/industry/dashboard');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-beet-black p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-6 flex gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className="mb-1.5 text-[10px]">
                                <span className={i <= step ? 'text-beet-blue font-bold' : 'text-beet-muted'}>
                                    {i < step ? '✓ ' : ''}{s}
                                </span>
                            </div>
                            <div className="h-1 rounded-full transition-all duration-500"
                                style={{ background: i <= step ? '#0057FF' : 'var(--color-border)' }} />
                        </div>
                    ))}
                </div>

                <div className="beet-card p-7">
                    {/* Step 0 — Company details */}
                    {step === 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Sua empresa</h2>
                                <p className="text-sm text-beet-muted mt-1">Configure seu perfil para atrair os melhores talentos</p>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Nome da empresa *</label>
                                <input className="beet-input" placeholder="Label One Music" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Tipo de empresa</label>
                                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                                    {COMPANY_TYPES.map((t) => (
                                        <button key={t} onClick={() => setType(t)}
                                            className="rounded-xl border p-3 text-left text-sm transition-all"
                                            style={{ borderColor: type === t ? '#0057FF' : 'var(--color-border)', background: type === t ? 'rgba(0,87,255,0.12)' : 'transparent', color: type === t ? '#0057FF' : 'var(--color-gray)' }}>
                                            {TYPE_LABELS[t]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">CNPJ (opcional)</label>
                                <input className="beet-input" placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="section-title mb-2 block">Website</label>
                                    <input className="beet-input" placeholder="labelonemusic.com.br" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="section-title mb-2 block">Cidade</label>
                                    <input className="beet-input" placeholder="São Paulo" value={city} onChange={(e) => setCity(e.target.value)} />
                                </div>
                                <div className="w-24">
                                    <label className="section-title mb-2 block">Estado</label>
                                    <select className="beet-input" value={state} onChange={(e) => setState(e.target.value)}>
                                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} disabled={!companyName} className="w-full py-3.5 font-bold rounded-full transition-all hover:scale-[1.02] disabled:opacity-50"
                                style={{ background: '#0057FF', color: 'white' }}>
                                Próximo → Nichos e mercado
                            </button>
                        </motion.div>
                    )}

                    {/* Step 1 — Niches */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Nichos e mercado</h2>
                                <p className="text-sm text-beet-muted mt-1">Selecione os gêneros em que você busca talentos</p>
                            </div>
                            <div>
                                <label className="section-title mb-3 block">Gêneros de interesse *</label>
                                <div className="flex flex-wrap gap-2">
                                    {NICHES.map((n) => <GenrePill key={n} genre={n} active={niches.includes(n)} onClick={() => toggleNiche(n)} />)}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">← Voltar</button>
                                <button onClick={() => setStep(2)} disabled={niches.length === 0}
                                    className="flex-1 py-3 font-bold rounded-full transition-all hover:scale-[1.02] disabled:opacity-50"
                                    style={{ background: '#0057FF', color: 'white' }}>
                                    Próximo → Preferências
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2 — Preferences & budget */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Preferências</h2>
                                <p className="text-sm text-beet-muted mt-1">Personalize sua experiência de busca</p>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Budget máximo por proposta: R$ {maxBudget.toLocaleString('pt-BR')}</label>
                                <input type="range" min={1000} max={200000} step={500} value={maxBudget}
                                    onChange={(e) => setMaxBudget(Number(e.target.value))} className="w-full" style={{ accentColor: '#0057FF' }} />
                                <div className="flex justify-between text-[10px] text-beet-muted mt-1">
                                    <span>R$ 1.000</span><span>R$ 200.000</span>
                                </div>
                            </div>

                            {['Artistas verificados primeiro', 'Só artistas disponíveis para contratação', 'Score Beet mínimo 60+'].map((pref) => (
                                <div key={pref} className="beet-card flex items-center justify-between p-3.5">
                                    <p className="text-sm text-white">{pref}</p>
                                    <div className="relative h-5 w-9 rounded-full cursor-pointer" style={{ background: '#0057FF' }}>
                                        <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white shadow" />
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Voltar</button>
                                <button onClick={handleFinish} disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-full transition-all hover:scale-[1.02]"
                                    style={{ background: '#0057FF', color: 'white' }}>
                                    {saving ? <><Spinner size="sm" /> Configurando...</> : '🏢 Ir ao Dashboard!'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
