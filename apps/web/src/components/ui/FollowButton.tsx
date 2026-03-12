'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

interface FollowButtonProps {
    artistId: string;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function FollowButton({ artistId, showIcon = true, size = 'md', className = '' }: FollowButtonProps) {
    const { isFollowing, toggleFollow, isAuthenticated, artistProfile } = useStore();
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Check if it's following themselves
    const isSelf = artistProfile?.id === artistId;
    
    const followed = isFollowing(artistId);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        if (isSelf) return;

        setLoading(true);
        await toggleFollow(artistId);
        setLoading(false);
    };

    if (isSelf) return null;

    const sizes = {
        sm: 'px-3 py-1.5 text-[9px] gap-1.5',
        md: 'px-5 py-2 text-[10px] gap-2',
        lg: 'px-7 py-3 text-[11px] gap-2.5'
    };

    if (loading) {
        return (
            <button disabled className={`flex items-center rounded-sm font-mono font-bold uppercase tracking-wider border opacity-70 cursor-not-allowed ${sizes[size]} ${className}`}
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-muted)' }}>
                <Loader2 size={12} className="animate-spin" />
                <span>AGUARDE</span>
            </button>
        );
    }

    if (followed) {
        return (
            <motion.button
                onClick={handleToggle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`flex items-center rounded-sm font-['Space_Mono'] font-bold uppercase tracking-widest transition-all border ${sizes[size]} ${className}`}
                style={{
                    background: isHovered ? 'rgba(255, 45, 45, 0.08)' : 'rgba(0, 255, 136, 0.05)',
                    borderColor: isHovered ? '#FF2D2D' : 'rgba(0, 255, 136, 0.4)',
                    color: isHovered ? '#FF2D2D' : 'var(--color-accent)',
                    boxShadow: isHovered ? '0 0 15px rgba(255, 45, 45, 0.15)' : 'none'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isHovered ? (
                    <>
                        {showIcon && <UserMinus size={12} />}
                        <span>Deixar de seguir</span>
                    </>
                ) : (
                    <>
                        {showIcon && <UserCheck size={12} />}
                        <span>Seguindo</span>
                    </>
                )}
            </motion.button>
        );
    }

    return (
        <motion.button
            onClick={handleToggle}
            className={`flex items-center rounded-sm font-['Space_Mono'] font-bold uppercase tracking-widest transition-all border ${sizes[size]} ${className}`}
            style={{
                background: 'var(--color-accent)',
                borderColor: 'var(--color-accent)',
                color: '#000',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 25px rgba(0, 255, 136, 0.5)' }}
            whileTap={{ scale: 0.95 }}
        >
            {showIcon && <UserPlus size={12} fill="#000" />}
            <span>Seguir artista</span>
        </motion.button>
    );
}
