'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Search, ChevronLeft, Smile, MoreVertical,
    MessageSquare, Briefcase, ShoppingBag, Handshake,
    User, CheckCircle2, ExternalLink, X, Info, Plus,
    Clock, Shield, Zap
} from 'lucide-react';
import { useStore, type ChatThread, type ChatMessage } from '@/lib/store';
import { Avatar, Spinner, StatusBadge, CustomEmojiPicker, RenderTextWithEmojis } from '@/components/ui';

// ── Thread type label/icon map ─────────────────────────────────
const THREAD_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    PROPOSAL:    { label: 'PROPOSTA',    icon: <Briefcase size={12} />,   color: '#FFD400' },
    COLLAB:      { label: 'COLLAB',      icon: <Handshake size={12} />,   color: '#00FF88' },
    MARKETPLACE: { label: 'MARKETPLACE', icon: <ShoppingBag size={12} />, color: '#0057FF' },
    DIRECT:      { label: 'DIRETO',      icon: <User size={12} />,        color: '#8B5CF6' },
};

function IndustryMessagesContent() {
    const searchParams = useSearchParams();
    const threadIdFromUrl = searchParams.get('id');
    const {
        currentUser,
        chatThreads,
        fetchChatThreads,
        fetchThreadMessages,
        sendMessage,
        markThreadAsRead,
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeThread = chatThreads.find(t => t.id === activeThreadId);

    // Initial load
    useEffect(() => { fetchChatThreads(); }, [fetchChatThreads]);

    // Handle URL thread id
    useEffect(() => {
        if (threadIdFromUrl) setActiveThreadId(threadIdFromUrl);
    }, [threadIdFromUrl]);

    // Load messages when thread changes
    useEffect(() => {
        if (activeThreadId) {
            loadMessages(activeThreadId);
            markThreadAsRead(activeThreadId);
        } else {
            setMessages([]);
        }
    }, [activeThreadId]);

    // Polling
    useEffect(() => {
        if (!activeThreadId) return;
        const interval = setInterval(() => loadMessages(activeThreadId, true), 30000);
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!activeThreadId || !newMessage.trim() || isSending) return;
        setIsSending(true);
        try {
            await sendMessage(activeThreadId, newMessage.trim());
            setNewMessage('');
            textareaRef.current?.focus();
            await loadMessages(activeThreadId, true);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const filteredThreads = chatThreads
        .filter(t => {
            const matchSearch = t.participants?.some(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || t.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = filterType === 'ALL' || t.type === filterType;
            return matchSearch && matchType;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const getOther = (thread: ChatThread) =>
        thread.participants?.find(p => p.id !== currentUser?.id) || { name: 'Desconhecido', avatarUrl: null };

    const meta = (type: string) => THREAD_META[type] || THREAD_META.DIRECT;

    // ── Sidebar ──────────────────────────────────────────────────
    const Sidebar = (
        <div className={`
            flex flex-col h-full
            border-r border-white/[0.06]
            bg-black/30 backdrop-blur-2xl
            transition-all duration-300
            ${activeThreadId ? 'hidden lg:flex lg:w-[300px] xl:w-[340px]' : 'w-full'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <div>
                    <h1 className="font-syne text-lg font-black text-white tracking-tight uppercase">Mensagens</h1>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-0.5">
                        {chatThreads.length} conversas
                    </p>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/[0.08] text-white/40 hover:bg-beet-green/10 hover:border-beet-green/30 hover:text-beet-green transition-all">
                    <Plus size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={13} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-beet-green/40 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-3">
                {(['ALL', 'PROPOSAL', 'COLLAB', 'MARKETPLACE'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filterType === type
                                ? 'bg-beet-green text-black border-beet-green shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                                : 'bg-white/[0.04] text-white/30 border-white/[0.07] hover:border-white/20 hover:text-white/60'
                        }`}
                    >
                        {type === 'ALL' ? 'Todas' : type}
                    </button>
                ))}
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto">
                {filteredThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center opacity-20">
                        <MessageSquare size={36} className="mb-3" />
                        <p className="text-xs font-black uppercase tracking-widest">Nenhuma conversa</p>
                    </div>
                ) : filteredThreads.map(thread => {
                    const other = getOther(thread);
                    const isActive = thread.id === activeThreadId;
                    const m = meta(thread.type);
                    return (
                        <motion.button
                            key={thread.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setActiveThreadId(thread.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-white/[0.05] transition-all relative ${
                                isActive
                                    ? 'bg-beet-green/[0.08] border-l-2 border-l-beet-green'
                                    : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
                            }`}
                        >
                            {/* Avatar with type badge */}
                            <div className="relative shrink-0">
                                <Avatar name={other.name} imageUrl={other.avatarUrl} size="md" />
                                <div
                                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-black/50"
                                    style={{ background: m.color + '22', color: m.color }}
                                >
                                    {m.icon}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className={`text-sm font-bold truncate ${isActive ? 'text-beet-green' : 'text-white'}`}>
                                        {other.name}
                                    </p>
                                    <span className="text-[9px] text-white/25 whitespace-nowrap">
                                        {new Date(thread.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/35 truncate">{thread.lastMessage || 'Nova conversa'}</p>
                                <span
                                    className="mt-1 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"
                                    style={{ color: m.color + '99' }}
                                >
                                    {m.icon} {m.label}
                                </span>
                            </div>

                            {thread.status === 'UNREAD' && (
                                <div className="h-2 w-2 shrink-0 rounded-full bg-beet-green shadow-[0_0_8px_#00FF88]" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    // ── Empty state (no thread selected, desktop) ─────────────────
    const EmptyState = (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-8 bg-black/10">
            <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full border border-beet-green/20 bg-beet-green/5 flex items-center justify-center">
                    <MessageSquare size={40} className="text-beet-green opacity-60" />
                </div>
                <div className="absolute inset-0 bg-beet-green/10 blur-3xl rounded-full" />
            </div>
            <h2 className="font-syne text-xl font-black uppercase tracking-tight text-white mb-2 opacity-50">Suas conversas</h2>
            <p className="text-sm text-white/25 max-w-xs">Selecione uma conversa ao lado para visualizá-la.</p>
        </div>
    );

    // ── Chat Area ────────────────────────────────────────────────
    const ChatArea = activeThread ? (
        <div className="flex flex-1 flex-col h-full min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveThreadId(null)}
                        className="lg:hidden p-2 -ml-1 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="relative">
                        <Avatar name={getOther(activeThread).name} imageUrl={getOther(activeThread).avatarUrl} size="md" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-beet-green border-2 border-beet-black shadow-[0_0_6px_#00FF88]" />
                    </div>

                    <div>
                        <p className="font-bold text-white text-sm leading-tight">{getOther(activeThread).name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                                style={{ color: meta(activeThread.type).color }}
                            >
                                {meta(activeThread.type).icon}
                                {meta(activeThread.type).label}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <StatusBadge status={activeThread.status} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            showDetails
                                ? 'bg-beet-green/20 border-beet-green/40 text-beet-green'
                                : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white hover:bg-white/[0.08]'
                        }`}
                    >
                        <Info size={12} />
                        <span className="hidden sm:inline">Detalhes</span>
                    </button>
                    <button className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-1"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.08) transparent',
                }}
            >
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-beet-green border-t-transparent" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Carregando...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center opacity-25 select-none">
                        <div className="relative mb-4">
                            <Smile size={52} className="text-beet-green" />
                            <div className="absolute inset-0 bg-beet-green/20 blur-2xl" />
                        </div>
                        <p className="font-syne font-black uppercase text-sm tracking-tight">Comece a conversa!</p>
                        <p className="text-xs mt-1 text-white/40">Envie uma mensagem para iniciar.</p>
                    </div>
                ) : (
                    <>
                        {/* Date / session header */}
                        <div className="flex items-center gap-3 py-2 mb-2">
                            <div className="flex-1 h-px bg-white/[0.05]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1">
                                <Shield size={9} /> Conversa segura BEETBR
                            </span>
                            <div className="flex-1 h-px bg-white/[0.05]" />
                        </div>

                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser?.id;
                            const prevMsg = messages[i - 1];
                            const nextMsg = messages[i + 1];
                            const isSameGroupPrev = prevMsg?.senderId === msg.senderId;
                            const isSameGroupNext = nextMsg?.senderId === msg.senderId;

                            // Rounded corners for grouped messages
                            const myRadius = isSameGroupNext ? 'rounded-[20px_20px_6px_20px]' : 'rounded-[20px_20px_2px_20px]';
                            const otherRadius = isSameGroupNext ? 'rounded-[20px_20px_20px_6px]' : 'rounded-[20px_20px_20px_2px]';

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isSameGroupPrev ? 'mt-0.5' : 'mt-3'}`}
                                >
                                    {/* Avatar — show only for first in group */}
                                    {!isMe && (
                                        <div className={`shrink-0 ${isSameGroupNext ? 'invisible' : ''}`}>
                                            <Avatar
                                                name={getOther(activeThread).name}
                                                imageUrl={getOther(activeThread).avatarUrl}
                                                size="sm"
                                            />
                                        </div>
                                    )}

                                    <div className={`flex flex-col max-w-[78%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        {isMe ? (
                                            /* My message: beet-green glass bubble */
                                            <div className={`
                                                relative px-4 py-2.5 text-sm font-medium leading-relaxed
                                                bg-beet-green text-black ${myRadius}
                                                shadow-[0_4px_20px_rgba(0,255,136,0.2)]
                                            `}>
                                                <RenderTextWithEmojis text={msg.content} />
                                                <div className="flex items-center justify-end gap-1 mt-1.5">
                                                    <span className="text-[9px] font-black opacity-40 uppercase">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <CheckCircle2 size={9} className="opacity-50" />
                                                </div>
                                            </div>
                                        ) : (
                                            /* Other: glass dark bubble */
                                            <div className={`
                                                relative px-4 py-2.5 text-sm text-white leading-relaxed
                                                border border-white/[0.09] bg-white/[0.05] backdrop-blur-md
                                                ${otherRadius}
                                            `}>
                                                <RenderTextWithEmojis text={msg.content} />
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <span className="text-[9px] font-black text-white/30 uppercase">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-2" />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="shrink-0 px-3 py-3 border-t border-white/[0.06] bg-black/20 backdrop-blur-xl">
                <div className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2">
                    <div className="shrink-0 flex items-center gap-0.5 pb-0.5">
                        <CustomEmojiPicker onSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
                    </div>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="Mensagem..."
                        className="flex-1 min-w-0 resize-none bg-transparent text-sm text-white placeholder-white/25 outline-none py-1.5 leading-relaxed"
                        style={{ maxHeight: '110px', scrollbarWidth: 'none' }}
                        value={newMessage}
                        onChange={e => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={`shrink-0 mb-0.5 flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                            newMessage.trim() && !isSending
                                ? 'bg-beet-green text-black shadow-[0_0_16px_rgba(0,255,136,0.4)] hover:shadow-[0_0_24px_rgba(0,255,136,0.6)]'
                                : 'bg-white/[0.06] text-white/20'
                        }`}
                    >
                        {isSending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Send size={16} />
                        )}
                    </motion.button>
                </div>
                <p className="mt-1.5 text-center text-[9px] text-white/15 font-black uppercase tracking-widest">
                    Enter para enviar · Shift+Enter para nova linha
                </p>
            </form>
        </div>
    ) : null;

    // ── Details Drawer ────────────────────────────────────────────
    const DetailsPanel = (
        <AnimatePresence>
            {showDetails && activeThread && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm border-l border-white/[0.07] bg-black/60 backdrop-blur-2xl shadow-2xl lg:relative lg:z-auto lg:max-w-none lg:w-72"
                >
                    <div className="flex h-full flex-col">
                        {/* Details header */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Detalhes</p>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Participant */}
                            <div className="flex flex-col items-center text-center pt-2">
                                <Avatar name={getOther(activeThread).name} imageUrl={getOther(activeThread).avatarUrl} size="xl" className="mb-3" />
                                <p className="font-syne font-black text-white uppercase tracking-tight">{getOther(activeThread).name}</p>
                                <span
                                    className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                                    style={{ color: meta(activeThread.type).color }}
                                >
                                    {meta(activeThread.type).icon} {meta(activeThread.type).label}
                                </span>
                            </div>

                            {/* Context card */}
                            {(activeThread.proposal || activeThread.collab || activeThread.listing) && (
                                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-1">
                                    {activeThread.proposal && (
                                        <>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-400/70 mb-2">
                                                <Briefcase size={10} /> Proposta de Negócio
                                            </div>
                                            <p className="text-sm font-bold text-white">{activeThread.proposal.title || 'Proposta Ativa'}</p>
                                        </>
                                    )}
                                    {activeThread.collab && (
                                        <>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-beet-green/70 mb-2">
                                                <Handshake size={10} /> Colaboração
                                            </div>
                                            <p className="text-sm font-bold text-white">{activeThread.collab.title || 'Interesse em Collab'}</p>
                                        </>
                                    )}
                                    {activeThread.listing && (
                                        <>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400/70 mb-2">
                                                <ShoppingBag size={10} /> Marketplace
                                            </div>
                                            <p className="text-sm font-bold text-white">{activeThread.listing.title}</p>
                                            {activeThread.listing.price && (
                                                <p className="text-lg font-black text-beet-green mt-1">
                                                    R$ {activeThread.listing.price.toLocaleString('pt-BR')}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Ações</p>
                                <button className="w-full rounded-xl border border-beet-green/20 bg-beet-green/[0.08] py-3 text-xs font-black uppercase tracking-widest text-beet-green hover:bg-beet-green/20 transition-all">
                                    Enviar Contrato
                                </button>
                                <button className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-3 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
                                    Ver Perfil
                                </button>
                                <button className="w-full rounded-xl border border-red-500/10 bg-red-500/[0.04] py-3 text-xs font-black uppercase tracking-widest text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                    Encerrar Conversa
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div
            className="flex h-[calc(100dvh-env(safe-area-inset-bottom))] w-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #080808 0%, #0d0d0d 50%, #080808 100%)' }}
        >
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-beet-green/[0.03] blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-500/[0.02] blur-3xl" />
            </div>

            <div className="relative z-10 flex w-full h-full">
                {Sidebar}
                {activeThread ? ChatArea : EmptyState}
                {DetailsPanel}
            </div>
        </div>
    );
}

export default function IndustryMessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-beet-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-beet-green border-t-transparent" />
            </div>
        }>
            <IndustryMessagesContent />
        </Suspense>
    );
}
