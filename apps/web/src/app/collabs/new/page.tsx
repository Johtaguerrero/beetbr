'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    Check,
    Zap,
    Globe,
    MapPin,
    Calendar,
    Image as ImageIcon,
    Rocket
} from 'lucide-react';
import { useStore, COLLAB_TYPE_CONFIG, CollabType, CollabMode } from '@/lib/store';

const STEPS = [
    { id: 'type', label: 'Tipo' },
    { id: 'details', label: 'Detalhes' },
    { id: 'settings', label: 'Ajustes' },
];

export default function NewCollabPage() {
    const router = useRouter();
    const { createCollabPost, artistProfile } = useStore();
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        type: 'LOOKING_FOR_BEATMAKER' as CollabType,
        title: '',
        description: '',
        genres: [] as string[],
        mode: 'online' as CollabMode,
        city: artistProfile?.city || '',
        state: artistProfile?.state || '',
        deadline: '',
        autoAccept: false,
        allowIndustry: true,
    });

    const [genreInput, setGenreInput] = useState('');

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    const handleCreate = () => {
        const id = createCollabPost({ ...formData, status: 'ACTIVE' } as any);
        router.push(`/collabs/${id}`);
    };

    const addGenre = () => {
        if (genreInput && !formData.genres.includes(genreInput)) {
            setFormData({ ...formData, genres: [...formData.genres, genreInput] });
            setGenreInput('');
        }
    };

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--color-bg)' }}>
            {/* Header */}
            <div className="px-6 py-8 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-40" style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-nav-border)' }}>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full transition-colors" style={{ background: 'var(--color-glass-btn)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="page-header-sm text-xl lg:text-3xl">ANUNCIAR <span style={{ color: 'var(--color-accent)' }}>COLABORAÇÃO</span></h1>
                        <p className="meta-text" style={{ marginTop: 2 }}>PASSO {step + 1} DE {STEPS.length}</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500`} style={{ background: i === step ? 'var(--color-accent)' : i < step ? 'var(--color-accent-dim)' : 'var(--color-nav-border)', boxShadow: i === step ? '0 0 10px var(--color-accent-glow)' : 'none' }} />
                    ))}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="page-header-sm" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>O QUE VOCÊ ESTÁ <span style={{ color: 'var(--color-accent)' }}>BUSCANDO?</span></h2>
                                <p className="page-subtitle">Selecione o tipo de colaboração que deseja iniciar.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(COLLAB_TYPE_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setFormData({ ...formData, type: key as CollabType })}
                                        className={`flex flex-col items-start gap-4 p-5 beet-card transition-all text-left ${formData.type === key
                                            ? 'active'
                                            : ''
                                            }`}
                                    >
                                        <span className="text-3xl">{config.icon}</span>
                                        <span className={`text-sm font-bold ${formData.type === key ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                            {config.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full btn-accent shadow-[0_4px_20px_rgba(0,255,102,0.2)]"
                            >
                                CONTINUAR <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="page-header-sm" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>CONTE MAIS <span style={{ color: 'var(--color-accent)' }}>DETALHES</span></h2>
                                <p className="page-subtitle">Dê um título atrativo e explique seu objetivo.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="section-label ml-1" style={{ marginBottom: 8, display: 'block' }}>TÍTULO DO ANÚNCIO</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder='Ex: PROCuro MC para Feat em EP de Dril...'
                                        className="beet-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label ml-1" style={{ marginBottom: 8, display: 'block' }}>DESCRIÇÃO DETALHADA</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={6}
                                        placeholder="Explique o que você precisa, referências musicais, prazos, etc..."
                                        className="beet-input resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label ml-1" style={{ marginBottom: 8, display: 'block' }}>GÊNEROS RELACIONADOS</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={genreInput}
                                            onChange={(e) => setGenreInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addGenre()}
                                            placeholder="ADICIONE GÊNEROS..."
                                            className="beet-input"
                                        />
                                        <button onClick={addGenre} className="btn-outline px-6">ADD</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.genres.map(genre => (
                                            <span key={genre} className="beet-pill active">
                                                {genre} <button onClick={() => setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={20} /> VOLTAR
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.title || !formData.description}
                                    className="flex-[2] btn-accent shadow-[0_4px_20px_rgba(0,255,102,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CONTINUAR <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="page-header-sm" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>LOGÍSTICA E <span style={{ color: 'var(--color-accent)' }}>VISIBILIDADE</span></h2>
                                <p className="page-subtitle">Como e onde essa colaboração vai acontecer.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="section-label ml-1" style={{ marginBottom: 8, display: 'block' }}>FORMATO</label>
                                        <select
                                            value={formData.mode}
                                            onChange={(e) => setFormData({ ...formData, mode: e.target.value as CollabMode })}
                                            className="beet-input appearance-none"
                                        >
                                            <option value="online">ONLINE</option>
                                            <option value="presencial">PRESENCIAL</option>
                                            <option value="hibrido">HÍBRIDO</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="section-label ml-1" style={{ marginBottom: 8, display: 'block' }}>PRAZO (OPCIONAL)</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="beet-input color-scheme-dark"
                                        />
                                    </div>
                                </div>

                                <div className="beet-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="card-title" style={{ fontSize: '16px' }}>AUTO-ACEITAR PORTFÓLIOS</p>
                                            <p className="meta-text" style={{ marginTop: 2 }}>Inicia chat direto ao receber interesse.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.autoAccept} onChange={(e) => setFormData({ ...formData, autoAccept: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-beet-green"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="card-title" style={{ fontSize: '16px' }}>PERMITIR EMPRESAS/SELOS</p>
                                            <p className="meta-text" style={{ marginTop: 2 }}>Sua colab aparecerá para perfis Industry.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.allowIndustry} onChange={(e) => setFormData({ ...formData, allowIndustry: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-beet-green"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 btn-outline"
                                >
                                    VOLTAR
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-[2] btn-accent flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,102,0.3)] hover:scale-[1.02] active:scale-95"
                                >
                                    PUBLICAR ANÚNCIO <Rocket size={22} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
