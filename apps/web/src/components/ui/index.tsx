'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Flame, Heart, Music, Zap, Star, CheckCircle, Coffee, Rocket, Smile, X } from 'lucide-react';

// ── Loading Spinner ───────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' };
    return (
        <div
            className={`animate-spin rounded-full border-t-transparent ${sizes[size]}`}
            style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex h-screen items-center justify-center bg-beet-black">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-beet-muted animate-pulse">Carregando...</p>
            </div>
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

// ── Empty state ───────────────────────────────────────────────
interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-4xl" style={{ background: 'var(--color-accent-dim)' }}>
                {icon}
            </div>
            <div>
                <p className="text-lg font-semibold text-white">{title}</p>
                {description && <p className="mt-1 text-sm text-beet-muted">{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </motion.div>
    );
}

// ── Score Beet Badge ──────────────────────────────────────────
export function ScoreBeetBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
    const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
    return (
        <span className={`score-badge ${textSizes[size]}`}>
            🐝 {Math.round(score)}
        </span>
    );
}

// ── Status Badge ──────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    SENT: { label: 'Nova', className: 'status-new' },
    VIEWED: { label: 'Visualizada', className: 'status-new' },
    NEGOTIATING: { label: 'Em negociação', className: 'status-neg' },
    ACCEPTED: { label: 'Aceita', className: 'status-acc' },
    REJECTED: { label: 'Recusada', className: 'status-rej' },
    CANCELLED: { label: 'Cancelada', className: 'status-rej' },
    EXPIRED: { label: 'Expirada', className: 'status-rej' },
    DRAFT: { label: 'Rascunho', className: 'status-neg' },
};

export function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || { label: status, className: 'status-new' };
    return <span className={cfg.className}>{cfg.label}</span>;
}

import { api } from '@/lib/api';

// ── Avatar ────────────────────────────────────────────────────
interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    emoji?: string;
    imageUrl?: string | null;
    isIndustry?: boolean;
}
export function Avatar({ name, size = 'md', emoji = '🎤', imageUrl, isIndustry = false }: AvatarProps) {
    const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl', xl: 'h-20 w-20 text-3xl' };
    const bg = isIndustry ? 'rgba(0,87,255,0.15)' : 'rgba(0,255,102,0.15)';
    
    // Resolve full URL
    const fullUrl = api.getMediaUrl(imageUrl);
    const [imgError, setImgError] = useState(false);
    
    // Get initials for fallback
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div 
            className={`flex flex-shrink-0 items-center justify-center rounded-full overflow-hidden ${sizes[size]} relative`} 
            style={{ 
                background: bg,
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 0 12px rgba(0,0,0,0.2)'
            }}
        >
            {fullUrl && !imgError ? (
                <img 
                    src={fullUrl} 
                    alt={name} 
                    className="h-full w-full object-cover" 
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="font-bold tracking-tight opacity-80" style={{ fontSize: size === 'xl' ? '24px' : size === 'lg' ? '18px' : '12px' }}>
                    {name ? initials : emoji}
                </span>
            )}
            
            {/* Status indicator or glow could go here */}
            {isIndustry && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[var(--color-bg)] bg-beet-blue" style={{ boxShadow: '0 0 8px var(--color-blue)' }} title="Indústria" />
            )}
        </div>
    );
}

// ── Genre Pill ────────────────────────────────────────────────
export function GenrePill({ genre, active, onClick }: { genre: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`beet-pill cursor-pointer transition-all ${active ? 'active' : ''}`}
        >
            {genre}
        </button>
    );
}

// ── Waveform (animated) ───────────────────────────────────────
export function Waveform({ bars = 20, playing = false }: { bars?: number; playing?: boolean }) {
    return (
        <div className="flex h-8 items-end gap-0.5 w-full">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={`waveform-bar flex-1 rounded-sm ${playing ? '' : 'paused'}`}
                    style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.06}s` }}
                />
            ))}
        </div>
    );
}

// ── Track Player ──────────────────────────────────────────────
export const TrackPlayer = forwardRef<HTMLAudioElement, { title?: string; url?: string; mediaRef?: React.Ref<HTMLAudioElement> }>(({ title, url, mediaRef }, ref) => {
    const internalRef = useRef<HTMLAudioElement>(null);
    const audioRef = (mediaRef as React.RefObject<HTMLAudioElement>) || internalRef;

    // Fallback if mediaRef isn't provided directly but via forwardRef
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Sync play state if external autoplay hits
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [audioRef]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(err => console.error("Play prevented", err));
            }
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex flex-col gap-2 rounded-[4px] bg-[var(--color-card)] border border-[var(--color-nav-border)] p-3">
            <div className="flex flex-1 flex-col gap-1.5 w-full">
                {title && <p className="text-[14px] font-bold text-white font-['Space_Grotesk'] leading-tight">{title}</p>}

                <audio ref={audioRef} src={api.getMediaUrl(url)} preload="metadata" className="hidden" />

                <div className="flex items-center gap-3 w-full">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-black transition-transform hover:scale-105 active:scale-95 z-10"
                        style={{ background: 'var(--color-accent)' }}
                    >
                        {isPlaying ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                    </button>

                    {/* Timeline & Waveform Container */}
                    <div
                        className="relative flex-1 h-10 cursor-pointer flex items-center overflow-hidden rounded-sm bg-black/20"
                        onClick={handleSeek}
                    >
                        {/* The Waveform - slightly faded inside the dark area */}
                        <div className="absolute inset-0 opacity-40 px-1 pointer-events-none flex items-center justify-center">
                            <Waveform bars={30} playing={isPlaying} />
                        </div>

                        {/* Progress Bar (Fill) Overlay */}
                        <div
                            className="absolute left-0 top-0 bottom-0 pointer-events-none"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.4))',
                                borderRight: '2px solid var(--color-accent)',
                                transition: 'width 0.1s linear'
                            }}
                        />

                        {/* Timestamps superimposed */}
                        <div className="absolute inset-0 flex justify-between items-end px-2 pb-1 pointer-events-none text-[9px] font-bold font-['Space_Mono'] text-[var(--color-muted)] leading-none">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
TrackPlayer.displayName = 'TrackPlayer';

// ── Section title ─────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
    return <p className="section-title">{children}</p>;
}

// ── Divider ───────────────────────────────────────────────────
export function Divider() {
    return <div className="my-4 border-t" style={{ borderColor: 'var(--color-border)' }} />;
}

// ── Toggle switch ─────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className="relative h-5 w-9 rounded-full transition-all duration-200"
            style={{ background: checked ? 'var(--color-accent)' : 'var(--color-border)' }}
        >
            <div
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
                style={{ left: checked ? '18px' : '2px' }}
            />
        </button>
    );
}

// ── Custom Branded Emojis ─────────────────────────────────────
export const CUSTOM_EMOJIS: Record<string, React.ReactNode> = {
    ':fogo:': <Flame size={16} fill="var(--color-accent)" color="var(--color-accent)" />,
    ':coracao:': <Heart size={16} fill="var(--color-accent)" color="var(--color-accent)" />,
    ':musica:': <Music size={16} color="var(--color-accent)" />,
    ':raio:': <Zap size={16} fill="var(--color-accent)" color="var(--color-accent)" />,
    ':estrela:': <Star size={16} fill="var(--color-accent)" color="var(--color-accent)" />,
    ':rock:': <Rocket size={16} fill="var(--color-accent)" color="var(--color-accent)" />,
    ':cafe:': <Coffee size={16} color="var(--color-accent)" />,
    ':check:': <CheckCircle size={16} color="var(--color-accent)" />
};

export function RenderTextWithEmojis({ text }: { text: string }) {
    if (!text) return null;

    // Pattern matches any of our shortcodes
    const pattern = new RegExp(`(${Object.keys(CUSTOM_EMOJIS).join('|')})`, 'g');
    const parts = text.split(pattern);

    return (
        <span className="inline-flex items-center flex-wrap" style={{ gap: '2px' }}>
            {parts.map((part, i) => {
                if (CUSTOM_EMOJIS[part]) {
                    return <span key={i} className="inline-flex align-middle relative overflow-hidden rounded-full p-0.5" style={{ background: 'var(--color-glass-btn)' }}>{CUSTOM_EMOJIS[part]}</span>;
                }
                return <span key={i} className="whitespace-pre-wrap">{part}</span>;
            })}
        </span>
    );
}

export function CustomEmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                className="flex items-center justify-center p-2 rounded-full transition-colors"
                style={{ color: isOpen ? 'var(--color-accent)' : 'var(--color-muted)', background: isOpen ? 'var(--color-glass-btn)' : 'transparent' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Smile size={18} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 z-50 p-2 rounded-xl border flex gap-1 shadow-lg overflow-x-auto max-w-[280px]"
                        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    >
                        {Object.entries(CUSTOM_EMOJIS).map(([shortcode, icon]) => (
                            <button
                                key={shortcode}
                                type="button"
                                className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                                onClick={() => {
                                    onSelect(shortcode);
                                    setIsOpen(false);
                                }}
                                title={shortcode}
                            >
                                {icon}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Modal ─────────────────────────────────────────────────────
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Prevent scroll on body when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-beet-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-beet-nav-border bg-beet-card shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-beet-nav-border p-4">
                            <h3 className="font-syne text-lg font-bold text-white uppercase tracking-tight">{title}</h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-1.5 text-beet-muted hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-height-[80vh] overflow-y-auto p-4 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

