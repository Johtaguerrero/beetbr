'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore } from '@/lib/store';
import { Skeleton, EmptyState } from '@/components/ui';
import { IndustryHeader } from '@/components/industry/IndustryHeader';
import { IndustryEditModal } from '@/components/industry/IndustryEditModal';
import { api } from '@/lib/api';
import {
    Info, Users, Target, FileText,
    Instagram, Globe, Linkedin, Youtube, MessageCircle, Mail, MapPin
} from 'lucide-react';

export default function IndustryProfilePage() {
    useAuthGuard();
    const params = useParams<{ id: string }>();
    const { currentUser, industryProfile: myProfile } = useStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'about' | 'scouting' | 'history'>('about');

    const isSelf = !!(params.id === 'me' || (currentUser && params.id === currentUser.id) || (myProfile && params.id === myProfile.id));

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                if (isSelf) {
                    setProfile(myProfile);
                } else {
                    // In a real app, fetch public profile by ID
                    // For now, if we can't find it, show empty
                }
            } catch (err) {
                console.error('Error fetching industry profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [params.id, isSelf, myProfile]);

    if (loading) return (
        <div className="min-h-screen bg-beet-black">
            <Skeleton className="h-[350px] w-full" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
                <div className="flex gap-6 items-end">
                    <Skeleton className="h-44 w-44 rounded-3xl" />
                    <div className="space-y-4 flex-1">
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-6 w-1/4" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        </div>
    );

    if (!profile) return (
        <EmptyState icon="🏢" title="Perfil Corporativo não encontrado"
            action={<button onClick={() => router.back()} className="btn-outline text-sm">Voltar</button>} />
    );

    return (
        <div className="min-h-screen bg-beet-black pb-24 lg:pb-12">
            <IndustryHeader
                profile={profile}
                isSelf={isSelf}
                onEdit={() => setIsEditModalOpen(true)}
            />

            <IndustryEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / Left Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Contact & Socials Card */}
                        <div className="beet-card p-6 border-beet-blue/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-beet-blue mb-4">Canais Oficiais</h3>
                            <div className="space-y-4">
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-3 text-sm text-beet-gray hover:text-white transition-colors group">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-beet-blue/10 group-hover:text-beet-blue">
                                            <Globe size={16} />
                                        </div>
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                {profile.email && (
                                    <div className="flex items-center gap-3 text-sm text-beet-gray">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Mail size={16} />
                                        </div>
                                        {profile.email}
                                    </div>
                                )}
                                {profile.whatsapp && (
                                    <div className="flex items-center gap-3 text-sm text-beet-gray">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-green-500">
                                            <MessageCircle size={16} />
                                        </div>
                                        {profile.whatsapp}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                                {profile.instagram && (
                                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-beet-blue/10 hover:text-beet-blue transition-all border border-white/5">
                                        <Instagram size={18} />
                                    </a>
                                )}
                                {profile.youtubeUrl && (
                                    <a href={profile.youtubeUrl} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-beet-blue/10 hover:text-beet-blue transition-all border border-white/5">
                                        <Youtube size={18} />
                                    </a>
                                )}
                                {profile.linkedin && (
                                    <a href={profile.linkedin} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-beet-blue/10 hover:text-beet-blue transition-all border border-white/5">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="beet-card p-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-beet-blue mb-4">Sede Operacional</h3>
                            <div className="flex items-center gap-3 text-sm text-beet-gray">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <MapPin size={20} className="text-beet-blue" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{profile.city || 'Cidade'}</p>
                                    <p className="text-[10px] uppercase tracking-widest">{profile.state || 'UF'}, Brasil</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content / Right Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-white/5">
                            {[
                                { id: 'about', label: 'Sobre', icon: <Info size={14} /> },
                                { id: 'scouting', label: 'Scouting', icon: <Target size={14} /> },
                                { id: 'history', label: 'Histórico', icon: <FileText size={14} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'text-beet-blue' : 'text-beet-muted hover:text-white'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-beet-blue" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div className="beet-card p-8 bg-gradient-to-br from-beet-card to-beet-black/40">
                                            <h2 className="text-xl font-display font-black text-white mb-4">Perfil Institucional</h2>
                                            <p className="text-beet-gray leading-relaxed whitespace-pre-wrap">
                                                {profile.descriptionFull || profile.descriptionShort || 'Nenhuma descrição fornecida até o momento.'}
                                            </p>

                                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div>
                                                    <p className="text-[10px] text-beet-muted font-black uppercase tracking-widest mb-1">Nicho Principal</p>
                                                    <span className="text-sm font-bold text-white">{profile.mainNiche || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-beet-muted font-black uppercase tracking-widest mb-1">Tipo</p>
                                                    <span className="text-sm font-bold text-white uppercase">{profile.type}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-beet-muted font-black uppercase tracking-widest mb-1">Status</p>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${profile.verificationStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-500' : 'bg-beet-muted/20 text-beet-muted'
                                                        }`}>
                                                        {profile.verificationStatus === 'VERIFIED' ? 'Verificada' : 'Aguardando'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Complementary Niches */}
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-beet-muted">Áreas de Atuação</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(profile.complementaryNiches || ['Distribuição', 'Agenciamento', 'Booking']).map((n: string) => (
                                                    <span key={n} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-beet-gray">
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'scouting' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="beet-card p-6 bg-beet-blue/5 border-beet-blue/10">
                                                <div className="h-10 w-10 rounded-xl bg-beet-blue/10 flex items-center justify-center text-beet-blue mb-4">
                                                    <Target size={20} />
                                                </div>
                                                <h3 className="font-display font-black text-white text-lg">Objetivo de Scouting</h3>
                                                <p className="text-sm text-beet-gray mt-2 leading-relaxed">
                                                    {profile.scoutingGoal || 'Buscando novos talentos para o mercado nacional.'}
                                                </p>
                                            </div>
                                            <div className="beet-card p-6 bg-white/5 border-white/10">
                                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                                                    <Users size={20} />
                                                </div>
                                                <h3 className="font-display font-black text-white text-lg">Perfis Buscados</h3>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(profile.scoutingInterests || ['Cantores', 'MC', 'DJs']).map((i: string) => (
                                                        <span key={i} className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md border border-white/10 text-beet-muted uppercase tracking-wider">{i}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="beet-card p-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-beet-blue mb-4">Gêneros de Interesse</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {(profile.scoutingGenres || ['Trap', 'Pop', 'Hip Hop']).map((g: string) => (
                                                    <div key={g} className="flex flex-col gap-1">
                                                        <span className="text-sm font-bold text-white">{g}</span>
                                                        <div className="h-1 w-12 bg-beet-blue rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="beet-card p-12 text-center flex flex-col items-center justify-center">
                                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50 grayscale">
                                            📜
                                        </div>
                                        <h3 className="font-bold text-white">Memória Institucional</h3>
                                        <p className="text-sm text-beet-muted mt-2 max-w-sm">
                                            O histórico de parcerias, propostas e negociações concluídas será exibido aqui conforme sua atividade na plataforma crescer.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
