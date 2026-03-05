'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    Info,
    ShieldCheck,
    Zap,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { useStore, CollabThread, CollabMessage } from '@/lib/store';
import { Avatar, ScoreBeetBadge } from '@/components/ui';

export default function CollabThreadPage() {
    const params = useParams();
    const router = useRouter();
    const { collabThreads, currentUser, sendCollabMessage } = useStore();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const thread = collabThreads.find(t => t.id === params.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [thread?.messages]);

    if (!thread) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h2 className="text-2xl font-bold mb-4 font-outfit">Conversa não encontrada</h2>
                <button onClick={() => router.back()} className="text-beet-green flex items-center gap-2">
                    <ArrowLeft size={18} /> Voltar
                </button>
            </div>
        );
    }

    const isAuthor = thread.authorUserId === currentUser?.id;
    const otherName = (isAuthor ? thread.interestedUserName : thread.authorName) || 'Usuário';
    const otherScore = (isAuthor ? thread.interestedUserScore : thread.authorScore) || 0;

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendCollabMessage(thread.id, inputText);
        setInputText('');
    };

    return (
        <div className="md:flex md:h-[calc(100vh-64px)] md:items-center md:justify-center" style={{ background: 'var(--color-bg)' }}>
            <div className="flex flex-col relative overflow-hidden w-full md:max-w-[480px] h-[calc(100dvh-64px-80px)] md:h-[calc(100vh-6rem)] md:rounded-2xl md:border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-nav-border)' }}>
                {/* Thread Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between backdrop-blur-xl z-20" style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-nav-border)' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <Avatar name={otherName} size="sm" />
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h2 className="font-bold text-sm tracking-tight">{otherName}</h2>
                                    <ScoreBeetBadge score={otherScore} size="sm" />
                                </div>
                                <p className="text-[10px] text-beet-green uppercase font-black tracking-widest">{thread.collabPostTitle}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <Info size={20} className="text-white/40" />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <MoreVertical size={20} className="text-white/40" />
                        </button>
                    </div>
                </div>

                {/* Safety Notice */}
                <div className="bg-white/5 border-b border-white/5 px-4 py-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-beet-green" />
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Negociação Segura BEETBR</span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                        <div className="w-16 h-16 rounded-full bg-beet-green/10 flex items-center justify-center mb-4 border border-beet-green/20">
                            <Zap size={32} className="text-beet-green" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Conexão Iniciada!</h3>
                        <p className="text-[10px] max-w-[200px]">Vocês agora estão conectados para colaborar em: <span className="text-white font-bold">"{thread.collabPostTitle}"</span></p>
                    </div>

                    {thread.messages.map((msg, i) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.95, x: isMe ? 10 : -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                    ? 'bg-beet-green text-black font-medium rounded-tr-none'
                                    : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.text}
                                    <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-black/40' : 'text-white/20'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <CheckCircle2 size={10} />}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 backdrop-blur-xl border-t" style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-nav-border)' }}>
                    {(thread.status as string).toUpperCase() === 'ACTIVE' ? (
                        <div className="flex items-center gap-2">
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40">
                                <Paperclip size={20} />
                            </button>
                            <div className="flex-1 relative flex items-center">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Diga algo sobre a collab..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 focus:border-beet-green/50 outline-none transition-all text-sm"
                                />
                                <button className="absolute right-3 p-1 hover:text-beet-green transition-colors text-white/40">
                                    <Smile size={20} />
                                </button>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="p-3 bg-beet-green text-black rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-white/40 text-xs font-bold uppercase tracking-widest border border-white/5">
                            <Lock size={14} /> Esta conversa ainda não foi ativada
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
