'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Modal, Spinner } from '@/components/ui';
import { Save } from 'lucide-react';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const { currentUser, artistProfile, industryProfile, updateArtistProfile, updateIndustryProfile } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const isArtist = currentUser?.role === 'ARTIST';
    const profile = isArtist ? artistProfile : industryProfile;

    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                ...profile,
                // Ensure arrays don't crash if they are comma strings in some old state
                genres: Array.isArray((profile as any).genres) ? (profile as any).genres : [],
                niches: Array.isArray((profile as any).niches) ? (profile as any).niches : [],
            });
        }
    }, [isOpen, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
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

    if (!profile) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
            <form onSubmit={handleSave} className="space-y-4">
                {/* Nome / Stage Name */}
                <div>
                    <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                        {isArtist ? 'Nome Artístico' : 'Nome da Empresa'}
                    </label>
                    <input
                        type="text"
                        name={isArtist ? 'stageName' : 'companyName'}
                        value={isArtist ? formData.stageName || '' : formData.companyName || ''}
                        onChange={handleChange}
                        className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors"
                        required
                    />
                </div>

                {/* Bio / Description */}
                {isArtist && (
                    <div>
                        <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                            Biografia
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors resize-none"
                        />
                    </div>
                )}

                {/* Location Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                            Cidade
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                            Estado (UF)
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state || ''}
                            onChange={handleChange}
                            maxLength={2}
                            className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors uppercase"
                        />
                    </div>
                </div>

                {/* Genres / Niches (Comma separated for easy editing in this modal) */}
                <div>
                    <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                        {isArtist ? 'Gêneros (separados por vírgula)' : 'Nichos (separados por vírgula)'}
                    </label>
                    <input
                        type="text"
                        value={isArtist ? (formData.genres || []).join(', ') : (formData.niches || []).join(', ')}
                        onChange={(e) => {
                            const val = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                            setFormData((prev: any) => ({ ...prev, [isArtist ? 'genres' : 'niches']: val }));
                        }}
                        className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors"
                    />
                </div>

                {/* Social / Web */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                            Instagram
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted">@</span>
                            <input
                                type="text"
                                name="instagram"
                                value={(formData.instagram || '').replace('@', '')}
                                onChange={(e) => {
                                    const val = e.target.value ? `@${e.target.value.replace('@', '')}` : '';
                                    setFormData((prev: any) => ({ ...prev, instagram: val }));
                                }}
                                className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg pl-8 pr-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors"
                                placeholder="usuario"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-bold text-beet-muted uppercase tracking-widest mb-1.5">
                            Website
                        </label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website || ''}
                            onChange={handleChange}
                            className="w-full bg-beet-black/40 border border-beet-nav-border rounded-lg px-4 py-2.5 text-white focus:border-beet-accent outline-none transition-colors"
                            placeholder="https://exemplo.com"
                        />
                    </div>
                </div>

                {/* Artist specific toggles */}
                {isArtist && (
                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            name="availableForBooking"
                            id="availableForBooking"
                            checked={formData.availableForBooking || false}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-beet-nav-border bg-beet-black text-beet-accent focus:ring-beet-accent"
                        />
                        <label htmlFor="availableForBooking" className="text-sm text-white font-medium cursor-pointer">
                            Disponível para contratação
                        </label>
                    </div>
                )}

                {/* Submit */}
                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold py-3 rounded-lg border border-beet-nav-border transition-all uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-beet-accent hover:bg-beet-accent-glow text-beet-black font-mono text-xs font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? <Spinner size="sm" /> : <><Save size={16} /> Salvar Alterações</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
