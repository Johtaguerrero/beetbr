'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES } from '@/lib/store';
import { type MarketplaceCategory } from '@beetbr/shared';

const DELIVERY_METHODS = [
    { id: 'digital', label: '📁 Arquivo digital', desc: 'Entrega por download' },
    { id: 'link', label: '🔗 Link / Acesso', desc: 'Entregue via link' },
    { id: 'online', label: '🎥 Videochamada', desc: 'Sessão ao vivo online' },
    { id: 'presencial', label: '📍 Presencial', desc: 'Requer presença física' },
];

export default function NewListing() {
    useAuthGuard('ARTIST');
    const router = useRouter();
    const { createListing, artistProfile } = useStore();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        type: 'service' as 'product' | 'service',
        category: '' as MarketplaceCategory | '',
        title: '',
        description: '',
        price: '',
        priceType: 'fixed' as 'fixed' | 'negotiable',
        deliveryDays: '',
        deliveryMethod: 'digital' as 'digital' | 'link' | 'online' | 'presencial',
        revisions: '2',
        requiresBriefing: true,
        hasSample: false,
        tags: [] as string[],
        tagInput: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

    const addTag = () => {
        if (form.tagInput.trim() && form.tags.length < 5) {
            setForm((f) => ({ ...f, tags: [...f.tags, f.tagInput.trim()], tagInput: '' }));
        }
    };

    const canContinue = [
        form.type && form.category,
        form.title.length >= 10 && form.description.length >= 30,
        form.price && Number(form.price) > 0,
    ][step] as boolean;

    const handlePublish = async () => {
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 800));
        const id = await createListing({
            title: form.title,
            description: form.description,
            category: form.category as MarketplaceCategory,
            type: form.type,
            price: Number(form.price),
            priceType: form.priceType,
            deliveryDays: form.deliveryDays ? Number(form.deliveryDays) : undefined,
            deliveryMethod: form.deliveryMethod,
            revisions: Number(form.revisions),
            requiresBriefing: form.requiresBriefing,
            hasSample: form.hasSample,
            tags: form.tags,
            condition: 'NEW',
            location: `${artistProfile?.city || 'Brasil'}, ${artistProfile?.state || ''}`,
            status: 'ACTIVE',
        }, []);
        setSubmitting(false);
        router.push('/artist/marketplace');
    };

    const STEPS = ['Tipo & Categoria', 'Detalhes', 'Preço & Entrega'];

    return (
        <AppShell>
            <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">🛍️ Novo Anúncio</h1>
                    <p className="text-sm text-beet-muted mt-1">Publique seu serviço ou produto musical</p>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-7">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                                    style={{
                                        background: i <= step ? 'var(--color-accent)' : 'var(--color-dark)',
                                        color: i <= step ? 'var(--color-bg)' : 'var(--color-muted)',
                                    }}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className="text-xs font-medium hidden sm:inline" style={{ color: i === step ? 'white' : 'var(--color-muted)' }}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: i < step ? 'var(--color-accent)' : 'var(--color-border)' }} />}
                        </div>
                    ))}
                </div>

                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    {/* Step 0 — Type & Category */}
                    {step === 0 && (
                        <>
                            <div>
                                <p className="section-title mb-3">Tipo de anúncio</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'service', label: '🛠 Serviço', desc: 'Ofereça seu trabalho: gravação, mix, feat, etc.' },
                                        { id: 'product', label: '📦 Produto', desc: 'Venda beats, letras, licenças, artes etc.' },
                                    ].map((t) => (
                                        <button key={t.id} onClick={() => set('type', t.id)}
                                            className="beet-card p-4 text-left transition-all"
                                            style={{ borderColor: form.type === t.id ? 'var(--color-accent)' : 'var(--color-border)', background: form.type === t.id ? 'var(--color-accent-dim)' : '' }}>
                                            <p className="text-base mb-1">{t.label}</p>
                                            <p className="text-[11px] text-beet-muted">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="section-title mb-3">Categoria</p>
                                <div className="flex flex-wrap gap-2">
                                    {MARKETPLACE_CATEGORIES.map((c) => (
                                        <button key={c.slug} onClick={() => set('category', c.slug)}
                                            className="beet-pill cursor-pointer"
                                            style={{
                                                background: form.category === c.slug ? `${c.color}20` : '',
                                                borderColor: form.category === c.slug ? c.color : '',
                                                color: form.category === c.slug ? c.color : '',
                                            }}>
                                            {c.icon} {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 1 — Details */}
                    {step === 1 && (
                        <>
                            <div>
                                <label className="section-title block mb-2">Título do anúncio *</label>
                                <input className="beet-input" placeholder="Ex: Beat Trap Exclusivo — 140 BPM"
                                    value={form.title} onChange={(e) => set('title', e.target.value)} />
                                <p className="text-[10px] text-beet-muted mt-1">{form.title.length}/80 caracteres (mín. 10)</p>
                            </div>

                            <div>
                                <label className="section-title block mb-2">Descrição completa *</label>
                                <textarea className="beet-input min-h-32 resize-none" rows={5}
                                    placeholder="Descreva detalhadamente o que você oferece, o que está incluído, seu processo, etc."
                                    value={form.description} onChange={(e) => set('description', e.target.value)} />
                                <p className="text-[10px] text-beet-muted mt-1">{form.description.length} chars (mín. 30)</p>
                            </div>

                            <div>
                                <label className="section-title block mb-2">Tags (máx. 5)</label>
                                <div className="flex gap-2">
                                    <input className="beet-input flex-1" placeholder="Ex: Trap, Exclusivo, WAV"
                                        value={form.tagInput} onChange={(e) => set('tagInput', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                    <button type="button" onClick={addTag} className="btn-outline px-4">+</button>
                                </div>
                                {form.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {form.tags.map((tag) => (
                                            <span key={tag} className="beet-pill active">
                                                #{tag}
                                                <button onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="ml-1 opacity-70 hover:opacity-100">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 cursor-pointer beet-card p-4">
                                    <input type="checkbox" checked={form.requiresBriefing}
                                        onChange={(e) => set('requiresBriefing', e.target.checked)} className="w-4 h-4 accent-beet-blue" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Exigir briefing</p>
                                        <p className="text-xs text-beet-muted">O comprador deve preencher um briefing antes de iniciar o chat</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer beet-card p-4">
                                    <input type="checkbox" checked={form.hasSample}
                                        onChange={(e) => set('hasSample', e.target.checked)} className="w-4 h-4 accent-beet-blue" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Incluir demo/amostra</p>
                                        <p className="text-xs text-beet-muted">Exibir player de amostra no anúncio (simula upload de demonstração)</p>
                                    </div>
                                </label>
                            </div>
                        </>
                    )}

                    {/* Step 2 — Price & Delivery */}
                    {step === 2 && (
                        <>
                            <div>
                                <p className="section-title mb-3">Modelo de preço</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'fixed', label: '💰 Preço fixo', desc: 'Valor definido, sem negociação' },
                                        { id: 'negotiable', label: '🤝 A combinar', desc: 'Valor inicial, pode ser negociado' },
                                    ].map((p) => (
                                        <button key={p.id} onClick={() => set('priceType', p.id)}
                                            className="beet-card p-3 text-left transition-all"
                                            style={{ borderColor: form.priceType === p.id ? 'var(--color-accent)' : '', background: form.priceType === p.id ? 'var(--color-accent-dim)' : '' }}>
                                            <p className="text-sm">{p.label}</p>
                                            <p className="text-[10px] text-beet-muted">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="section-title block mb-2">Preço (R$) *</label>
                                    <input type="number" className="beet-input" placeholder="Ex: 350"
                                        value={form.price} onChange={(e) => set('price', e.target.value)} />
                                </div>
                                <div>
                                    <label className="section-title block mb-2">Prazo (dias úteis)</label>
                                    <input type="number" className="beet-input" placeholder="Ex: 3"
                                        value={form.deliveryDays} onChange={(e) => set('deliveryDays', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <p className="section-title mb-3">Método de entrega</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {DELIVERY_METHODS.map((m) => (
                                        <button key={m.id} onClick={() => set('deliveryMethod', m.id)}
                                            className="beet-card p-3 text-left transition-all"
                                            style={{ borderColor: form.deliveryMethod === m.id ? 'var(--color-accent)' : '', background: form.deliveryMethod === m.id ? 'var(--color-accent-dim)' : '' }}>
                                            <p className="text-xs font-medium text-white">{m.label}</p>
                                            <p className="text-[10px] text-beet-muted">{m.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="section-title block mb-2">Número de revisões</label>
                                <div className="flex gap-2">
                                    {['0', '1', '2', '3', 'Ilimitado'].map((r) => (
                                        <button key={r} onClick={() => set('revisions', r)}
                                            className={`beet-pill cursor-pointer ${form.revisions === r ? 'active' : ''}`}>{r}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between gap-3">
                    <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
                        className="btn-outline">
                        ← {step === 0 ? 'Cancelar' : 'Voltar'}
                    </button>
                    {step < 2 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canContinue}
                            className="btn-accent">Continuar →</button>
                    ) : (
                        <button onClick={handlePublish} disabled={submitting || !form.price}
                            className="btn-accent">
                            {submitting ? '⏳ Publicando...' : '🚀 Publicar anúncio'}
                        </button>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
