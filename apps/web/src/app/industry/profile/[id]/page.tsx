'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type IndustryProfile } from '@/lib/store';
import { Avatar, Skeleton, EmptyState } from '@/components/ui';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { api } from '@/lib/api';

export default function IndustryProfilePage() {
    useAuthGuard();
    const params = useParams<{ id: string }>();
    const { currentUser, industryProfile: myProfile, updateIndustryProfile } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<IndustryProfile | null>(null);
    const [uploading, setUploading] = useState<{ logo?: boolean; cover?: boolean }>({});
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const isSelf = params.id === 'me' || (currentUser && params.id === currentUser.id) || (myProfile && params.id === myProfile.id);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                if (isSelf || params.id === 'me') {
                    setProfile(myProfile);
                } else {
                    // Fallback for public profile if id matches current profile id
                    if (myProfile && params.id === myProfile.id) {
                        setProfile(myProfile);
                    }
                }
            } catch (err) {
                console.error('Error fetching industry profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [params.id, isSelf, myProfile]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const { url } = await api.upload(file);
            await updateIndustryProfile({ [type === 'logo' ? 'logoUrl' : 'coverUrl']: url });
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            alert(`Erro ao carregar ${type}. Tente novamente.`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <div className="flex gap-4 items-end -mt-12 ml-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2 mb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-40 rounded-xl" />
        </div>
    );

    if (!profile) return (
        <EmptyState icon="🏢" title="Perfil não encontrado" 
            action={<button onClick={() => router.back()} className="btn-outline text-sm">Voltar</button>} />
    );

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
            {/* Cover */}
            <div className="relative mb-6">
                <div 
                    className={`h-40 rounded-xl bg-beet-dark overflow-hidden group ${isSelf ? 'cursor-pointer' : ''}`}
                    onClick={() => isSelf && coverInputRef.current?.click()}
                >
                    {profile.coverUrl ? (
                        <img src={api.getMediaUrl(profile.coverUrl)} className="w-full h-full object-cover" alt="Banner" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-beet-dark to-beet-card" style={{ background: `linear-gradient(135deg, rgba(0,0,255,0.1) 0%, rgba(0,0,0,0) 60%), #121212` }} />
                    )}
                    
                    {isSelf && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {uploading.cover ? 'Carregando...' : '📷 Alterar Banner'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute -bottom-8 left-5 group">
                    <div 
                        className={`relative ${isSelf ? 'cursor-pointer' : ''}`}
                        onClick={() => isSelf && logoInputRef.current?.click()}
                    >
                        <Avatar name={profile.companyName} imageUrl={profile.logoUrl} size="xl" emoji="🏢" />
                        {isSelf && (
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-4 border-beet-dark">
                                <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                                    {uploading.logo ? '...' : 'Trocar'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isSelf && (
                    <>
                        <div className="hidden">
                            <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                            <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                        </div>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10"
                        >
                            ✏️ Editar perfil
                        </button>
                    </>
                )}
            </div>

            <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

            {/* Info */}
            <div className="mb-5 pl-1 pt-9">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-2xl font-black text-white">{profile.companyName}</h1>
                            <span className="beet-pill text-[10px] bg-beet-blue/20 text-beet-blue border-beet-blue/30 uppercase tracking-tighter">{profile.type}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-beet-muted">📍 {profile.city || 'Cidade não informada'}, {profile.state}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {(profile.niches || []).map((n) => <span key={n} className="beet-pill text-xs">{n}</span>)}
                        </div>
                    </div>
                </div>
                {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-beet-blue hover:underline">
                        🔗 {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                )}
            </div>

            <div className="beet-card p-6">
                <p className="section-title mb-4">Sobre a Empresa</p>
                <p className="text-sm text-beet-gray leading-relaxed">
                    Esta é uma conta de Indústria no BeatBR. Empresas e profissionais podem descobrir talentos, enviar propostas e gerenciar contratos.
                </p>
            </div>
        </div>
    );
}
