'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Modal, Spinner, SectionTitle } from '@/components/ui';
import {
    Save, Building2, ShieldCheck, Search, Share2,
    ChevronRight, ChevronLeft, Upload, Trash2,
    FileText, Globe, Mail, Phone, MapPin
} from 'lucide-react';
import { api } from '@/lib/api';

interface IndustryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const INDUSTRY_TYPES = [
    { value: 'LABEL', label: 'Gravadora' },
    { value: 'SELO', label: 'Selo' },
    { value: 'AGENCY', label: 'Agência de Artistas' },
    { value: 'PRODUCER_MUSICAL', label: 'Produtora Musical' },
    { value: 'PRODUCER_EXECUTIVE', label: 'Produtora Executiva' },
    { value: 'VENUE', label: 'Casa de Show' },
    { value: 'FESTIVAL', label: 'Festival / Evento' },
    { value: 'MANAGER', label: 'Empresário Artístico' },
    { value: 'CURATOR', label: 'Curadoria' },
    { value: 'BRAND', label: 'Marca / Publicidade' },
    { value: 'STUDIO', label: 'Estúdio' },
    { value: 'DISTRIBUTOR', label: 'Distribuidora' },
    { value: 'OTHER', label: 'Outro' },
];

const MUSIC_NICHES = [
    'Trap', 'Rap', 'Funk', 'Pop', 'R&B', 'Gospel', 'Rock', 'MPB', 'Samba', 'Pagode', 'Eletrônica', 'Afrobeat', 'Drill', 'Boom bap', 'Multi gênero', 'Outro'
];

const ARTIST_TYPES_SOUGHT = [
    'Cantor(a)', 'MC', 'DJ', 'Beatmaker', 'Produtor(a)', 'Compositor(a)', 'Banda', 'Grupo', 'Instrumentista'
];

const SCOUTING_OBJECTIVES = [
    'Descobrir Talentos', 'Contratar para Shows', 'Buscar Feats', 'Encontrar Produtores', 'Encontrar Compositores', 'Campanhas de Marca', 'Contratar para Eventos', 'Catálogo/Publishing'
];

export function IndustryEditModal({ isOpen, onClose }: IndustryEditModalProps) {
    const { industryProfile, updateIndustryProfile, submitIndustryVerification, updateIndustryScouting, addToast } = useStore();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen && industryProfile) {
            setFormData({
                ...industryProfile,
                complementaryNiches: industryProfile.complementaryNiches || [],
                scoutingInterests: industryProfile.scoutingInterests || [],
                scoutingGenres: industryProfile.scoutingGenres || [],
                scoutingTier: industryProfile.scoutingTier || [],
            });
            setActiveStep(0);
        }
    }, [isOpen, industryProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (name: string, value: string) => {
        setFormData((prev: any) => {
            const current = (prev[name] || []) as string[];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(v => v !== value) };
            }
            return { ...prev, [name]: [...current, value] };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [fieldName]: true }));
        try {
            const { url } = await api.upload(file);
            setFormData((prev: any) => ({ ...prev, [fieldName]: url }));
            addToast({ message: 'Documento carregado!', type: 'success' });
        } catch (err) {
            console.error(`Error uploading ${fieldName}:`, err);
            addToast({ message: 'Erro no upload.', type: 'error' });
        } finally {
            setUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeStep === 2) { // Verification step
                await submitIndustryVerification(formData);
            } else if (activeStep === 3) { // Scouting step
                await updateIndustryScouting(formData);
            } else {
                await updateIndustryProfile(formData);
            }

            if (activeStep < steps.length - 1) {
                setActiveStep(s => s + 1);
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 'identity', label: 'Identidade', icon: <Building2 size={16} /> },
        { id: 'social', label: 'Presença', icon: <Share2 size={16} /> },
        { id: 'verification', label: 'Verificação', icon: <ShieldCheck size={16} /> },
        { id: 'scouting', label: 'Scouting', icon: <Search size={16} /> },
    ];

    if (!industryProfile) return null;

    const renderStepContent = () => {
        const currentStepId = steps[activeStep]?.id;

        if (currentStepId === 'identity') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Razão Social / Nome Oficial</label>
                            <input type="text" name="companyName" value={formData.companyName || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" placeholder="Ex: BeeatBR LTDA" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Nome Comercial / Marca</label>
                            <input type="text" name="tradingName" value={formData.tradingName || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" placeholder="Ex: Beeat" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Tipo de Empresa</label>
                            <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none appearance-none">
                                <option value="">Selecione...</option>
                                {INDUSTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Nicho Principal</label>
                            <select name="mainNiche" value={formData.mainNiche || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none appearance-none">
                                <option value="">Selecione...</option>
                                {MUSIC_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Cidade</label>
                            <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">UF</label>
                            <input type="text" name="state" value={formData.state || ''} onChange={handleChange} maxLength={2} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none uppercase" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Descrição Curta (Pitch)</label>
                        <textarea name="descriptionShort" value={formData.descriptionShort || ''} onChange={handleChange} rows={2} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none resize-none" placeholder="O que sua empresa faz em poucas palavras..." />
                    </div>
                </div>
            );
        }

        if (currentStepId === 'social') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">E-mail de Contato</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted" size={16} />
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">WhatsApp / Tel</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted" size={16} />
                                <input type="text" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Website Oficial</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted" size={16} />
                                <input type="url" name="website" value={formData.website || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-beet-blue outline-none" placeholder="https://..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Instagram</label>
                            <input type="text" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" placeholder="@empresa" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">YouTube (Canal)</label>
                            <input type="url" name="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">LinkedIn</label>
                            <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStepId === 'verification') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-beet-blue/5 border border-beet-blue/20 rounded-2xl mb-4">
                        <p className="text-[10px] text-beet-blue font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> Selo de Verificação
                        </p>
                        <p className="text-[11px] text-beet-gray mt-2">
                            Empresas verificadas têm maior credibilidade perante os artistas e desbloqueiam o envio direto de propostas oficiais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">CNPJ</label>
                            <input type="text" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-2">Nome do Responsável</label>
                            <input type="text" name="responsibleName" value={formData.responsibleName || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-blue outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] text-white font-bold mb-2">Doc. do Responsável (RG/CNH)</p>
                            <input type="file" id="doc-resp" className="hidden" onChange={(e) => handleFileUpload(e, 'responsibleDocUrl')} />
                            <label htmlFor="doc-resp" className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                                {uploading.responsibleDocUrl ? 'Enviando...' : (formData.responsibleDocUrl ? '✅ Alterar' : '📤 Upload PDF/JPG')}
                            </label>
                        </div>
                        <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] text-white font-bold mb-2">Comprovante Empresarial (Contrato Social)</p>
                            <input type="file" id="doc-biz" className="hidden" onChange={(e) => handleFileUpload(e, 'businessDocUrl')} />
                            <label htmlFor="doc-biz" className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                                {uploading.businessDocUrl ? 'Enviando...' : (formData.businessDocUrl ? '✅ Alterar' : '📤 Upload PDF/JPG')}
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStepId === 'scouting') {
            return (
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">O que você busca?</label>
                        <div className="flex flex-wrap gap-2">
                            {ARTIST_TYPES_SOUGHT.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleMultiSelect('scoutingInterests', type)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${(formData.scoutingInterests || []).includes(type)
                                            ? 'bg-beet-blue border-beet-blue text-white'
                                            : 'bg-white/5 border-white/10 text-beet-muted hover:border-white/20'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">Objetivo Principal</label>
                        <div className="flex flex-wrap gap-2">
                            {SCOUTING_OBJECTIVES.map(obj => (
                                <button
                                    key={obj}
                                    type="button"
                                    onClick={() => setFormData((prev: any) => ({ ...prev, scoutingGoal: obj }))}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.scoutingGoal === obj
                                            ? 'bg-beet-blue border-beet-blue text-white'
                                            : 'bg-white/5 border-white/10 text-beet-muted hover:border-white/20'
                                        }`}
                                >
                                    {obj}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-widest mb-3">Faixa de Contratação (Tier)</label>
                        <div className="flex flex-wrap gap-2">
                            {['Independente/Iniciante', 'Em Ascensão', 'Profissional/Regional', 'Top Talentos/Nacional'].map(tier => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => handleMultiSelect('scoutingTier', tier)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${(formData.scoutingTier || []).includes(tier)
                                            ? 'bg-beet-blue border-beet-blue text-white'
                                            : 'bg-white/5 border-white/10 text-beet-muted hover:border-white/20'
                                        }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup Institucional & Scouting">
            <div className="flex flex-col h-full max-h-[85vh]">
                {/* Stepper */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-white/5">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveStep(idx)}
                            className={`flex flex-col items-center gap-2 min-w-[80px] transition-all ${activeStep === idx ? 'text-beet-blue' : 'text-beet-muted hover:text-white'}`}
                        >
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all ${activeStep === idx ? 'bg-beet-blue/10 border-beet-blue shadow-[0_0_15px_rgba(0,132,255,0.2)]' : 'bg-beet-dark border-white/5'}`}>
                                {step.icon}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-center">{step.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 mb-8">
                        {renderStepContent()}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                            {activeStep > 0 && (
                                <button type="button" onClick={() => setActiveStep(s => s - 1)} className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-10 rounded-xl bg-beet-blue text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-beet-blue/10 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Spinner size="sm" /> : (activeStep < steps.length - 1 ? <>Próximo <ChevronRight size={16} /></> : <><Save size={16} /> Salvar Perfil</>)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
