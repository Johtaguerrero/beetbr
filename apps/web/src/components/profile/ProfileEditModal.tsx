'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Modal, Spinner, SectionTitle } from '@/components/ui';
import { Save, User, Music, MapPin, Briefcase, Share2, FileText, ChevronRight, ChevronLeft, Upload, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PROFESSIONAL_QUESTIONS_LABELS, QUESTION_VALUE_LABELS } from '@/app/artist/profile/[id]/page';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const { currentUser, artistProfile, industryProfile, updateArtistProfile, updateIndustryProfile, artists } = useStore();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUploading, setPdfUploading] = useState(false);

    const isArtist = currentUser?.role === 'ARTIST';
    // If viewing own profile as artist, use artistProfile from store or find in artists
    const profile = isArtist ? artistProfile : industryProfile;

    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                ...profile,
                genres: Array.isArray((profile as any).genres) ? (profile as any).genres : [],
                subGenres: Array.isArray((profile as any).subGenres) ? (profile as any).subGenres : [],
                professionalQuestions: (profile as any).professionalQuestions || {},
                socialProofs: (profile as any).socialProofs || {
                    collaboratedArtists: [],
                    venuesPlayed: [],
                    festivals: [],
                    partnerBrands: [],
                    testimonials: []
                }
            });
            setActiveStep(0);
        }
    }, [isOpen, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: val }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: val }));
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('O PDF deve ter no máximo 10MB.');
            return;
        }

        setPdfFile(file);
        setPdfUploading(true);
        try {
            const result = await api.uploadMedia(file, 'portfolio');
            if (result.url) {
                setFormData((prev: any) => ({ ...prev, portfolioPdfUrl: result.url }));
            }
        } catch (error) {
            console.error('Error uploading pdf:', error);
        } finally {
            setPdfUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isArtist) {
                await updateArtistProfile(formData);
            } else {
                await updateIndustryProfile(formData);
            }
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = isArtist ? [
        { id: 'identity', label: 'Identidade', icon: <User size={16} /> },
        { id: 'classification', label: 'Classificação', icon: <Music size={16} /> },
        { id: 'roles', label: 'Atuação', icon: <Briefcase size={16} /> },
        { id: 'business', label: 'Negócios', icon: <Briefcase size={16} /> },
        { id: 'social', label: 'Redes', icon: <Share2 size={16} /> },
        { id: 'portfolio', label: 'PDF', icon: <FileText size={16} /> }
    ] : [
        { id: 'identity', label: 'Empresa', icon: <User size={16} /> },
        { id: 'social', label: 'Redes', icon: <Share2 size={16} /> }
    ];

    if (!profile) return null;

    const renderStepContent = () => {
        const currentStepId = steps[activeStep]?.id;

        if (currentStepId === 'identity') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Nome Artístico</label>
                            <input type="text" name="stageName" value={formData.stageName || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" placeholder="Ex: DJ Beet" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Nome Real (Privado)</label>
                            <input type="text" name="realName" value={formData.realName || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Pronomens</label>
                        <input type="text" name="pronouns" value={formData.pronouns || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" placeholder="Ex: Ele/Dele" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Bio Curta (Intro)</label>
                        <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={2} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none resize-none" placeholder="Uma frase impactante..." />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Bio Completa (Sobre)</label>
                        <textarea name="bioFull" value={formData.bioFull || ''} onChange={handleChange} rows={5} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none resize-none" />
                    </div>
                </div>
            );
        }

        if (currentStepId === 'classification') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-3">Tipo de Artista</label>
                        <select name="artistType" value={formData.artistType || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none appearance-none">
                            <option value="SOLO">Solo</option>
                            <option value="BANDA">Banda / Grupo</option>
                            <option value="DUO">Duo</option>
                            <option value="DJ">DJ</option>
                            <option value="COLETIVO">Coletivo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Gêneros (Vírgula)</label>
                        <input
                            type="text"
                            value={(formData.genres || []).join(', ')}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                            className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Estilos / Sub-gêneros</label>
                        <input
                            type="text"
                            value={(formData.subGenres || []).join(', ')}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, subGenres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                            className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none"
                        />
                    </div>
                </div>
            );
        }

        if (currentStepId === 'roles') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Atuação Principal</label>
                            <input type="text" name="primaryRole" value={formData.primaryRole || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" placeholder="Ex: Vocalista" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Lvl / Exp (Anos)</label>
                            <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Cidade</label>
                            <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">Estado (UF)</label>
                            <input type="text" name="state" value={formData.state || ''} onChange={handleChange} maxLength={2} className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none uppercase" />
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStepId === 'business') {
            return (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(PROFESSIONAL_QUESTIONS_LABELS).map(key => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-white pr-4">{PROFESSIONAL_QUESTIONS_LABELS[key]}</span>
                            <select
                                value={formData.professionalQuestions?.[key] || ''}
                                onChange={(e) => setFormData((prev: any) => ({
                                    ...prev,
                                    professionalQuestions: { ...prev.professionalQuestions, [key]: e.target.value }
                                }))}
                                className="bg-beet-black border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-beet-accent font-black uppercase tracking-widest outline-none"
                            >
                                <option value="">-</option>
                                {Object.entries(QUESTION_VALUE_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            );
        }

        if (currentStepId === 'social') {
            return (
                <div className="space-y-3">
                    {[
                        { name: 'instagram', label: 'Instagram', placeholder: '@usuario' },
                        { name: 'spotifyUrl', label: 'Spotify', placeholder: 'Link artista' },
                        { name: 'youtubeUrl', label: 'YouTube', placeholder: 'Canal/Vídeo' },
                        { name: 'tiktokUrl', label: 'TikTok', placeholder: '@usuario' },
                        { name: 'linkedinUrl', label: 'LinkedIn', placeholder: 'Perfil' },
                        { name: 'website', label: 'Website Oficial', placeholder: 'https://...' },
                    ].map(social => (
                        <div key={social.name}>
                            <label className="block text-[10px] font-black text-beet-muted uppercase tracking-[0.2em] mb-2">{social.label}</label>
                            <input
                                type="text"
                                name={social.name}
                                value={formData[social.name] || ''}
                                onChange={handleChange}
                                placeholder={social.placeholder}
                                className="w-full bg-beet-dark/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-beet-accent outline-none"
                            />
                        </div>
                    ))}
                </div>
            );
        }

        if (currentStepId === 'portfolio') {
            return (
                <div className="space-y-6">
                    <div className="p-6 bg-beet-dark/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-beet-accent/30 transition-all">
                        <div className="h-16 w-16 bg-beet-accent/10 rounded-2xl flex items-center justify-center text-3xl mb-4 text-beet-accent">
                            {pdfUploading ? <Spinner size="md" /> : <FileText />}
                        </div>
                        <p className="text-sm text-white font-bold">Portfólio Profissional (PDF)</p>
                        <p className="text-[10px] text-beet-muted mt-1 max-w-[200px]">Arraste ou clique para subir seu release completo (PDF, máx 10MB)</p>
                        <input type="file" accept=".pdf" className="hidden" id="pdf-upload" onChange={handlePdfUpload} disabled={pdfUploading} />
                        <label htmlFor="pdf-upload" className="mt-6 btn-white px-6 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                            {formData.portfolioPdfUrl ? '🚀 Alterar PDF' : '📤 Upload PDF'}
                        </label>
                        {formData.portfolioPdfUrl && (
                            <div className="mt-4 flex items-center gap-2 text-[9px] text-beet-accent font-black uppercase bg-beet-accent/10 px-3 py-1.5 rounded-full border border-beet-accent/20">
                                <span>✅ Arquivo Confirmado</span>
                                <button onClick={() => setFormData((prev: any) => ({ ...prev, portfolioPdfUrl: undefined }))} className="text-red-400 hover:text-red-500">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-beet-blue/5 border border-beet-blue/20 rounded-2xl">
                        <p className="text-[10px] text-beet-blue font-black uppercase tracking-widest flex items-center gap-2">
                            💡 Dica Pro
                        </p>
                        <p className="text-[11px] text-beet-gray mt-2 leading-relaxed">
                            Artistas com portfólio PDF anexo têm 65% mais chances de serem contratados por agências premium no Beeat.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ecossistema Artístico (Setup)">
            <div className="flex flex-col h-full max-h-[85vh]">
                {/* Stepper horizontal (Scrollable no mobile) */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-white/5">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveStep(idx)}
                            className={`flex flex-col items-center gap-1 min-w-[70px] transition-all ${activeStep === idx ? 'text-beet-accent' : 'text-beet-muted hover:text-white'}`}
                        >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${activeStep === idx ? 'bg-beet-accent/10 border-beet-accent shadow-[0_0_10px_rgba(0,255,102,0.2)]' : 'bg-beet-dark border-white/5'}`}>
                                {step.icon}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest">{step.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 mb-8">
                        {renderStepContent()}
                    </div>

                    {/* Footer fixo no modal */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                            {activeStep > 0 && (
                                <button type="button" onClick={() => setActiveStep(s => s - 1)} className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {activeStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(s => s + 1)}
                                    className="h-12 px-6 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 flex items-center gap-2"
                                >
                                    Próximo <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading || pdfUploading}
                                    className="h-12 px-10 rounded-xl bg-beet-accent text-beet-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Spinner size="sm" /> : <><Save size={16} /> Finalizar Setup</>}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
