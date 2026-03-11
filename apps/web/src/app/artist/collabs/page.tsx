'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Trash2,
    Pause,
    Play,
    ChevronRight,
    MessageCircle,
    Eye,
    Settings2,
    MoreVertical,
    Plus,
    Zap,
    Check,
    X,
    FileText
} from 'lucide-react';
import { useStore, CollabPost, CollabInterest, CollabThread } from '@/lib/store';
import { ScoreBeetBadge, Avatar, EmptyState } from '@/components/ui';
import Link from 'next/link';

export default function ArtistCollabsPage() {
    const {
        collabPosts,
        currentUser,
        collabInterests,
        collabThreads,
        acceptInterest,
        rejectInterest,
        updateCollabStatus
    } = useStore();

    const [activeTab, setActiveTab] = useState<'my-posts' | 'interests' | 'chats'>('my-posts');

    const myPosts = collabPosts.filter(p => p.authorId === currentUser?.id);
    const myInterestsReceived = (collabInterests || []).filter((i: CollabInterest) => {
        const post = collabPosts.find(p => p.id === (i.collabPostId || i.collabId));
        return post?.authorId === currentUser?.id;
    });
    const myCollabChats = (collabThreads || []).filter((t: CollabThread) => t.authorUserId === currentUser?.id || t.interestedUserId === currentUser?.id);

    // Stats calculate
    const totalViews = myPosts.reduce((acc, p) => acc + p.views, 0);
    const totalInterests = myPosts.reduce((acc, p) => acc + p.interestCount, 0);
    const totalChats = myPosts.reduce((acc, p) => acc + p.chatCount, 0);

    return (
        <div className="min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
            <div className="px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid var(--color-nav-border)' }}>
                    <div>
                        <p className="section-label" style={{ marginBottom: 8 }}>GERENCIAR PARCERIAS</p>
                        <h1 className="page-header text-white">MINHAS <span style={{ color: 'var(--color-accent)' }}>COLABS</span></h1>
                    </div>
                    <Link
                        href="/collabs/new"
                        className="btn-accent"
                    >
                        <Plus size={18} strokeWidth={2.5} /> NOVO ANÚNCIO
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <StatCard icon={<Eye size={20} className="text-blue-400" />} value={totalViews} label="Visualizações" />
                    <StatCard icon={<Zap size={20} className="text-beet-green" />} value={totalInterests} label="Interesses" />
                    <StatCard icon={<MessageCircle size={20} className="text-beet-red" />} value={totalChats} label="Chats" />
                </div>

                {/* Tabs */}
                <div className="flex mb-6" style={{ borderBottom: '1px solid var(--color-nav-border)' }}>
                    <TabButton active={activeTab === 'my-posts'} onClick={() => setActiveTab('my-posts')} label="Meus Anúncios" count={myPosts.length} />
                    <TabButton active={activeTab === 'interests'} onClick={() => setActiveTab('interests')} label="Interesses" count={myInterestsReceived.length} />
                    <TabButton active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} label="Chats de Collab" count={myCollabChats.length} />
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'my-posts' && (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {myPosts.length > 0 ? (
                                    myPosts.map(post => (
                                        <MyPostCard
                                            key={post.id}
                                            post={post}
                                            onToggleStatus={() => updateCollabStatus(post.id, (post.status as string).toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
                                        />
                                    ))
                                ) : (
                                    <EmptyState icon="📂" title="Sem anúncios" description="Você ainda não publicou nenhum anúncio de colaboração." />
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'interests' && (
                            <motion.div
                                key="interests"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {myInterestsReceived.length > 0 ? (
                                    myInterestsReceived.map(interest => {
                                        const post = collabPosts.find(p => p.id === (interest.collabPostId || interest.collabId));
                                        return (
                                            <InterestCard
                                                key={interest.id}
                                                interest={interest}
                                                postTitle={post?.title || ''}
                                                onAccept={() => acceptInterest(interest.id)}
                                                onReject={() => rejectInterest(interest.id)}
                                            />
                                        );
                                    })
                                ) : (
                                    <EmptyState icon="👋" title="Sem interesses" description="Ninguém demonstrou interesse em suas colabs ainda." />
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'chats' && (
                            <motion.div
                                key="chats"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                {myCollabChats.length > 0 ? (
                                    myCollabChats.map(thread => (
                                        <CollabChatRow key={thread.id} thread={thread} currentUserId={currentUser?.id || ''} />
                                    ))
                                ) : (
                                    <EmptyState icon="💬" title="Sem chats" description="Nenhuma conversa de colaboração ativa." />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
    return (
        <div className="beet-card p-4 flex flex-col items-center justify-center text-center">
            <div className="mb-2" style={{ color: 'var(--color-accent)' }}>{icon}</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{value}</span>
            <span className="meta-text">{label}</span>
        </div>
    );
}

function TabButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
    return (
        <button
            onClick={onClick}
            className={`cursor-pointer transition-colors relative ${active ? 'text-white' : ''}`}
            style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '12px 16px',
                color: active ? 'var(--color-primary-text, white)' : 'var(--color-muted)',
                letterSpacing: '-0.01em',
            }}
        >
            <div className="flex items-center gap-2">
                {label}
                {count > 0 && <span style={{
                    background: active ? 'var(--color-accent)' : 'var(--color-nav-border)',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '2px',
                    letterSpacing: 0
                }} className={active ? 'text-black' : 'text-white'}>{count}</span>}
            </div>
            {active && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent-glow)' }} />}
        </button>
    );
}

function MyPostCard({ post, onToggleStatus }: { post: CollabPost, onToggleStatus: () => void }) {
    return (
        <div className="beet-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center text-2xl" style={{ background: 'var(--color-accent-dim)', borderRadius: '2px' }}>
                    🎯
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="card-title">{post.title}</h3>
                        <span className={(post.status as string).toUpperCase() === 'ACTIVE' ? 'status-acc' : 'status-new'}>
                            {(post.status as string).toUpperCase() === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                        </span>
                    </div>
                    <p className="meta-text truncate max-w-[200px] md:max-w-[400px]" style={{ marginTop: 4 }}>
                        {post.interestCount} INTERESSES • {post.chatCount} CHATS • CRIADO EM {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={`/collabs/${post.id}`}
                    className="btn-outline flex items-center justify-center p-0" style={{ width: 40, height: 40 }}
                >
                    <Eye size={18} />
                </Link>
                <button
                    onClick={onToggleStatus}
                    className="btn-outline flex items-center justify-center p-0" style={{ width: 40, height: 40 }}
                >
                    {(post.status as string).toUpperCase() === 'ACTIVE' ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button className="btn-ghost flex items-center justify-center p-0 text-white" style={{ width: 40, height: 40 }}>
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}

function InterestCard({ interest, postTitle, onAccept, onReject }: { interest: CollabInterest, postTitle: string, onAccept: () => void, onReject: () => void }) {
    return (
        <div className="beet-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar name={interest.interestedUserName || interest.userName} size="sm" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800 }}>{interest.interestedUserName || interest.userName}</span>
                            <ScoreBeetBadge score={interest.interestedUserScore || 0} size="sm" />
                        </div>
                        <p className="meta-text" style={{ marginTop: 2 }}>INTERESSE EM: {postTitle}</p>
                    </div>
                </div>
                <span className="meta-text">{new Date(interest.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>

            <div className="flex gap-2">
                {String(interest.status).toUpperCase() === 'PENDING' ? (
                    <>
                        <button
                            onClick={onAccept}
                            className="btn-accent flex-1 flex items-center justify-center gap-2"
                        >
                            <Check size={18} /> ACEITAR
                        </button>
                        <button
                            onClick={onReject}
                            className="btn-outline flex-1 flex items-center justify-center gap-2"
                        >
                            <X size={18} /> RECUSAR
                        </button>
                    </>
                ) : (
                    <div className={`w-full py-2 font-bold text-sm text-center tracking-widest ${String(interest.status).toUpperCase() === 'ACCEPTED' ? 'status-acc' : 'status-rej'
                        }`}>
                        {String(interest.status).toUpperCase() === 'ACCEPTED' ? 'INTERESSE ACEITO' : 'RECUSADO'}
                    </div>
                )}
            </div>
        </div>
    );
}

function CollabChatRow({ thread, currentUserId }: { thread: CollabThread, currentUserId: string }) {
    const isAuthor = thread.authorUserId === currentUserId;
    const otherName = isAuthor ? thread.interestedUserName : thread.authorName;
    const lastMsg = thread.messages[thread.messages.length - 1];

    return (
        <Link
            href={`/collabs/thread/${thread.id}`}
            className="beet-card flex items-center gap-4 p-4 hover:border-white/20 group"
            style={{ textDecoration: 'none' }}
        >
            <Avatar name={otherName} size="md" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800 }} className="truncate text-white">{otherName}</span>
                    <span className="meta-text">{new Date(thread.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="status-acc shrink-0">
                        COLLAB
                    </span>
                    <p className="meta-text truncate italic" style={{ color: 'var(--color-muted)', letterSpacing: 0, textTransform: 'none' }}>
                        "{thread.collabPostTitle}"
                    </p>
                </div>
                <p className="truncate mt-1 text-sm text-white/60">
                    {lastMsg?.text}
                </p>
            </div>
            <ChevronRight size={20} className="text-white/10 group-hover:text-beet-green transition-colors" />
        </Link>
    );
}


