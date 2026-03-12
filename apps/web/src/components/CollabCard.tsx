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
    <div className="group relative bg-[#1A1A1B] border border-white/10 rounded-3xl overflow-hidden hover:border-[#00FF00]/50 transition-all duration-300">
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF00]/0 to-[#00FF00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Boost Badge */}
      {isBoosted && (
        <div className="absolute top-4 right-4 z-10 bg-[#00FF00] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg shadow-[#00FF00]/20 animate-pulse">
          <Zap size={10} fill="black" />
          Oportunidade Real
        </div>
      )}

      {/* Header / Cover */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={api.getMediaUrl(collab.coverUrl) || '/api/placeholder/400/200'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={collab.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1B] via-transparent to-transparent" />
        
        {/* Author Overlap */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <img 
            src={api.getMediaUrl(collab.author.avatarUrl) || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366'}
            className="w-8 h-8 rounded-full border-2 border-[#1A1A1B] shadow-lg"
          />
          <div className="text-xs text-white font-medium">
            {collab.author.stageName}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.label}
            </span>
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Users size={10} />
              {collab._count?.interests || 0} interessados
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#00FF00] transition-colors">
            {collab.title}
          </h3>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
              {collab.mode === 'ONLINE' ? <Globe size={12} /> : <MapPin size={12} />}
            </div>
            <span>{collab.mode === 'ONLINE' ? 'Online' : `${collab.city || 'São Paulo'}, ${collab.state || 'SP'}`}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
              <DollarSign size={12} />
            </div>
            <span>
              {collab.compensation === 'FREE' ? 'Sem custos' : 
               collab.compensation === 'REV_SHARE' ? 'Rev. Share' : 
               collab.compensation === 'PAID' ? `Cachê: R$ ${collab.compensationValue}` : 'A combinar'}
            </span>
          </div>
        </div>

        <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
          {collab.description}
        </p>

        {/* Action */}
        <button 
          onClick={() => onInterest?.(collab.id)}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold hover:bg-[#00FF00] transition-all group/btn"
        >
          Tenho Interesse
          <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
