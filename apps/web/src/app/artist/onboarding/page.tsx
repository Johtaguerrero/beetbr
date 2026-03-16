'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useAuthGuard } from '@/components/shell/AppShell';
import { Spinner, GenrePill, Toggle, CustomSelect } from '@/components/ui';

const GENRES = ['Funk', 'Trap', 'R&B', 'Pop', 'Samba', 'Forró', 'MPB', 'Sertanejo', 'Rock', 'Eletrônico', 'Gospel', 'Indie'];
const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const STEPS = ['Perfil Básico', 'Seu Som', 'Disponibilidade'];

export default function ArtistOnboarding() {
    useAuthGuard('ARTIST');
    const { updateArtistProfile } = useStore();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [stageName, setStageName] = useState('');
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('SP');
    const [genres, setGenres] = useState<string[]>([]);
    const [available, setAvailable] = useState(true);
    const [instagram, setInstagram] = useState('');
    const [saving, setSaving] = useState(false);

    const toggleGenre = (g: string) =>
        setGenres((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

    const handleFinish = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        updateArtistProfile({ stageName: stageName || 'Artista', bio, city, state, genres, availableForBooking: available, instagram: instagram ? `@${instagram}` : undefined });
        router.push('/artist/feed');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-beet-black p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-6 flex gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className="mb-1.5 flex items-center justify-between text-[10px]">
                                <span className={i === step ? 'text-neon font-bold' : i < step ? 'text-beet-green' : 'text-beet-muted'}>
                                    {i < step ? '✓ ' : ''}{s}
                                </span>
                            </div>
                            <div className="h-1 rounded-full transition-all duration-500"
                                style={{ background: i <= step ? 'var(--color-accent)' : 'var(--color-border)' }} />
                        </div>
                    ))}
                </div>

                <div className="beet-card p-7">
                    {/* Step 0 */}
                    {step === 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Perfil Básico</h2>
                                <p className="text-sm text-beet-muted mt-1">Mostre quem você é para o Brasil inteiro</p>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Nome artístico *</label>
                                <input className="beet-input" placeholder="Ex: MC Vibrante" value={stageName} onChange={(e) => setStageName(e.target.value)} />
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Bio</label>
                                <textarea className="beet-input" rows={3} placeholder="Conte sua história... (max 200 caracteres)" maxLength={200}
                                    value={bio} onChange={(e) => setBio(e.target.value)} />
                                <p className="mt-1 text-right text-[10px] text-beet-muted">{bio.length}/200</p>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Gêneros musicais *</label>
                                <div className="flex flex-wrap gap-2">
                                    {GENRES.map((g) => <GenrePill key={g} genre={g} active={genres.includes(g)} onClick={() => toggleGenre(g)} />)}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="section-title mb-2 block">Cidade</label>
                                    <input className="beet-input" placeholder="São Paulo" value={city} onChange={(e) => setCity(e.target.value)} />
                                </div>
                                <div className="w-28">
                                    <label className="section-title mb-2 block">Estado</label>
                                    <CustomSelect 
                                        value={state} 
                                        onChange={setState}
                                        options={STATES.map(s => ({ value: s, label: s }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="section-title mb-2 block">Instagram</label>
                                <div className="flex items-center">
                                    <span className="flex items-center rounded-l-xl border bg-beet-dark px-3 py-3 text-sm text-beet-muted"
                                        style={{ borderColor: 'var(--color-border)' }}>@</span>
                                    <input className="beet-input rounded-l-none border-l-0" placeholder="seuusuario" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} disabled={!stageName || genres.length === 0}
                                className="btn-accent w-full py-3.5 disabled:opacity-50">
                                Próximo → Seu Som
                            </button>
                        </motion.div>
                    )}

                    {/* Step 1 */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Seu Som</h2>
                                <p className="text-sm text-beet-muted mt-1">Adicione uma demonstração do seu trabalho</p>
                            </div>
                            <div className="rounded-xl2 border-2 border-dashed p-10 text-center cursor-pointer hover:bg-white/3 transition-colors"
                                style={{ borderColor: 'var(--color-accent)' }}>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ background: 'var(--color-accent-dim)' }}>🎵</div>
                                <p className="mt-4 font-semibold text-white">Arraste seu arquivo aqui</p>
                                <p className="mt-1 text-xs text-beet-muted">MP3, WAV, MP4 ou imagem de capa · até 50MB</p>
                                <button className="btn-outline mt-5 text-sm">Selecionar arquivo</button>
                            </div>
                            <p className="text-center text-xs text-beet-muted">Você pode adicionar músicas depois também</p>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">← Voltar</button>
                                <button onClick={() => setStep(2)} className="btn-accent flex-1 py-3">Próximo → Disponibilidade</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Disponibilidade</h2>
                                <p className="text-sm text-beet-muted mt-1">Configure como as empresas podem te contatar</p>
                            </div>

                            <div className="space-y-3">
                                <div className="beet-card flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-semibold text-white">Disponível para contratação</p>
                                        <p className="text-xs text-beet-muted mt-0.5">Empresas poderão enviar propostas diretamente</p>
                                    </div>
                                    <Toggle checked={available} onChange={setAvailable} />
                                </div>

                                <div className="beet-card flex items-center justify-between p-4 opacity-60">
                                    <div>
                                        <p className="font-semibold text-white">Visibilidade do contato</p>
                                        <p className="text-xs text-beet-muted mt-0.5">Apenas com proposta aceita (recomendado)</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => { }} />
                                </div>

                                <div className="beet-card flex items-center justify-between p-4 opacity-60">
                                    <div>
                                        <p className="font-semibold text-white">Aparecer nos Rankings</p>
                                        <p className="text-xs text-beet-muted mt-0.5">Sua pontuação Score Beet ficará visível</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => { }} />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Voltar</button>
                                <button onClick={handleFinish} disabled={saving} className="btn-accent flex-1 flex items-center justify-center gap-2 py-3">
                                    {saving ? <><Spinner size="sm" /> Salvando...</> : '🎉 Ir para o Feed!'}
                                </button>
                            </div>

                            <p className="text-center text-xs text-beet-muted">Você pode alterar tudo isso depois em Configurações</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
