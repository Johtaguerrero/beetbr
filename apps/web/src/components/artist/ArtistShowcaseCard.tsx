'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Play, TrendingUp, Star, ChevronRight, Music } from 'lucide-react';
import { ArtistProfile, useStore } from '@/lib/store';
import { Avatar, ScoreBeetBadge } from '@/components/ui';
import { FollowButton } from '@/components/ui/FollowButton';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ArtistShowcaseCardProps {
    artist: ArtistProfile;
}

export function ArtistShowcaseCard({ artist }: ArtistShowcaseCardProps) {
    const { currentUser } = useStore();
    const isIndustry = currentUser?.role === 'INDUSTRY';

    // Format numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative flex flex-col rounded-[32px] overflow-hidden border border-white/5 transition-all duration-500 hover:border-beet-accent/30 shadow-2xl"
            style={{ background: 'var(--color-card)' }}
        >
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-beet-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Cover / Header */}
            <div className="relative h-40 w-full overflow-hidden">
                {artist.coverUrl ? (
                    <img
                        src={api.getMediaUrl(artist.coverUrl)}
                        alt={artist.stageName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Ranking Badge if exists */}
                {artist.ranking && (
                    <div className="absolute top-4 left-4 z-10 bg-beet-accent text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Star size={12} fill="currentColor" />
                        #{artist.ranking} NO RANKING
                    </div>
                )}
            </div>

            {/* Profile Info Overlay */}
            <div className="relative px-6 -mt-10 mb-4 flex items-end justify-between">
                <div className="relative flex items-end">
                    <Avatar 
                        name={artist.stageName} 
                        imageUrl={artist.avatarUrl} 
                        size="xl" 
                        className="border-4 border-[var(--color-card)] shadow-2xl" 
                    />
                    <div className="absolute -bottom-1 -right-1 z-10">
                        <ScoreBeetBadge score={artist.scoreBeet} size="md" />
                    </div>
                </div>
                
                <div className="flex gap-2 mb-2">
                    <FollowButton artistId={artist.id} showIcon={false} size="sm" className="rounded-full !px-6" />
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-beet-accent transition-colors">
                        {artist.stageName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] text-beet-muted font-black uppercase tracking-[0.1em] flex items-center gap-1">
                            <MapPin size={10} className="text-beet-accent" />
                            {artist.city}, {artist.state}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <p className="text-[10px] text-beet-accent font-black uppercase tracking-[0.1em]">
                            {artist.genres?.[0] || 'Artista'}
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-beet-muted font-black uppercase tracking-widest mb-1">Plays</span>
                        <div className="flex items-center gap-1.5 text-white">
                            <Play size={10} className="text-beet-accent" />
                            <span className="text-xs font-bold">{formatNumber(artist.playsTotal)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-beet-muted font-black uppercase tracking-widest mb-1">Followers</span>
                        <div className="flex items-center gap-1.5 text-white">
                            <Users size={10} className="text-beet-accent" />
                            <span className="text-xs font-bold">{formatNumber(artist.followerCountTotal || 0)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-beet-muted font-black uppercase tracking-widest mb-1">Engaj.</span>
                        <div className="flex items-center gap-1.5 text-white">
                            <TrendingUp size={10} className="text-beet-accent" />
                            <span className="text-xs font-bold">{artist.metrics?.engagement?.toFixed(1) || '0.0'}%</span>
                        </div>
                    </div>
                </div>

                {/* Sub-genres / Roles */}
                <div className="flex flex-wrap gap-1.5 mb-6 opacity-60">
                    {artist.subGenres?.slice(0, 2).map((sub) => (
                        <span key={sub} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-bold text-beet-gray uppercase">
                            {sub}
                        </span>
                    ))}
                    {artist.roles?.slice(0, 1).map((role) => (
                        <span key={role} className="px-2 py-0.5 rounded-md bg-beet-accent/10 border border-beet-accent/5 text-[8px] font-bold text-beet-accent uppercase">
                            {role}
                        </span>
                    ))}
                </div>

                {/* Final Actions */}
                <div className="mt-auto flex gap-3">
                    <Link 
                        href={`/artist/profile/${artist.id}`}
                        className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white hover:bg-white/10 transition-all text-center uppercase tracking-widest"
                    >
                        Ver Perfil
                    </Link>
                    {isIndustry && (
                        <Link 
                            href={`/industry/proposals/new?artistId=${artist.id}`}
                            className="flex-1 py-3 px-4 rounded-2xl bg-beet-accent text-black text-[10px] font-black hover:scale-105 active:scale-95 transition-all text-center uppercase tracking-widest shadow-lg shadow-beet-accent/20"
                        >
                            Proposta
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
