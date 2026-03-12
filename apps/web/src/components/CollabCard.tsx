'use client';

import React from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Zap, 
  ChevronRight,
  Music,
  Globe,
  Users
} from 'lucide-react';
import { CollabPost, COLLAB_TYPE_CONFIG } from '@/lib/store';
import { api } from '@/lib/api';
import { FollowButton } from '@/components/ui/FollowButton';

interface CollabCardProps {
  collab: CollabPost & { 
    author: { stageName: string; avatarUrl: string; genres: string[] };
    _count?: { interests: number };
  };
  onInterest?: (id: string) => void;
}

export default function CollabCard({ collab, onInterest }: CollabCardProps) {
  const config = COLLAB_TYPE_CONFIG[collab.type] || COLLAB_TYPE_CONFIG.OTHER;
  
  // Check if collab is boosted (created within last 48h)
  const isBoosted = new Date().getTime() - new Date(collab.createdAt).getTime() < 48 * 60 * 60 * 1000;

  return (
    <div className="group relative border border-white/5 rounded-[32px] overflow-hidden hover:border-beet-green/30 transition-all duration-300 shadow-xl" style={{ backgroundColor: 'var(--color-card)' }}>
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-beet-green/0 to-beet-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Boost Badge */}
      {isBoosted && (
        <div className="absolute top-4 right-4 z-10 bg-beet-green text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-2xl shadow-beet-green/20">
          <Zap size={10} fill="currentColor" />
          Oportunidade Real
        </div>
      )}

      {/* Header / Cover */}
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={api.getMediaUrl(collab.coverUrl) || '/api/placeholder/400/200'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={collab.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Author Overlap */}
        <div className="absolute bottom-5 left-5 flex items-center gap-3">
          <div className="relative">
            <img 
              src={api.getMediaUrl(collab.author.avatarUrl) || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366'}
              className="w-10 h-10 rounded-full border-2 border-white/10 shadow-2xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-beet-green rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-white font-bold tracking-tight drop-shadow-md">
              {collab.author.stageName}
            </div>
            <FollowButton artistId={collab.authorId} size="sm" showIcon={false} className="h-6 mt-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span 
              className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-lg border border-white/5 bg-white/5"
              style={{ color: config.color || 'var(--color-beet-green)' }}
            >
              {config.label}
            </span>
            <span className="text-[10px] text-beet-muted flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Users size={12} className="text-beet-green/50" />
              {collab._count?.interests || 0} CONEXÕES
            </span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-beet-green transition-colors line-clamp-1">
            {collab.title}
          </h3>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5 text-beet-muted text-xs font-medium">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-beet-green/60">
              {collab.mode === 'ONLINE' ? <Globe size={14} /> : <MapPin size={14} />}
            </div>
            <span className="line-clamp-1">{collab.mode === 'ONLINE' ? 'Remoto' : `${collab.city || 'São Paulo'}`}</span>
          </div>
          <div className="flex items-center gap-2.5 text-beet-muted text-xs font-medium">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-beet-green/60">
              <DollarSign size={14} />
            </div>
            <span className="line-clamp-1">
              {collab.compensation === 'FREE' ? 'Sem custos' : 
               collab.compensation === 'REV_SHARE' ? 'Participação' : 
               collab.compensation === 'PAID' ? `Cachê: R$ ${collab.compensationValue}` : 'A combinar'}
            </span>
          </div>
        </div>

        <p className="text-sm text-beet-muted/80 line-clamp-2 leading-relaxed h-10 overflow-hidden">
          {collab.description}
        </p>

        {/* Action button sync with global style */}
        <button 
          onClick={() => onInterest?.(collab.id)}
          className="w-full btn-accent flex items-center justify-center gap-2 py-4 shadow-neon transition-all"
        >
          TENHO INTERESSE
          <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
