'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { 
  Search, 
  Plus, 
  Music, 
  RefreshCw,
  MessageSquare,
  Zap,
  Handshake,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useStore, COLLAB_TYPE_CONFIG } from '@/lib/store';
import CollabCard from '@/components/CollabCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const collabModes = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'HIBRIDO', label: 'Híbrido' },
];

function CollabExplorerContent() {
  const router = useRouter();
  const { 
    collabPosts, 
    fetchCollabPosts, 
    addToast,
    expressInterest
  } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showInterestModal, setShowInterestModal] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadContent();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      await fetchCollabPosts();
    } finally {
      setLoading(false);
    }
  };

  const filteredCollabs = collabPosts.filter(c => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchSearch = !searchQuery || 
                       c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleInterestRequest = async (type: 'quick' | 'chat') => {
    if (!showInterestModal) return;
    
    setSendingInterest(true);
    try {
      await expressInterest(showInterestModal, interestMessage || 'Tenho interesse na sua collab!');
      if (type === 'chat') {
        addToast({ message: 'Chat iniciado!', type: 'success' });
        router.push('/artist/messages'); 
      } else {
        addToast({ message: 'Interesse enviado!', type: 'success' });
      }
      setShowInterestModal(null);
      setInterestMessage('');
    } catch (error) {
    } finally {
      setSendingInterest(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:px-6 lg:pb-6 space-y-8 w-full">
        {/* Hero Card — Mirroring Marketplace */}
        <div style={{
          background: 'var(--color-nav-bg)',
          border: '1px solid var(--color-nav-border)',
          borderTop: '2px solid var(--color-accent)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
          padding: '32px 24px 28px',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(0,255,102,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <p className="section-label" style={{ marginBottom: 10 }}>OPORTUNIDADES CRIATIVAS</p>
              <h1 className="page-header text-[var(--color-primary-text,white)]" style={{ marginBottom: 8, fontSize: '42px' }}>
                COLLAB<span style={{ color: 'var(--color-accent)' }}>HUB</span>
              </h1>
              <p className="page-subtitle text-[var(--color-primary-text,white)] opacity-80">
                Conecte-se com outros artistas e crie algo lendário hoje
              </p>
            </div>

            <button 
              onClick={() => router.push('/collabs/new')}
              className="btn-accent px-8 py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
              style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.05em' }}
            >
              <Plus size={18} strokeWidth={3} /> CRIAR COLLAB
            </button>
          </div>

          {/* Search — Mirroring Marketplace */}
          <div className="flex gap-2">
            <input
              type="text"
              className="beet-input flex-1 min-w-0"
              placeholder="O que você está procurando? (beats, feat, mix...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={loadContent}
              className="btn-accent px-6 flex-shrink-0" 
              style={{ fontSize: '14px', letterSpacing: '0.1em' }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : 'BUSCAR'}
            </button>
          </div>
        </div>

        {/* Categories — Mirroring Marketplace */}
        <div className="bg-white/5 p-4 rounded-sm border border-white/5">
          <p className="section-label mb-4 opacity-60 uppercase">EXPLORAR CATEGORIAS</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`beet-pill cursor-pointer ${filterType === 'all' ? 'active' : ''}`}>
              🌐 TODOS
            </button>
            {Object.entries(COLLAB_TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key} 
                className={`beet-pill cursor-pointer ${filterType === key ? 'active' : ''}`}
                onClick={() => setFilterType(key)}>
                {cfg.icon || '🤝'} {cfg.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/5 border border-white/5 aspect-[4/5] rounded-sm animate-pulse" />
              ))}
            </motion.div>
          ) : filteredCollabs.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
            >
              {filteredCollabs.map((collab: any) => (
                <CollabCard 
                  key={collab.id} 
                  collab={collab} 
                  onInterest={(id) => setShowInterestModal(id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="empty-state py-20 border border-dashed border-white/10 rounded-sm">
                <p className="text-4xl mb-4">🤝</p>
                <p className="text-[var(--color-primary-text,white)] font-bold uppercase tracking-wider">Nenhuma collab encontrada</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interest Modal - Premium Aesthetic */}
      <AnimatePresence>
        {showInterestModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowInterestModal(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-beet-dark border-t md:border border-white/10 w-full max-w-lg rounded-t-[40px] md:rounded-[40px] p-8 md:p-10 space-y-8 shadow-2xl overflow-hidden"
              style={{ background: 'var(--color-bg)' }}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-beet-green/5 blur-3xl pointer-events-none" />
              
              <div className="space-y-3 relative">
                <div className="w-12 h-1 text-white/10 bg-white/10 rounded-full mx-auto mb-6 md:hidden" />
                <h3 className="text-3xl font-black text-white tracking-tight">ENVIAR INTERESSE <span className="text-beet-green">🚀</span></h3>
                <p className="text-beet-muted text-sm leading-relaxed">Conecte-se com o artista para iniciar uma colaboração épica.</p>
              </div>

              <div className="relative">
                <textarea 
                  placeholder="Escreva uma mensagem matadora..." 
                  value={interestMessage} 
                  onChange={(e) => setInterestMessage(e.target.value)} 
                  rows={4} 
                  className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-white text-base focus:outline-none focus:border-beet-green/50 focus:bg-white/10 transition-all resize-none shadow-inner" 
                />
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <button 
                  onClick={() => handleInterestRequest('chat')} 
                  disabled={sendingInterest} 
                  className="btn-accent w-full py-5 text-sm"
                >
                  <MessageSquare size={18} /> 
                  INICIAR CONVERSA
                </button>
                <button 
                  onClick={() => handleInterestRequest('quick')} 
                  disabled={sendingInterest} 
                  className="w-full bg-white/5 text-white py-5 rounded-xl font-bold text-sm tracking-widest hover:bg-white/10 transition-all border border-white/5 uppercase"
                >
                  INTERESSE RÁPIDO
                </button>
              </div>

              <button 
                onClick={() => setShowInterestModal(null)} 
                className="w-full text-center text-beet-muted/40 text-[10px] font-black uppercase tracking-[0.2em] pt-4 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
        {icon || <Music size={40} />}
      </div>
      <h3 className="text-xl font-bold text-white max-w-xs mx-auto">{text}</h3>
    </div>
  );
}

export default function CollabExplorerPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-beet-dark min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-beet-green/20 border-t-beet-green animate-spin" />
          <p className="text-beet-muted font-black text-xs tracking-widest">CARREGANDO HUB...</p>
        </div>
      </div>
    }>
      <CollabExplorerContent />
    </Suspense>
  );
}
