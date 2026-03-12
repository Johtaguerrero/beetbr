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
        router.push('/messages'); 
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
      {/* Dynamic Header with glassmorphism */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isScrolled ? 'bg-beet-bg/80 backdrop-blur-xl py-4 border-white/5' : 'bg-transparent py-10 border-transparent'
        } px-6`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-4">
              COLLAB <span className="text-beet-green">HUB</span>
              <Handshake className="text-beet-green animate-pulse" size={32} />
            </h1>
            {!isScrolled && (
              <p className="text-beet-muted max-w-lg text-sm md:text-base">
                Conecte-se com outros artistas e crie algo lendário hoje.
              </p>
            )}
          </div>
          
          <button 
            onClick={() => router.push('/collabs/new')}
            className="btn-accent"
          >
            <Plus size={18} />
            CRIAR COLLAB
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-8">
        {/* Search & Filter Bar - Premium Glass Box */}
        <div 
          className="mb-10 p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md flex flex-col lg:flex-row items-center gap-6"
        >
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-beet-muted group-focus-within:text-beet-green transition-colors" size={20} />
            <input 
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-beet-green/50 focus:bg-white/10 transition-all placeholder:text-beet-muted/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 lg:flex-none">
              <button
                onClick={() => setFilterType('all')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border ${
                  filterType === 'all' 
                    ? 'bg-beet-green border-beet-green text-black shadow-neon' 
                    : 'bg-white/5 border-white/5 text-beet-muted hover:text-white hover:border-white/20'
                }`}
              >
                TODOS
              </button>
              {Object.entries(COLLAB_TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap border ${
                    filterType === key 
                      ? 'bg-beet-green border-beet-green text-black shadow-neon' 
                      : 'bg-white/5 border-white/5 text-beet-muted hover:text-white hover:border-white/20'
                  }`}
                >
                  {cfg.label.toUpperCase()}
                </button>
              ))}
            </div>

            <button 
              onClick={loadContent}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-beet-muted hover:text-white transition-all border border-white/5 active:scale-95"
              title="Atualizar"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-beet-green' : ''} />
            </button>
          </div>
        </div>

        {/* Dynamic Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/5 border border-white/5 aspect-[4/5] rounded-[24px] animate-pulse" />
              ))}
            </motion.div>
          ) : filteredCollabs.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
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
              <EmptyState text="Nenhuma collab disponível nessa categoria." />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
