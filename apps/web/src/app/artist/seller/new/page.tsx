'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, ArrowRight, ArrowLeft, Check, Camera, 
    Music, Video, MapPin, Tag, Briefcase, 
    Clock, RefreshCw, Shield, Eye, Globe,
    Users, Building, ShieldCheck, Zap, Radio, PlusCircle
} from 'lucide-react';
import { useStore, MARKETPLACE_CATEGORIES } from '@/lib/store';
import { useAuthGuard, Avatar } from '@/components/shell/AppShell';
import { api } from '@/lib/api';
import { Spinner, CustomSelect } from '@/components/ui';

const STEPS = [
    { id: 1, title: 'Categoria', label: 'Escolha o que você está oferecendo' },
    { id: 2, title: 'Detalhes', label: 'Título, descrição e localização' },
    { id: 3, title: 'Negócio', label: 'Preços, entrega e revisões' },
    { id: 4, title: 'Mídia', label: 'Imagens, áudio e vídeo de exemplo' },
    { id: 5, title: 'Publicar', label: 'Visibilidade e revisão final' },
];

export default function NewListingPage() {
    const { ready, user } = useAuthGuard('ARTIST');
    const router = useRouter();
    const { createListing, addToast } = useStore();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        condition: 'NEW',
        title: '',
        description: '',
        location: '',
        price: 0,
        priceType: 'FIXED',
        deliveryDays: 7,
        revisions: 2,
        licenseType: 'Comercial',
        visibility: 'PUBLIC',
        images: [] as string[],
        audioUrl: '',
        videoUrl: '',
        thumbUrl: '',
        announcementTarget: 'FEED_AND_STORY' as 'FEED' | 'STORY' | 'FEED_AND_STORY',
    });

    const [isUploading, setIsUploading] = useState({
        images: false,
        audio: false,
        video: false
    });

    if (!ready) return null;

    const nextStep = () => {
        if (step === 1 && !formData.category) {
            addToast({ message: 'Escolha uma categoria', type: 'error' });
            return;
        }
        if (step === 2 && (!formData.title || !formData.description || !formData.location)) {
            addToast({ message: 'Preencha os campos obrigatórios', type: 'error' });
            return;
        }
        setStep(Math.min(step + 1, STEPS.length));
    };

    const prevStep = () => setStep(Math.max(step - 1, 1));

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const success = await createListing(formData);
            if (success) {
                addToast({ message: 'Anúncio criado com sucesso! +5 Score Beeats', type: 'success' });
                router.push('/artist/marketplace');
            } else {
                addToast({ message: 'Erro ao criar anúncio. Verifique os dados.', type: 'error' });
            }
        } catch (error) {
            addToast({ message: 'Ocorreu um erro inesperado.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (type: 'images' | 'audio' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(prev => ({ ...prev, [type]: true }));
            addToast({ message: `Fazendo upload de ${file.name}...`, type: 'info' });
            const { url } = await api.upload(file);

            if (type === 'images') {
                setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
            } else if (type === 'audio') {
                setFormData(prev => ({ ...prev, audioUrl: url }));
            } else if (type === 'video') {
                setFormData(prev => ({ ...prev, videoUrl: url }));
            }
            addToast({ message: `${type === 'images' ? 'Imagem' : type === 'audio' ? 'Áudio' : 'Vídeo'} carregado com sucesso!`, type: 'success' });
        } catch (error: any) {
            addToast({ message: error.message || 'Erro no upload', type: 'error' });
        } finally {
            setIsUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <>
            <div className="mx-auto max-w-3xl px-4 py-12 pb-32">
                {/* Header */}
                <div className="mb-10">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-beet-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <ArrowLeft size={14} /> Voltar
                    </button>
                    <h1 className="brutalist-text-xl mb-2" style={{ fontSize: '32px' }}>CRIAR NOVO ANÚNCIO</h1>
                    <p className="text-beet-muted font-mono text-xs uppercase tracking-[0.2em]">Passo {step} de 5: {STEPS[step-1].label}</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {STEPS.map((s) => (
                        <div 
                            key={s.id} 
                            className="h-1 flex-1 rounded-full transition-all duration-500"
                            style={{ 
                                background: step >= s.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                boxShadow: step >= s.id ? '0 0 10px var(--color-accent-glow)' : 'none'
                             }}
                        />
                    ))}
                </div>

                {/* Form Steps */}
                <div className="beet-card p-6 md:p-10 relative overflow-hidden" style={{ minHeight: '400px' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0,255,102,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="section-label mb-6">O que você quer anunciar?</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {MARKETPLACE_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.slug}
                                                onClick={() => setFormData({ ...formData, category: cat.slug })}
                                                className={`flex items-center gap-4 p-4 text-left transition-all border ${formData.category === cat.slug ? 'bg-accent/10 border-accent' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                                style={{ borderRadius: '4px' }}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <div>
                                                    <p className="font-bold text-sm text-white uppercase tracking-wider">{cat.label}</p>
                                                    <p className="text-[10px] text-beet-muted">Clique para selecionar</p>
                                                </div>
                                                {formData.category === cat.slug && <Check className="ml-auto text-accent" size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="section-label mb-4">Condição do Item / Tipo</label>
                                    <div className="flex gap-3">
                                        {['NEW', 'USED_LIKE_NEW', 'USED_GOOD'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setFormData({ ...formData, condition: c as any })}
                                                className={`flex-1 py-3 text-center transition-all border text-[10px] font-black tracking-widest uppercase ${formData.condition === c ? 'bg-white text-black border-white' : 'bg-white/5 text-beet-muted border-white/5'}`}
                                            >
                                                {c.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="section-label flex items-center gap-2"><Tag size={14} /> Título do Anúncio</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Ghost Production Tech House Premium"
                                        className="beet-input w-full"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label flex items-center gap-2"><Briefcase size={14} /> Descrição Detalhada</label>
                                    <textarea 
                                        rows={6}
                                        placeholder="Descreva seu serviço, processos, o que o comprador recebe, etc..."
                                        className="beet-input w-full resize-none p-4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label flex items-center gap-2"><MapPin size={14} /> Localização</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: São Paulo, SP (ou Remoto)"
                                        className="beet-input w-full"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <label className="section-label">Modelo de Preço</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'FIXED', label: 'PREÇO FIXO', desc: 'Valor exato' },
                                            { id: 'NEGOTIABLE', label: 'NEGOCIÁVEL', desc: 'A partir de...' },
                                            { id: 'CONSULT', label: 'CONSULTA', desc: 'Combinar no chat' },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFormData({ ...formData, priceType: p.id as any })}
                                                className={`p-4 border text-center transition-all ${formData.priceType === p.id ? 'bg-accent/10 border-accent' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <p className="font-black text-[10px] tracking-widest text-white mb-1">{p.label}</p>
                                                <p className="text-[9px] text-beet-muted opacity-60">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.priceType !== 'CONSULT' && (
                                    <div className="space-y-2">
                                        <label className="section-label">Valor (R$)</label>
                                        <input 
                                            type="number"
                                            className="beet-input w-full text-2xl font-black text-accent"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="section-label flex items-center gap-2"><Clock size={14} /> Prazo (Dias)</label>
                                        <input 
                                            type="number"
                                            className="beet-input w-full"
                                            value={formData.deliveryDays}
                                            onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="section-label flex items-center gap-2"><RefreshCw size={14} /> Revisões</label>
                                        <input 
                                            type="number"
                                            className="beet-input w-full"
                                            value={formData.revisions}
                                            onChange={(e) => setFormData({ ...formData, revisions: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label flex items-center gap-2"><Shield size={14} /> Tipo de Licença / Uso</label>
                                    <CustomSelect 
                                        value={formData.licenseType}
                                        onChange={(val) => setFormData({ ...formData, licenseType: val })}
                                        options={[
                                            { value: 'Comercial', label: 'Uso Comercial Full' },
                                            { value: 'Limitada', label: 'Licença Limitada' },
                                            { value: 'Royalties', label: 'Com Royalties' },
                                            { value: 'Exclusivo', label: 'Buyout (Exclusivo)' }
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="section-label mb-4">Galeria de Imagens</label>
                                    <div className="flex flex-wrap gap-4">
                                        {formData.images.map((img, i) => (
                                            <div key={i} className="w-24 h-24 rounded border border-white/10 overflow-hidden relative group">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                    className="absolute inset-0 bg-beet-red/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <Plus className="rotate-45 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                         <label className={`w-24 h-24 rounded border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${isUploading.images ? 'bg-accent/20 border-accent text-accent' : 'border-white/10 text-beet-muted hover:border-accent hover:text-accent bg-white/5'}`}>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('images', e)} disabled={isUploading.images} />
                                            {isUploading.images ? <Spinner size="sm" /> : <Camera size={24} />}
                                            <span className="text-[8px] font-black uppercase">{isUploading.images ? 'SUBINDO...' : 'ADICIONAR'}</span>
                                         </label>
                                    </div>
                                    <p className="mt-4 text-[10px] font-mono text-beet-muted uppercase tracking-widest">
                                        <span className="text-accent font-black">Recomendado:</span> 1080x1080px (Quadrado)
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-4">
                                        <label className="section-label">Amostra de Áudio</label>
                                        <label className={`w-full p-4 border rounded flex items-center gap-3 transition-all cursor-pointer ${isUploading.audio ? 'bg-accent/20 border-accent text-accent' : formData.audioUrl ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-beet-muted'}`}>
                                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload('audio', e)} disabled={isUploading.audio} />
                                            {isUploading.audio ? <Spinner size="sm" /> : <Music size={20} />}
                                            <span className="text-xs font-bold">{isUploading.audio ? 'SUBINDO MP3...' : formData.audioUrl ? 'ÁUDIO CARREGADO' : 'SUBIR MP3'}</span>
                                        </label>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="section-label">Amostra de Vídeo</label>
                                        <label className={`w-full p-4 border rounded flex items-center gap-3 transition-all cursor-pointer ${isUploading.video ? 'bg-blue-500/20 border-blue-500 text-blue-400' : formData.videoUrl ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-beet-muted'}`}>
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload('video', e)} disabled={isUploading.video} />
                                            {isUploading.video ? <Spinner size="sm" /> : <Video size={20} />}
                                            <span className="text-xs font-bold">{isUploading.video ? 'SUBINDO VÍDEO...' : formData.videoUrl ? 'VÍDEO CARREGADO' : 'SUBIR VÍDEO'}</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div 
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="bg-white/5 p-6 border border-white/5 rounded">
                                    <div className="space-y-3">
                                        {[
                                            { id: 'PUBLIC', label: 'Público Geral', desc: 'Visível para todos na plataforma', icon: <Globe size={18} /> },
                                            { id: 'ARTISTS_ONLY', label: 'Somente Artistas', desc: 'Restrito a perfis do tipo ARTISTA', icon: <Users size={18} /> },
                                            { id: 'INDUSTRY_ONLY', label: 'Somente Industry', desc: 'Exclusivo para empresas/selos', icon: <Building size={18} /> },
                                        ].map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setFormData({ ...formData, visibility: v.id as any })}
                                                className={`w-full flex items-center gap-4 p-4 border rounded transition-all text-left ${formData.visibility === v.id ? 'bg-accent/10 border-accent' : 'bg-transparent border-white/10 opacity-60'}`}
                                            >
                                                <div className={formData.visibility === v.id ? 'text-accent' : ''}>{v.icon}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-xs uppercase tracking-wider text-white">{v.label}</p>
                                                    <p className="text-[10px] text-beet-muted">{v.desc}</p>
                                                </div>
                                                {formData.visibility === v.id && <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center"><Check size={10} color="#000" strokeWidth={4} /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 border border-white/5 rounded">
                                    <label className="section-label mb-6">Onde anunciar a novidade?</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'FEED', label: 'APENAS FEED', icon: <Zap size={16} /> },
                                            { id: 'STORY', label: 'APENAS STORY', icon: <Radio size={16} /> },
                                            { id: 'FEED_AND_STORY', label: 'FEED + STORY', icon: <PlusCircle size={16} /> },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setFormData({ ...formData, announcementTarget: t.id as any })}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 border rounded transition-all ${formData.announcementTarget === t.id ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-white/10 opacity-60 text-beet-muted hover:opacity-100'}`}
                                            >
                                                {t.icon}
                                                <p className="font-black text-[9px] tracking-widest text-center">{t.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary preview */}
                                <div className="border-t border-white/10 pt-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded overflow-hidden">
                                            {formData.images[0] ? <img src={formData.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-white leading-tight">{formData.title || 'Título do Anúncio'}</p>
                                            <p className="text-accent font-black text-sm uppercase tracking-widest mt-1">
                                                {formData.priceType === 'CONSULT' ? 'SOB CONSULTA' : `R$ ${formData.price}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-beet-muted font-mono text-[9px] uppercase tracking-widest">
                                        <ShieldCheck size={12} className="text-accent" /> Ao publicar, você ganha 5 Score Beeats e seu perfil sobe no ranking.
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
                        <button 
                            onClick={prevStep}
                            disabled={step === 1 || isSubmitting}
                            className={`flex items-center gap-2 transition-all font-black text-[10px] tracking-widest uppercase ${step === 1 ? 'opacity-0' : 'text-beet-muted hover:text-white'}`}
                        >
                            <ArrowLeft size={16} /> Voltar
                        </button>

                        {step < STEPS.length ? (
                            <motion.button 
                                whileHover={{ x: 3 }}
                                onClick={nextStep}
                                className="btn-accent px-8 py-3 flex items-center gap-2"
                                style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em' }}
                            >
                                PRÓXIMO PASSO <ArrowRight size={16} />
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn-accent px-10 py-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,255,102,0.4)]"
                                style={{ fontSize: '14px', fontWeight: 950, letterSpacing: '0.15em' }}
                            >
                                {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR ANÚNCIO'}
                                {!isSubmitting && <Plus size={20} strokeWidth={3} />}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Info Tip */}
                <div className="mt-8 flex items-center gap-4 p-4 border border-[var(--color-accent-dim)] bg-accent/5 rounded-sm">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Dica de Sucesso</p>
                        <p className="text-xs text-beet-muted leading-relaxed">Adicionar áudio e vídeo de amostra aumenta suas chances de venda em até 40%.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
