'use client';
import { motion } from 'framer-motion';

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

// ── Avatar ────────────────────────────────────────────────────
interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    emoji?: string;
    isIndustry?: boolean;
}
export function Avatar({ name, size = 'md', emoji = '🎤', isIndustry = false }: AvatarProps) {
    const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl', xl: 'h-20 w-20 text-3xl' };
    const bg = isIndustry ? 'rgba(0,87,255,0.15)' : 'rgba(0,255,102,0.15)';
    return (
        <div className={`flex flex-shrink-0 items-center justify-center rounded-full ${sizes[size]}`} style={{ background: bg }}>
            {emoji}
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
export function Waveform({ bars = 20 }: { bars?: number }) {
    return (
        <div className="flex h-8 items-end gap-0.5">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className="waveform-bar flex-1 rounded-sm"
                    style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.06}s` }}
                />
            ))}
        </div>
    );
}

// ── Track Player ──────────────────────────────────────────────
export function TrackPlayer({ title, url }: { title?: string; url?: string }) {
    return (
        <div className="flex flex-col gap-2 rounded-xl bg-beet-dark p-3">
            <div className="flex flex-1 flex-col gap-1.5">
                {title && <p className="text-xs font-medium text-white">{title}</p>}
                {url ? (
                    <audio controls src={url} className="w-full h-10" />
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-beet-black"
                            style={{ background: 'var(--color-accent)' }}
                        >
                            ▶
                        </button>
                        <Waveform />
                        <span className="text-xs text-beet-muted">--:--</span>
                    </div>
                )}
            </div>
        </div>
    );
}

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
