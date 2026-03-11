'use client';
import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { Avatar, Skeleton } from '@/components/ui';
import { BadgeCheck, Camera, Edit3, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

interface IndustryHeaderProps {
    profile: any;
    isSelf: boolean;
    onEdit?: () => void;
}

export function IndustryHeader({ profile, isSelf, onEdit }: IndustryHeaderProps) {
    const { updateIndustryProfile, addToast } = useStore();
    const [uploading, setUploading] = useState<{ logo?: boolean; cover?: boolean }>({});
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const { url } = await api.upload(file);
            await updateIndustryProfile({ [type === 'logo' ? 'logoUrl' : 'coverUrl']: url });
            addToast({ message: `${type === 'logo' ? 'Logo' : 'Banner'} atualizado com sucesso!`, type: 'success' });
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            addToast({ message: `Erro ao carregar ${type}. Tente novamente.`, type: 'error' });
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <div className="relative">
            {/* Banner / Cover - 4:1 Ratio Optimized */}
            <div
                className={`relative h-[250px] md:h-[350px] lg:h-[400px] w-full overflow-hidden bg-beet-dark group ${isSelf ? 'cursor-pointer' : ''}`}
                onClick={() => isSelf && coverInputRef.current?.click()}
            >
                {profile.coverUrl ? (
                    <img
                        src={api.getMediaUrl(profile.coverUrl)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Company Banner"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/5 font-display text-8xl font-black uppercase tracking-tighter select-none">
                                {profile.companyName}
                            </span>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-beet-black via-transparent to-transparent opacity-60" />

                {isSelf && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
                            <Camera size={14} />
                            {uploading.cover ? 'Enviando...' : 'Alterar Banner Institucional'}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-24 md:-mt-32 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
                        {/* Logo */}
                        <div className="relative group self-start">
                            <div
                                className={`h-32 w-32 md:h-44 md:w-44 rounded-3xl overflow-hidden border-4 border-beet-black shadow-2xl bg-beet-card flex items-center justify-center ${isSelf ? 'cursor-pointer' : ''}`}
                                onClick={() => isSelf && logoInputRef.current?.click()}
                            >
                                {profile.logoUrl ? (
                                    <img src={api.getMediaUrl(profile.logoUrl)} className="w-full h-full object-cover" alt="Logo" />
                                ) : (
                                    <span className="text-4xl md:text-6xl text-beet-blue/20 font-black">{profile.companyName?.[0]}</span>
                                )}

                                {isSelf && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="text-white text-[10px] font-black uppercase tracking-widest text-center px-2">
                                            {uploading.logo ? '...' : 'Trocar Logo'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Verification Badge */}
                            {profile.verificationStatus === 'VERIFIED' && (
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute -top-3 -right-3 h-10 w-10 bg-beet-blue rounded-full flex items-center justify-center border-4 border-beet-black shadow-lg"
                                    title="Empresa Verificada"
                                >
                                    <BadgeCheck size={20} className="text-white" />
                                </motion.div>
                            )}
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 space-y-4 mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                                            {profile.companyName}
                                        </h1>
                                        {profile.verificationStatus === 'VERIFIED' && (
                                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-beet-blue/10 border border-beet-blue/20 rounded-full text-[10px] font-black text-beet-blue uppercase tracking-widest">
                                                <BadgeCheck size={12} /> Verificado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-beet-muted text-sm font-medium">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-beet-blue" />
                                            {profile.city || 'Cidade'}, {profile.state || 'UF'}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-white/20" />
                                        <span className="text-beet-blue uppercase tracking-widest text-[10px] font-black">{profile.type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isSelf ? (
                                        <button
                                            onClick={onEdit}
                                            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            <Edit3 size={14} /> Editar Institucional
                                        </button>
                                    ) : (
                                        <button className="px-8 py-2.5 bg-beet-blue text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-beet-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                            Seguir Empresa
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Main Metrics Bar */}
                            <div className="flex flex-wrap gap-8 pt-2">
                                <div className="space-y-0.5">
                                    <p className="text-beet-muted text-[10px] font-black uppercase tracking-widest">Artistas Monitorados</p>
                                    <p className="text-2xl font-display font-black text-white">{profile.followedArtistsCount || 0}</p>
                                </div>
                                <div className="w-px h-10 bg-white/5 hidden sm:block" />
                                <div className="space-y-0.5">
                                    <p className="text-beet-muted text-[10px] font-black uppercase tracking-widest">Propostas Enviadas</p>
                                    <p className="text-2xl font-display font-black text-white">{profile.proposalsSentCount || 0}</p>
                                </div>
                                <div className="w-px h-10 bg-white/5 hidden sm:block" />
                                <div className="space-y-0.5">
                                    <p className="text-beet-muted text-[10px] font-black uppercase tracking-widest">Contratos Fechados</p>
                                    <p className="text-2xl font-display font-black text-white">{profile.contractsClosedCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Inputs */}
            {isSelf && (
                <div className="hidden">
                    <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                    <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                </div>
            )}
        </div>
    );
}
