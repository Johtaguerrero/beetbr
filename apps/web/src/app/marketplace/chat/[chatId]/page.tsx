'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore } from '@/lib/store';
import { Avatar, CustomEmojiPicker, RenderTextWithEmojis } from '@/components/ui';

function AntiFraudBanner() {
    return (
        <div className="mx-4 mt-2 rounded-xl border p-3 flex gap-2 text-[11px]"
            style={{ borderColor: 'rgba(255,212,0,0.25)', background: 'rgba(255,212,0,0.06)' }}>
            <span>🛡️</span>
            <p className="text-beet-muted">Negocie sempre pelo chat BEETBR. Nunca pague fora da plataforma sem verificação.</p>
        </div>
    );
}

export default function MarketplaceChat() {
    useAuthGuard();
    const params = useParams();
    const chatId = params.chatId as string;
    const { chatThreads, sendChatMessage, currentUser, fetchThreadMessages } = useStore();
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chat = chatThreads.find((c) => c.id === chatId);
    const listing = chat?.listing;

    useEffect(() => {
        if (chatId) {
            fetchThreadMessages(chatId);
        }
    }, [chatId, fetchThreadMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages?.length]);

    const handleSend = () => {
        if (!text.trim() || !chatId) return;
        sendChatMessage(chatId, text.trim());
        setText('');
    };

    if (!chat) {
        return (
            <div className="empty-state">
                <p className="text-5xl">💬</p>
                <p className="text-white font-semibold">Conversa não encontrada</p>
                <Link href="/marketplace" className="btn-outline text-sm">← Voltar ao Marketplace</Link>
            </div>
        );
    }

    const otherParticipant = chat.participants?.find(p => p.id !== currentUser?.id);
    const otherName = otherParticipant?.name || 'Vendedor';

    return (
        <>
            <div className="md:flex md:h-[calc(100vh-4rem)] md:items-center md:justify-center">
                <div className="flex flex-col w-full md:max-w-[480px] h-[calc(100dvh-64px-80px)] md:h-[calc(100vh-6rem)] md:rounded-2xl md:border overflow-hidden" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b px-4 py-3 flex-shrink-0"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <Link href="/marketplace" className="text-beet-muted hover:text-white transition-colors">←</Link>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                            style={{ background: 'var(--color-accent-dim)' }}>🛍️</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm line-clamp-1">{listing?.title || 'Anúncio'}</p>
                            <p className="text-[11px] text-beet-muted">{otherName}</p>
                        </div>
                        {listing && (
                            <Link href={`/marketplace/listing/${listing.id}`}
                                className="btn-outline px-3 py-1.5 text-[10px] flex-shrink-0">Ver anúncio</Link>
                        )}
                    </div>

                    <AntiFraudBanner />

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {chat.messages?.map((msg, i) => {
                            const isMe = msg.senderId === currentUser?.id;
                            return (
                                <motion.div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                                    {!isMe && (
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full mr-2 text-sm"
                                            style={{ background: 'var(--color-dark)' }}>🎤</div>
                                    )}
                                    <div className="max-w-[75%] space-y-0.5">
                                        {!isMe && (
                                            <p className="text-[10px] text-beet-muted ml-1">
                                                {msg.sender?.artistProfile?.stageName || msg.sender?.industryProfile?.companyName || 'Usuário'}
                                            </p>
                                        )}
                                        <div className="rounded-2xl px-4 py-2.5 text-sm"
                                            style={{
                                                background: isMe ? 'var(--color-accent)' : 'var(--color-card)',
                                                color: isMe ? 'var(--color-bg)' : 'white',
                                                borderBottomRightRadius: isMe ? 4 : undefined,
                                                borderBottomLeftRadius: !isMe ? 4 : undefined,
                                                border: !isMe ? '1px solid var(--color-border)' : 'none',
                                            }}>
                                            <RenderTextWithEmojis text={msg.content} />
                                        </div>
                                        <p className="text-[9px] text-beet-muted px-1 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 border-t p-4 flex-shrink-0 pb-safe items-center"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <CustomEmojiPicker onSelect={(emoji) => setText(prev => prev + emoji)} />
                        <input
                            className="beet-input flex-1 min-w-0 py-3"
                            placeholder="Digite sua mensagem..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        />
                        <button onClick={handleSend} disabled={!text.trim()}
                            className="btn-accent px-4 flex-shrink-0 disabled:opacity-40">
                            ✉️
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
