'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Music, 
  RefreshCw,
  MessageSquare,
  Zap,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { useStore, COLLAB_TYPE_CONFIG } from '@/lib/store';
import CollabCard from '@/components/CollabCard';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const collabModes = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'HIBRIDO', label: 'Híbrido' },
];

export default function CollabExplorerPage() {
  const router = useRouter();
  const { 
    collabPosts, 
    collabInterests,
    fetchCollabPosts, 
    fetchMyCollabs,
    fetchReceivedInterests,
    updateInterestStatus,
    expressInterest,
    addToast
  } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'explorar' | 'minhas' | 'interesses'>('explorar');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showInterestModal, setShowInterestModal] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'explorar') await fetchCollabPosts();
      else if (activeTab === 'minhas') await fetchMyCollabs();
      else if (activeTab === 'interesses') await fetchReceivedInterests();
    } finally {
      setLoading(false);
    }
  };

  const filteredCollabs = collabPosts.filter(c => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchMode = filterMode === 'all' || c.mode === filterMode;
    const matchSearch = !searchQuery || 
                       c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchMode && matchSearch;
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
      // addToast is already called inside store.expressInterest
    } finally {
      setSendingInterest(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateInterestStatus(id, status);
    } catch (error) {
      // addToast called in store
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-beet-dark">
      <main className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-beet-dark-lighter to-transparent px-6 py-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                {activeTab === 'explorar' ? 'Explorar Collabs' : activeTab === 'minhas' ? 'Minhas Collabs' : 'Interesses Recebidos'} 
                <Zap className="text-beet-green" fill="#00FF88" size={28} />
              </h1>
              <p className="text-beet-muted max-w-lg">
                {activeTab === 'explorar' 
                  ? 'Descubra novas parcerias e cresça com a comunidade.' 
                  : activeTab === 'minhas' 
                  ? 'Gerencie suas oportunidades publicadas e impulsione sua rede.' 
                  : 'Veja quem quer criar algo com você.'}
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/artist/collabs/new')}
              className="bg-beet-green text-black px-6 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-beet-green/20"
            >
              <Plus size={20} />
              CRIAR COLLAB
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Tabs Bar */}
          <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('explorar')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'explorar' ? 'bg-white text-black' : 'text-beet-muted hover:text-white'
              }`}
            >
              Explorar
            </button>
            <button 
              onClick={() => setActiveTab('minhas')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'minhas' ? 'bg-white text-black' : 'text-beet-muted hover:text-white'
              }`}
            >
              Meus Anúncios
            </button>
            <button 
              onClick={() => setActiveTab('interesses')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'interesses' ? 'bg-white text-black' : 'text-beet-muted hover:text-white'
              }`}
            >
              Interesses
            </button>
          </div>

          {activeTab !== 'interesses' ? (
            <>
              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-4 mb-8 bg-beet-dark-lighter p-4 rounded-2xl border border-white/5">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar por título, gênero, instrumento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-beet-green"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border-none rounded-xl py-3 px-4 text-sm text-white focus:ring-1 focus:ring-beet-green"
                  >
                    <option value="all">Todos os tipos</option>
                    {Object.entries(COLLAB_TYPE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>

                  <button 
                    onClick={loadContent}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-beet-muted hover:text-white transition-colors"
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="bg-beet-dark-lighter h-80 rounded-[32px]" />)}
                </div>
              ) : filteredCollabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                  {filteredCollabs.map((collab: any) => (
                    <CollabCard 
                      key={collab.id} 
                      collab={collab} 
                      onInterest={activeTab === 'explorar' ? (id) => setShowInterestModal(id) : undefined}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState text={activeTab === 'explorar' ? "Nenhuma collab disponível no momento." : "Você ainda não publicou nenhuma collab."} />
              )}
            </>
          ) : (
            /* Interests List */
            <div className="space-y-4 mb-20">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="bg-beet-dark-lighter h-24 rounded-2xl animate-pulse" />)
              ) : collabInterests.length > 0 ? (
                collabInterests.map((interest: any) => (
                  <div 
                    key={interest.id}
                    className="bg-beet-dark-lighter border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={api.getMediaUrl(interest.user.avatarUrl) || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366'}
                        className="w-12 h-12 rounded-full border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                          {interest.user.stageName}
                          <span className="px-2 py-0.5 bg-white/5 text-beet-muted text-[10px] rounded uppercase">
                            {interest.user.genres?.[0] || 'Artista'}
                          </span>
                        </h4>
                        <p className="text-xs text-beet-muted mt-1">Interessado em: <span className="text-white/60">{interest.collab.title}</span></p>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl flex-1 max-w-md">
                      <p className="text-sm text-beet-muted italic">"{interest.message}"</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {interest.status === 'PENDING' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(interest.id, 'REJECTED')}
                            className="p-3 bg-beet-red/10 text-beet-red rounded-xl hover:bg-beet-red/20 transition-all"
                          >
                            <X size={20} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(interest.id, 'ACCEPTED')}
                            className="px-6 py-2 bg-beet-green text-black rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Check size={20} />
                            ACEITAR
                          </button>
                        </>
                      ) : (
                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                          interest.status === 'ACCEPTED' ? 'bg-beet-green/10 text-beet-green' : 'bg-beet-red/10 text-beet-red'
                        }`}>
                          {interest.status === 'ACCEPTED' ? 'Aceito' : 'Recusado'}
                        </span>
                      )}
                      <button className="p-3 bg-white/5 text-beet-muted rounded-xl hover:text-white transition-colors">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="Nenhum interesse recebido até o momento." icon={<MessageSquare size={40} />} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Interest Modal */}
      <AnimatePresence>
        {showInterestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInterestModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-beet-dark-lighter border border-white/10 w-full max-w-md rounded-[32px] p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Tenho Interesse! 🚀</h3>
                <p className="text-beet-muted text-sm">Escolha como você deseja se conectar com o artista.</p>
              </div>
              <textarea placeholder="Adicione uma mensagem personalizada..." value={interestMessage} onChange={(e) => setInterestMessage(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-beet-green resize-none" />
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button onClick={() => handleInterestRequest('chat')} disabled={sendingInterest} className="bg-beet-green text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"><MessageSquare size={18} /> ABRIR CHAT DIRETO</button>
                <button onClick={() => handleInterestRequest('quick')} disabled={sendingInterest} className="bg-white/10 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all">ENVIAR INTERESSE RÁPIDO</button>
              </div>
              <button onClick={() => setShowInterestModal(null)} className="w-full text-center text-white/20 text-xs font-medium uppercase tracking-widest pt-2">Voltar</button>
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
