'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Send, MoreVertical, 
    ChevronLeft, Briefcase, Handshake, 
    ShoppingBag, User, Plus, Smile, MessageSquare,
    CheckCircle2, Clock, Info, ExternalLink
} from 'lucide-react';
import { useStore, type ChatThread, type ChatMessage } from '@/lib/store';
import { Avatar, Spinner, StatusBadge, CustomEmojiPicker, RenderTextWithEmojis } from '@/components/ui';

function IndustryMessagesContent() {
    const searchParams = useSearchParams();
    const threadIdFromUrl = searchParams.get('id');
    const { 
        currentUser, 
        chatThreads, 
        fetchChatThreads, 
        fetchThreadMessages, 
        sendMessage, 
        markThreadAsRead 
    } = useStore();

    const [activeThreadId, setActiveThreadId] = useState<string | null>(threadIdFromUrl);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'PROPOSAL' | 'COLLAB' | 'MARKETPLACE'>('ALL');
    const [showDetails, setShowDetails] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeThread = chatThreads.find(t => t.id === activeThreadId);

    // Initial load
    useEffect(() => {
        fetchChatThreads();
    }, [fetchChatThreads]);

    // Handle incoming thread ID from URL
    useEffect(() => {
        if (threadIdFromUrl) {
            setActiveThreadId(threadIdFromUrl);
        }
    }, [threadIdFromUrl]);

    // Load messages when active thread changes
    useEffect(() => {
        if (activeThreadId) {
            loadMessages(activeThreadId);
            markThreadAsRead(activeThreadId);
        } else {
            setMessages([]);
        }
    }, [activeThreadId]);

    // Polling for new messages in active thread
    useEffect(() => {
        if (!activeThreadId) return;
        const interval = setInterval(() => {
            loadMessages(activeThreadId, true);
        }, 30000);
        return () => clearInterval(interval);
    }, [activeThreadId]);

    const loadMessages = async (id: string, silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await fetchThreadMessages(id);
            setMessages(data || []);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!activeThreadId || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(activeThreadId, newMessage.trim());
            setNewMessage('');
            await loadMessages(activeThreadId, true);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const filteredThreads = chatThreads.filter(t => {
        const matchesSearch = t.participants?.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                           t.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || t.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const getOtherParticipant = (thread: ChatThread) => {
        return thread.participants?.find(p => p.id !== currentUser?.id) || { name: 'Desconhecido', avatarUrl: null };
    };

    const getThreadIcon = (type: string) => {
        switch(type) {
            case 'PROPOSAL': return <Briefcase size={14} />;
            case 'COLLAB': return <Handshake size={14} />;
            case 'MARKETPLACE': return <ShoppingBag size={14} />;
            default: return <User size={14} />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-env(safe-area-inset-bottom))] w-full flex-col lg:flex-row overflow-hidden bg-beet-black">
                
                {/* ── Sidebar (Thread List) ── */}
                <div className={`
                    flex flex-col border-r border-beet-nav-border bg-beet-card transition-all duration-300
                    ${activeThreadId ? 'hidden lg:flex lg:w-80' : 'w-full'}
                `}>
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between">
                            <h1 className="font-syne text-xl font-bold text-white uppercase tracking-tight">Mensagens</h1>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-beet-muted">
                                <Plus size={18} />
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beet-muted" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar conversas..."
                                    className="beet-input w-full pl-9 py-2 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                                {(['ALL', 'PROPOSAL', 'COLLAB', 'MARKETPLACE'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`
                                            whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all
                                            ${filterType === type ? 'bg-beet-green text-black' : 'bg-white/5 text-beet-muted hover:bg-white/10'}
                                        `}
                                    >
                                        {type === 'ALL' ? 'Todas' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Thread List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredThreads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
                                <Search size={32} className="mb-2" />
                                <p className="text-xs">Nenhuma conversa encontrada</p>
                            </div>
                        ) : (
                            filteredThreads.map(thread => {
                                const other = getOtherParticipant(thread);
                                const isActive = thread.id === activeThreadId;
                                return (
                                    <button
                                        key={thread.id}
                                        onClick={() => setActiveThreadId(thread.id)}
                                        className={`
                                            group flex w-full items-center gap-3 border-b border-beet-nav-border p-4 text-left transition-all
                                            ${isActive ? 'bg-beet-green/10' : 'hover:bg-white/5'}
                                        `}
                                    >
                                        <div className="relative">
                                            <Avatar name={other.name} imageUrl={other.avatarUrl} size="md" />
                                            <div 
                                                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-beet-card bg-beet-black text-[10px]"
                                                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-muted)' }}
                                            >
                                                {getThreadIcon(thread.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`truncate text-sm font-bold ${isActive ? 'text-beet-green' : 'text-white'}`}>{other.name}</p>
                                                <span className="text-[10px] text-beet-muted whitespace-nowrap">
                                                    {new Date(thread.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-beet-muted mt-0.5">{thread.lastMessage || 'Nova conversa'}</p>
                                        </div>
                                        {thread.status === 'UNREAD' && (
                                            <div className="h-2 w-2 rounded-full bg-beet-green shadow-[0_0_8px_var(--color-accent)]" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Active Chat Area ── */}
                <div className={`
                    flex flex-1 flex-col relative
                    ${!activeThreadId ? 'hidden lg:flex items-center justify-center p-8 text-center bg-beet-card/50' : 'flex bg-beet-black'}
                `}>
                    {activeThreadId && activeThread ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b border-beet-nav-border bg-beet-card p-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setActiveThreadId(null)}
                                        className="lg:hidden p-2 -ml-2 text-beet-muted hover:text-white"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <Avatar name={getOtherParticipant(activeThread).name} imageUrl={getOtherParticipant(activeThread).avatarUrl} size="md" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{getOtherParticipant(activeThread).name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-beet-green">
                                                {getThreadIcon(activeThread.type)}
                                                {activeThread.type}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-white/20" />
                                            <StatusBadge status={activeThread.status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowDetails(!showDetails)}
                                        className={`flex h-8 items-center gap-2 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${showDetails ? 'bg-beet-green text-black' : 'bg-white/5 text-beet-muted hover:bg-white/10'}`}
                                    >
                                        <Info size={14} />
                                        <span className="hidden sm:inline">Detalhes</span>
                                    </button>
                                    <button className="p-2 text-beet-muted hover:text-white">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center opacity-30">
                                        <Smile size={48} className="mb-4" />
                                        <p className="font-syne text-lg font-bold uppercase">Comece a conversa!</p>
                                        <p className="text-sm">Envie uma mensagem para iniciar o contato.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {messages.map((msg, i) => {
                                            const isMe = msg.senderId === currentUser?.id;
                                            return (
                                                <div 
                                                    key={msg.id}
                                                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    <div className={`flex flex-col max-w-[85%] lg:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <div 
                                                            className={`
                                                                rounded-2xl px-4 py-2.5 text-sm shadow-xl
                                                                ${isMe ? 'bg-beet-green text-black rounded-br-none' : 'bg-beet-card text-white rounded-bl-none border border-beet-nav-border'}
                                                            `}
                                                        >
                                                            <RenderTextWithEmojis text={msg.content} />
                                                            <div className={`flex items-center gap-1 mt-1 text-[8px] font-bold uppercase tracking-widest opacity-60 ${isMe ? 'text-black' : 'text-beet-muted'}`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {isMe && <CheckCircle2 size={10} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <form 
                                onSubmit={handleSendMessage}
                                className="border-t border-beet-nav-border bg-beet-card p-4"
                            >
                                <div className="flex items-end gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                            <CustomEmojiPicker onSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
                                            <button type="button" className="p-2 text-beet-muted hover:text-white transition-colors">
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <textarea
                                            rows={1}
                                            placeholder="Digite sua mensagem..."
                                            className="beet-input w-full pl-20 pr-4 py-3 text-sm resize-none custom-scrollbar"
                                            style={{ minHeight: '46px', maxHeight: '120px' }}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className={`
                                            flex h-[46px] w-[46px] items-center justify-center rounded-xl transition-all
                                            ${newMessage.trim() && !isSending ? 'bg-beet-green text-black shadow-[0_0_20px_var(--color-accent)]' : 'bg-white/5 text-beet-muted'}
                                        `}
                                    >
                                        {isSending ? <Spinner size="sm" /> : <Send size={20} />}
                                    </motion.button>
                                </div>
                                <p className="mt-2 text-center text-[10px] text-beet-muted uppercase tracking-widest font-black opacity-30">
                                    Pressione Enter para enviar
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                            <div className="relative mb-6">
                                <MessageSquare size={80} className="text-beet-green animate-pulse" />
                                <div className="absolute inset-0 bg-beet-green/20 blur-3xl rounded-full" />
                            </div>
                            <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-white mb-2">Suas Conversas</h2>
                            <p className="max-w-xs text-sm">Selecione uma conversa ao lado para visualizar os detalhes e gerenciar suas propostas.</p>
                        </div>
                    )}
                </div>

                {/* ── Details Panel ── */}
                <AnimatePresence>
                    {showDetails && activeThread && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 border-l border-beet-nav-border bg-beet-card shadow-2xl lg:relative lg:z-0 lg:block"
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-beet-nav-border p-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Detalhes do Contexto</h3>
                                    <button onClick={() => setShowDetails(false)} className="p-1 text-beet-muted hover:text-white">
                                        <XIcon size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    {/* Thread Info */}
                                    <div className="mb-8 text-center">
                                         <Avatar name={getOtherParticipant(activeThread).name} imageUrl={getOtherParticipant(activeThread).avatarUrl} size="xl" className="mx-auto mb-4" />
                                         <h4 className="font-syne text-lg font-bold text-white uppercase">{getOtherParticipant(activeThread).name}</h4>
                                         <p className="text-xs text-beet-muted mt-1">Participante desde {new Date().getFullYear()}</p>
                                    </div>

                                    {/* Action Context (Proposal/Collab/Listing) */}
                                    {activeThread.proposal && (
                                        <div className="mb-6 rounded-xl border border-beet-nav-border bg-black/20 p-4">
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-beet-muted">
                                                <Briefcase size={12} /> Proposta de Negócio
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">{activeThread.proposal.title || 'Proposta Ativa'}</p>
                                            <p className="text-xs text-beet-muted line-clamp-2">Visualize os termos e orçamentos desta negociação.</p>
                                            <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                                                Ver Proposta <ExternalLink size={10} />
                                            </button>
                                        </div>
                                    )}

                                    {activeThread.collab && (
                                        <div className="mb-6 rounded-xl border border-beet-nav-border bg-black/20 p-4">
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-beet-muted">
                                                <Handshake size={12} /> Colaboração Artística
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">{activeThread.collab.title || 'Interesse em Collab'}</p>
                                            <p className="text-xs text-beet-muted">Discuta os detalhes da colaboração e alinhe as expectativas.</p>
                                        </div>
                                    )}

                                    {activeThread.listing && (
                                        <div className="mb-6 rounded-xl border border-beet-nav-border bg-black/20 p-4">
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-beet-muted">
                                                <ShoppingBag size={12} /> Item do Marketplace
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">{activeThread.listing.title}</p>
                                            <p className="text-lg font-black text-beet-green mt-1">R$ {activeThread.listing.price?.toLocaleString() || '---'}</p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="space-y-2 pt-4 border-t border-beet-nav-border">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-beet-muted mb-3 opacity-40">Ações Rápidas</p>
                                        <button className="w-full rounded-xl bg-beet-green/10 border border-beet-green/20 py-3 text-xs font-bold text-beet-green hover:bg-beet-green/20 transition-all">
                                            ENVIAR CONTRATO
                                        </button>
                                        <button className="w-full rounded-xl bg-white/5 py-3 text-xs font-bold text-beet-muted hover:text-white transition-all">
                                            VER PERFIL COMPLETO
                                        </button>
                                        <button className="w-full rounded-xl bg-beet-red/10 py-3 text-xs font-bold text-beet-red hover:bg-beet-red/20 transition-all">
                                            ENCERRAR CONVERSA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
    );
}

export default function IndustryMessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-beet-black"><div className="h-8 w-8 animate-spin rounded-full border-2 border-beet-green border-t-transparent" /></div>}>
            <IndustryMessagesContent />
        </Suspense>
    );
}

function XIcon({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
