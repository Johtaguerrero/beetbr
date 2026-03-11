'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, MARKETPLACE_CATEGORIES, type Listing, type ListingStatus } from '@/lib/store';
import { type MarketplaceCategory } from '@beetbr/shared';
import { api } from '@/lib/api';

const DELIVERY_METHODS = [
    { id: 'digital', label: '📁 Arquivo digital', desc: 'Entrega por download' },
    { id: 'link', label: '🔗 Link / Acesso', desc: 'Entregue via link' },
    { id: 'online', label: '🎥 Videochamada', desc: 'Sessão ao vivo online' },
    { id: 'presencial', label: '📍 Presencial', desc: 'Requer presença física' },
];

export default function NewListing() {
    useAuthGuard('ARTIST');
    const router = useRouter();
    const { createListing, artistProfile, addToast } = useStore();

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
        images: [] as { file: File; preview: string }[],
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (form.images.length + files.length > 5) {
            addToast({ message: 'Máximo de 5 imagens permitido.', type: 'info' });
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        set('images', [...form.images, ...newImages]);
    };

    const removeImage = (index: number) => {
        const newImages = [...form.images];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        set('images', newImages);
    };

    const addTag = () => {
        if (form.tagInput.trim() && form.tags.length < 5) {
            setForm((f) => ({ ...f, tags: [...f.tags, f.tagInput.trim()], tagInput: '' }));
        }
    };

    const canContinue = [
        form.type && form.category && form.images.length > 0,
        form.title.length >= 10 && form.description.length >= 30,
        form.price && Number(form.price) > 0,
    ][step] as boolean;

    const handlePublish = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const files = form.images.map(img => img.file);
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
            }, files);

            if (id) {
                router.push('/artist/marketplace');
            }
        } catch (error) {
            console.error('Error publishing listing:', error);
            addToast({ message: 'Erro ao publicar anúncio.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const STEPS = ['Mídia & Categoria', 'Detalhes', 'Preço & Entrega'];

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 pb-32 lg:px-6">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-black text-white tracking-tight">🛍️ NOVO ANÚNCIO</h1>
                <p className="text-sm text-beet-muted mt-2 font-medium">Transforme seu talento em lucro no Marketplace Beeat</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 flex-1 min-w-max">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all border"
                                style={{
                                    background: i === step ? 'var(--color-accent)' : i < step ? 'var(--color-accent-dim)' : 'var(--color-dark)',
                                    borderColor: i <= step ? 'var(--color-accent)' : 'var(--color-border)',
                                    color: i === step ? 'var(--color-bg)' : i < step ? 'var(--color-accent)' : 'var(--color-muted)',
                                    boxShadow: i === step ? '0 0 15px var(--color-accent-glow)' : 'none'
                                }}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className="text-xs font-black tracking-widest uppercase hidden sm:inline"
                                style={{ color: i === step ? 'white' : 'var(--color-muted)' }}>
                                {s}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 min-w-[20px] h-px hidden sm:block"
                                style={{ background: i < step ? 'var(--color-accent)' : 'var(--color-border)' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                >
                    {/* Step 0 — Media & Category */}
                    {step === 0 && (
                        <>
                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">TIPO DE ANÚNCIO</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'service', label: '🛠 Serviço', desc: 'Ofereça seu trabalho: gravação, mix, feat, etc.' },
                                        { id: 'product', label: '📦 Produto', desc: 'Venda beats, letras, licenças, artes etc.' },
                                    ].map((t) => (
                                        <button key={t.id} onClick={() => set('type', t.id)}
                                            className="beet-card p-5 text-left transition-all group"
                                            style={{
                                                borderColor: form.type === t.id ? 'var(--color-accent)' : 'var(--color-border)',
                                                background: form.type === t.id ? 'var(--color-accent-dim)' : ''
                                            }}>
                                            <p className={`text-lg font-black mb-1 ${form.type === t.id ? 'text-white' : 'text-beet-muted'}`}>{t.label}</p>
                                            <p className="text-xs leading-relaxed text-beet-muted group-hover:text-gray-400">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">MÍDIA (FOTOS DO PRODUTO/SERVIÇO)</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {form.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 h-6 w-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {form.images.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-beet-green/50 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/5"
                                        >
                                            <span className="text-2xl text-beet-muted">+</span>
                                            <span className="text-[10px] uppercase font-black text-beet-muted">Adicionar</span>
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                    />
                                </div>
                                <p className="text-[11px] text-beet-muted mt-3 font-medium italic">Faça upload de até 5 fotos reais. Imagens premium vendem mais.</p>
                            </div>

                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">CATEGORIA</label>
                                <div className="flex flex-wrap gap-2">
                                    {MARKETPLACE_CATEGORIES.map((c) => (
                                        <button key={c.slug} onClick={() => set('category', c.slug)}
                                            className="beet-pill cursor-pointer px-4 py-2 text-xs font-bold"
                                            style={{
                                                background: form.category === c.slug ? `${c.color}25` : 'var(--color-dark)',
                                                borderColor: form.category === c.slug ? c.color : 'var(--color-border)',
                                                color: form.category === c.slug ? c.color : 'var(--color-muted)',
                                                boxShadow: form.category === c.slug ? `0 0 10px ${c.color}30` : 'none'
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
                                <label className="section-title block mb-3 uppercase tracking-widest text-[11px] font-black text-beet-muted">TÍTULO DO ANÚNCIO *</label>
                                <input
                                    className="beet-input text-lg font-bold py-4"
                                    placeholder="Ex: Mixagem Profissional em Dolby Atmos"
                                    value={form.title}
                                    onChange={(e) => set('title', e.target.value)}
                                />
                                <p className={`text-[11px] mt-2 font-mono ${form.title.length < 10 ? 'text-red-400' : 'text-beet-green'}`}>
                                    {form.title.length}/80 caracteres {form.title.length < 10 && '(Mín. 10 necessários)'}
                                </p>
                            </div>

                            <div>
                                <label className="section-title block mb-3 uppercase tracking-widest text-[11px] font-black text-beet-muted">DESCRIÇÃO COMPLETA *</label>
                                <textarea
                                    className="beet-input min-h-48 resize-none leading-relaxed text-base"
                                    rows={6}
                                    placeholder="Detalhe o que está incluído no seu serviço ou produto, prazos médios, referências e processo de trabalho..."
                                    value={form.description}
                                    onChange={(e) => set('description', e.target.value)}
                                />
                                <p className={`text-[11px] mt-2 font-mono ${form.description.length < 30 ? 'text-red-400' : 'text-beet-green'}`}>
                                    {form.description.length} caracteres {form.description.length < 30 && '(Descreva com pelo menos 30 caracteres)'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <label className="flex items-center gap-4 cursor-pointer beet-card p-5 group">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${form.requiresBriefing ? 'bg-beet-green border-beet-green shadow-[0_0_8px_var(--color-accent-glow)]' : 'border-white/10'}`}>
                                        {form.requiresBriefing && <span className="text-black text-xs font-bold">✓</span>}
                                    </div>
                                    <input type="checkbox" checked={form.requiresBriefing}
                                        onChange={(e) => set('requiresBriefing', e.target.checked)} className="hidden" />
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tighter">Exigir briefing</p>
                                        <p className="text-[11px] text-beet-muted mt-0.5">O comprador deve preencher suas especificações</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-4 cursor-pointer beet-card p-5 group">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${form.hasSample ? 'bg-beet-green border-beet-green shadow-[0_0_8px_var(--color-accent-glow)]' : 'border-white/10'}`}>
                                        {form.hasSample && <span className="text-black text-xs font-bold">✓</span>}
                                    </div>
                                    <input type="checkbox" checked={form.hasSample}
                                        onChange={(e) => set('hasSample', e.target.checked)} className="hidden" />
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tighter">Incluir demo</p>
                                        <p className="text-[11px] text-beet-muted mt-0.5">Exibir player de amostra no anúncio</p>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="section-title block mb-3 uppercase tracking-widest text-[11px] font-black text-beet-muted">TAGS DE BUSCA (MÁX. 5)</label>
                                <div className="flex gap-2">
                                    <input className="beet-input flex-1 font-mono text-sm" placeholder="Aperte ENTER para adicionar..."
                                        value={form.tagInput} onChange={(e) => set('tagInput', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                    <button type="button" onClick={addTag} className="btn-outline px-6">+</button>
                                </div>
                                {form.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.tags.map((tag) => (
                                            <span key={tag} className="beet-pill active bg-beet-green/10 border-beet-green/30 text-beet-green font-black">
                                                #{tag.toUpperCase()}
                                                <button onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="ml-2 hover:text-white transition-colors">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Step 2 — Price & Delivery */}
                    {step === 2 && (
                        <>
                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">MODELO DE PRECIFICAÇÃO</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'fixed', label: '💰 Preço fixo', desc: 'Valor definido, ideal para produtos prontos' },
                                        { id: 'negotiable', label: '🤝 A combinar', desc: 'Preço base, sujeito a ajustes no chat' },
                                    ].map((p) => (
                                        <button key={p.id} onClick={() => set('priceType', p.id)}
                                            className="beet-card p-5 text-left transition-all"
                                            style={{
                                                borderColor: form.priceType === p.id ? 'var(--color-accent)' : 'var(--color-border)',
                                                background: form.priceType === p.id ? 'var(--color-accent-dim)' : ''
                                            }}>
                                            <p className={`text-lg font-black mb-1 ${form.priceType === p.id ? 'text-white' : 'text-beet-muted'}`}>{p.label}</p>
                                            <p className="text-xs text-beet-muted">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="section-title block mb-3 uppercase tracking-widest text-[11px] font-black text-beet-muted">VALOR (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted font-bold">R$</span>
                                        <input type="number" className="beet-input pl-12 text-2xl font-black py-4" placeholder="00,00"
                                            value={form.price} onChange={(e) => set('price', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="section-title block mb-3 uppercase tracking-widest text-[11px] font-black text-beet-muted">PRAZO ESTIMADO (DIAS)</label>
                                    <input type="number" className="beet-input text-2xl font-black py-4" placeholder="Ex: 3"
                                        value={form.deliveryDays} onChange={(e) => set('deliveryDays', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">MÉTODO DE ENTREGA</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {DELIVERY_METHODS.map((m) => (
                                        <button key={m.id} onClick={() => set('deliveryMethod', m.id)}
                                            className="beet-card p-4 text-left transition-all"
                                            style={{
                                                borderColor: form.deliveryMethod === m.id ? 'var(--color-accent)' : 'var(--color-border)',
                                                background: form.deliveryMethod === m.id ? 'var(--color-accent-dim)' : ''
                                            }}>
                                            <p className={`text-[13px] font-black uppercase tracking-tight ${form.deliveryMethod === m.id ? 'text-white' : 'text-beet-muted'}`}>{m.label}</p>
                                            <p className="text-[10px] text-beet-muted mt-1 leading-tight">{m.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="section-title block mb-4 uppercase tracking-widest text-[11px] font-black text-beet-muted">NÚMERO DE REVISÕES</label>
                                <div className="flex flex-wrap gap-2">
                                    {['0', '1', '2', '3', '5', 'Ilimitado'].map((r) => (
                                        <button key={r} onClick={() => set('revisions', r)}
                                            className={`beet-pill cursor-pointer px-5 py-2.5 font-black uppercase tracking-widest text-[10px] transition-all
                                                ${form.revisions === r ? 'active bg-beet-green text-black border-beet-green shadow-[0_0_10px_var(--color-accent-glow)]' : 'bg-var(--color-dark) text-beet-muted border-var(--color-border)'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-beet-black/80 backdrop-blur-xl z-50">
                <div className="mx-auto max-w-2xl flex justify-between gap-4">
                    <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
                        className="btn-outline flex-1 sm:flex-none">
                        {step === 0 ? 'CANCELAR' : '← VOLTAR'}
                    </button>
                    {step < 2 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canContinue}
                            className="btn-accent flex-1 sm:flex-none px-12 group disabled:opacity-30">
                            CONTINUAR <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
                        </button>
                    ) : (
                        <button onClick={handlePublish} disabled={submitting || !form.price}
                            className={`btn-accent flex-1 sm:flex-none px-12 relative overflow-hidden ${submitting ? 'opacity-70 cursor-wait' : ''}`}>
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    PUBLICANDO...
                                </span>
                            ) : '🚀 PUBLICAR AGORA'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
