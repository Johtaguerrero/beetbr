'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Post, type Story, type PublishTarget } from '@/lib/store';
import { api } from '@/lib/api';
import { Avatar, ScoreBeetBadge, Skeleton, EmptyState, TrackPlayer, CustomEmojiPicker, RenderTextWithEmojis, FollowButton } from '@/components/ui';
import { Heart, MessageCircle, Share2, Zap, MoreHorizontal, MoreVertical, Plus, UserPlus, PenLine, Image, Upload, X, Music, Film, Camera, FileText, VolumeX, Volume2, Pin, Archive, Trash2, Eye, Flame, Bookmark, Edit3, ShoppingBag } from 'lucide-react';

const PUBLISH_TARGETS: { key: PublishTarget; label: string; icon: string; desc: string }[] = [
    { key: 'FEED', label: 'Feed', icon: '📡', desc: 'Aparece no feed com boost 48h' },
    { key: 'STORY', label: 'Story', icon: '⏱', desc: 'Expira em 24h' },
    { key: 'FEED_AND_STORY', label: 'Feed + Story', icon: '🚀', desc: 'Máxima visibilidade' },
    { key: 'PROFILE_ONLY', label: 'Só Perfil', icon: '📂', desc: 'Salva no portfólio' },
];


/* ── Type colours ──────────────────────────────────────── */
const TC: Record<string, { label: string; color: string }> = {
    TRACK: { label: 'TRACK', color: '#00FF88' },
    VIDEO: { label: 'VIDEO', color: '#7000FF' },
    IMAGE: { label: 'IMAGE', color: '#FF8800' },
    LYRIC: { label: 'LYRIC', color: '#00E5FF' },
    MARKETPLACE: { label: 'MARKET', color: '#FF3B5C' },
};

const POST_TYPES = [
    { key: 'IMAGE', icon: Camera, label: 'Imagem', accept: 'image/*', color: '#FF8800' },
    { key: 'VIDEO', icon: Film, label: 'Vídeo', accept: 'video/*', color: '#7000FF' },
    { key: 'TRACK', icon: Music, label: 'Faixa', accept: 'audio/*', color: '#00FF88' },
    { key: 'LYRIC', icon: FileText, label: 'Letra', accept: 'image/*', color: '#00E5FF' },
] as const;

/* ══════════════════════════════════════════════════════════
   INLINE COMPOSER — create posts directly on feed
══════════════════════════════════════════════════════════ */
function InlineComposer() {
    const { createPost, addToast } = useStore();
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [postType, setPostType] = useState<string>('IMAGE');
    const [publishTarget, setPublishTarget] = useState<PublishTarget>('FEED');
    const [publishing, setPublishing] = useState(false);

    const selectedType = POST_TYPES.find(t => t.key === postType) || POST_TYPES[0];

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        if (f.type.startsWith('image') || f.type.startsWith('video')) {
            setFilePreview(URL.createObjectURL(f));
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setFilePreview(null);
    };

    const handlePublish = async () => {
        if (!text.trim() && !file) { addToast({ message: 'Adicione texto ou arquivo!', type: 'error' }); return; }
        setPublishing(true);
        try {
            await createPost({ type: postType as any, text, hashtags: [], file: file || undefined, publishTarget });
            setText('');
            clearFile();
            setExpanded(false);
        } catch (e) { /* toast handled by store */ }
        setPublishing(false);
    };

    return (
        <div style={{
            margin: '12px 12px 0', padding: '16px',
            background: 'var(--color-card)', border: '1px solid var(--color-nav-border)',
            borderLeft: `3px solid ${selectedType.color}`,
            borderRadius: '2px',
        }}>
            {!expanded ? (
                <button onClick={() => setExpanded(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--color-accent-dim)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <PenLine size={18} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px',
                        color: 'var(--color-muted)', flex: 1,
                    }}>O que você quer compartilhar?</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {POST_TYPES.slice(0, 3).map(t => (
                            <t.icon key={t.key} size={18} style={{ color: t.color, opacity: 0.6 }} />
                        ))}
                    </div>
                </button>
            ) : (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <textarea
                        value={text} onChange={e => setText(e.target.value)}
                        placeholder="O que está acontecendo no estúdio?"
                        style={{
                            width: '100%', minHeight: 120, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-nav-border)',
                            borderRadius: '4px', padding: '12px', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 16,
                            resize: 'none', marginBottom: 12, outline: 'none'
                        }}
                    />

                    {filePreview && (
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            {postType === 'VIDEO' ? (
                                <video src={filePreview} style={{ width: '100%', maxHeight: 200, borderRadius: 4, objectFit: 'cover' }} />
                            ) : (
                                <img src={filePreview} style={{ width: '100%', maxHeight: 200, borderRadius: 4, objectFit: 'cover' }} />
                            )}
                            <button onClick={clearFile} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: 4, color: 'white', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                    )}
                    
                    {!filePreview && file && postType === 'TRACK' && (
                         <div style={{ padding: 12, background: 'var(--color-glass-btn)', borderRadius: '4px', border: '1px solid var(--color-nav-border)', marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: 'white', marginBottom: 4 }}>🎵 {file.name}</p>
                            <button onClick={clearFile} style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10 }}>REMOVER</button>
                         </div>
                    )}

                    {/* Type selector */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {POST_TYPES.map(t => (
                            <label
                                key={t.key}
                                style={{
                                    flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    padding: '10px', borderRadius: '2px', border: '1px solid var(--color-nav-border)',
                                    background: postType === t.key ? `${t.color}20` : 'var(--color-glass-btn)',
                                    color: postType === t.key ? t.color : 'var(--color-muted)',
                                    fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setPostType(t.key)}
                            >
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept={t.accept} 
                                    onChange={(e) => {
                                        setPostType(t.key);
                                        handleFile(e);
                                    }} 
                                />
                                <t.icon size={14} />
                                <span className="hidden sm:inline">{t.label.toUpperCase()}</span>
                            </label>
                        ))}
                    </div>

                    {/* Publish target */}
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: 8, letterSpacing: '0.12em' }}>ONDE PUBLICAR?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
                        {PUBLISH_TARGETS.map(target => (
                            <button
                                key={target.key}
                                onClick={() => setPublishTarget(target.key)}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: 4, padding: '10px', borderRadius: '2px',
                                    border: '1px solid var(--color-nav-border)',
                                    background: publishTarget === target.key ? 'var(--color-accent-dim)' : 'rgba(255,255,255,0.02)',
                                    color: publishTarget === target.key ? 'var(--color-accent)' : 'var(--color-muted)',
                                    textAlign: 'left', transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 16 }}>{target.icon}</span>
                                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 800 }}>{target.label.toUpperCase()}</span>
                                </div>
                                <span style={{ fontSize: '9px', opacity: 0.6 }}>{target.desc}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setExpanded(false)} style={{ flex: 1, padding: '14px', border: '1px solid var(--color-nav-border)', background: 'none', color: 'var(--color-muted)', borderRadius: '2px', fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>CANCELAR</button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            style={{
                                flex: 2, padding: '14px', background: 'var(--color-accent)', color: '#000', border: 'none', borderRadius: '2px',
                                fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', cursor: (publishing || (!text.trim() && !file)) ? 'default' : 'pointer',
                                opacity: (publishing || (!text.trim() && !file)) ? 0.5 : 1
                            }}
                        >
                            {publishing ? 'PUBLICANDO...' : 'PUBLICAR AGORA'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   STORY BUBBLE  — round, neon ring when unseen
══════════════════════════════════════════════════════════ */
function StoryBubble({ story, isAdd, onSelect }: { story?: Story; isAdd?: boolean; onSelect?: (s: Story) => void }) {
    const { createStory } = useStore();
    const [seen, setSeen] = useState(story?.seen);
    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (f) await createStory(f);
    };

    /* ── ADD button ── */
    if (isAdd) return (
        <label className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer select-none">
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFile} />
            {/* outer ring dashed */}
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '2px dashed var(--color-nav-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-glass-btn)',
                transition: 'all .2s',
            }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-glass-btn-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-nav-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-glass-btn)'; }}
            >
                <Plus size={22} strokeWidth={2} style={{ color: 'var(--color-muted)' }} />
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>STORY</span>
        </label>
    );

    if (!story) return null;
    /* ── Story ring ── */
    return (
        <button className="flex flex-col items-center gap-2 flex-shrink-0 select-none" onClick={() => { setSeen(true); onSelect?.(story); }}>
            <div style={{
                padding: 3, borderRadius: '50%',
                background: seen
                    ? 'var(--color-glass-btn)'
                    : 'conic-gradient(from 0deg, var(--color-accent), #00E5FF, #7000FF, var(--color-accent))',
                boxShadow: seen ? 'none' : '0 0 16px rgba(0,255,136,0.35)',
            }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-bg)' }}>
                    <Avatar name={story.artist?.stageName || 'Artist'} imageUrl={story.artist?.avatarUrl} size="lg" />
                </div>
            </div>
            <span style={{
                maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                color: seen ? 'var(--color-muted)' : 'var(--color-primary-text)', textTransform: 'uppercase',
            }}>{(story.artist?.stageName || 'Artist').split(' ')[0]}</span>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   COMMENT SHEET MODAL
══════════════════════════════════════════════════════════ */
function CommentSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'var(--color-bg)', borderTop: '1px solid var(--color-nav-border)',
                        borderTopLeftRadius: 16, borderTopRightRadius: 16,
                        height: '70vh', display: 'flex', flexDirection: 'column',
                        maxWidth: 480, margin: '0 auto'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--color-nav-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800 }}>Comentários</h3>
                        <button onClick={onClose} style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        <EmptyState icon="💬" title="Nenhum comentário" description="Seja o primeiro a comentar!" />
                    </div>

                    <div style={{ padding: 16, borderTop: '1px solid var(--color-nav-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <CustomEmojiPicker onSelect={(emoji) => setComment(prev => prev + emoji)} />
                        <textarea
                            value={comment} onChange={e => setComment(e.target.value)}
                            placeholder="Adicione um comentário..."
                            rows={1}
                            style={{
                                flex: 1, background: 'var(--color-card)', border: '1px solid var(--color-nav-border)',
                                borderRadius: 20, padding: '10px 16px', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 14,
                                resize: 'none', outline: 'none'
                            }}
                        />
                        <button
                            disabled={!comment.trim()}
                            style={{
                                background: comment.trim() ? 'var(--color-accent)' : 'var(--color-nav-border)',
                                color: comment.trim() ? '#000' : 'var(--color-muted)',
                                border: 'none', borderRadius: 20, padding: '10px 16px', fontWeight: 700,
                                cursor: comment.trim() ? 'pointer' : 'default',
                                fontFamily: 'Space Mono, monospace', fontSize: 12, textTransform: 'uppercase'
                            }}
                            onClick={() => { setComment(''); onClose(); }}
                        >
                            Enviar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════════════
   POST CARD — bigger fonts, left accent border
══════════════════════════════════════════════════════════ */
function PostCard({ post, isStoryOpen, onMediaClick, onReelsOpen }: { post: Post; isStoryOpen?: boolean; onMediaClick?: () => void; onReelsOpen?: () => void }) {
    const { togglePostLike, artistProfile, currentUser, archivePost, deletePost, pinPost, unpinPost } = useStore();
    const [liked, setLiked] = useState(post.liked);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<any[]>([]); // Local state for demo
    const [showMenu, setShowMenu] = useState(false);
    const lastTap = useRef<number>(0);
    const tc = TC[post.type] || TC.TRACK;

    const isOwn = artistProfile?.id === post.artistId;
    const isBoosted = post.boostExpiresAt ? Date.now() < new Date(post.boostExpiresAt).getTime() : false;
    const isPinned = post.status === 'PINNED';
    const boostRemaining = post.boostExpiresAt
        ? Math.max(0, Math.ceil((new Date(post.boostExpiresAt).getTime() - Date.now()) / 3600000))
        : 0;

    const containerRef = useRef<HTMLElement>(null);
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

    // Auto-play / Auto-pause logic
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const media = mediaRef.current;
                if (!media || isStoryOpen) {
                    if (media && !media.paused) media.pause();
                    return;
                }

                if (entry.intersectionRatio >= 0.6) {
                    const playPromise = media.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => { /* autoplay prevented by browser */ });
                    }
                } else {
                    if (!media.paused) media.pause();
                }
            });
        }, { threshold: [0, 0.6, 1.0] });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isStoryOpen]);

    // Force pause if story opens
    useEffect(() => {
        if (isStoryOpen && mediaRef.current && !mediaRef.current.paused) {
            mediaRef.current.pause();
        }
    }, [isStoryOpen]);

    const addPostComment = (postId: string, text: string) => {
        const newRef = { text, authorName: 'Você', createdAt: new Date().toISOString() };
        setComments(prev => [newRef, ...prev]);
    };

    const timeAgo = () => {
        const diff = Date.now() - new Date(post.createdAt).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return 'AGORA';
        if (h < 24) return `${h}H`;
        return `${Math.floor(h / 24)}D`;
    };

    return (
        <motion.article
            ref={containerRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                marginBottom: 16,
                background: 'var(--color-card)',
                border: '1px solid var(--color-nav-border)',
                borderLeft: `3px solid ${tc.color}`,
                borderRadius: '2px',
                overflow: 'visible', // Change to visible to allow emoji picker popup
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                position: 'relative'
            }}
        >
            {/* top gradient line */}
            <div style={{ height: 1, background: `linear-gradient(90deg, ${tc.color}70, transparent)` }} />

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid var(--color-nav-border)', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
                    <Link href={`/artist/profile/${post.artistId}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
                        <div style={{ flexShrink: 0 }}>
                            <Avatar name={post.artist?.stageName || 'Artist'} imageUrl={post.artist?.avatarUrl} size="md" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-text, white)', lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {post.artist?.stageName || 'Artist'}
                                </span>
                                <div style={{ flexShrink: 0 }}>
                                    <ScoreBeetBadge score={post.artist?.scoreBeet || 0} size="sm" />
                                </div>
                            </div>
                            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: 2, display: 'block' }}>
                                {timeAgo()} AGO
                            </span>
                        </div>
                    </Link>
                    
                    {!isOwn && (
                        <div style={{ flexShrink: 0 }}>
                            <FollowButton artistId={post.artistId} size="sm" showIcon={false} className="h-6 text-[9px] px-2" />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0, maxWidth: '45%' }}>
                    {/* Boost badge */}
                    {isBoosted && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontFamily: 'Space Mono, monospace', fontSize: '7px', fontWeight: 800, letterSpacing: '0.05em',
                            padding: '2px 6px', borderRadius: '2px',
                            border: '1px solid rgba(255,165,0,0.3)', background: 'rgba(255,165,0,0.08)', color: '#FFA500',
                            whiteSpace: 'nowrap'
                        }}>
                            <Flame size={8} /> {boostRemaining}H
                        </span>
                    )}
                    {/* Pinned badge */}
                    {isPinned && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontFamily: 'Space Mono, monospace', fontSize: '7px', fontWeight: 800,
                            padding: '2px 6px', borderRadius: '2px',
                            border: '1px solid rgba(0,255,136,0.25)', background: 'rgba(0,255,136,0.05)', color: 'var(--color-accent)',
                            whiteSpace: 'nowrap'
                        }}>
                            <Pin size={8} /> FIX
                        </span>
                    )}
                    {/* type badge */}
                    <span style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '7px', fontWeight: 800, letterSpacing: '0.1em',
                        padding: '2px 6px', borderRadius: '2px',
                        border: `1px solid ${tc.color}40`, background: `${tc.color}08`, color: tc.color,
                        whiteSpace: 'nowrap'
                    }}>{tc.label.toUpperCase()}</span>
                    
                    {/* 3-dot menu */}
                    <div style={{ position: 'relative', marginLeft: 2 }}>
                        <button onClick={() => setShowMenu(!showMenu)} style={{ color: 'var(--color-muted)', padding: '2px', lineHeight: 1, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <MoreVertical size={16} strokeWidth={2} />
                        </button>
                        {showMenu && isOwn && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: 4,
                                    background: 'var(--color-card)', border: '1px solid var(--color-nav-border)',
                                    borderRadius: '4px', overflow: 'hidden', zIndex: 50,
                                    minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                }}
                            >
                                {[
                                    { label: isPinned ? 'Desafixar' : 'Fixar no Perfil', icon: Pin, action: () => isPinned ? unpinPost(post.id) : pinPost(post.id), color: 'var(--color-accent)' },
                                    { label: 'Arquivar', icon: Archive, action: () => archivePost(post.id), color: '#FFA500' },
                                    { label: 'Excluir', icon: Trash2, action: () => { if (confirm('Excluir este post?')) deletePost(post.id); }, color: '#FF0055' },
                                ].map((item, i) => (
                                    <button key={i} onClick={() => { item.action(); setShowMenu(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                            padding: '10px 14px', border: 'none', background: 'none',
                                            color: item.color, cursor: 'pointer', textAlign: 'left',
                                            fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700,
                                            letterSpacing: '0.06em',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                    >
                                        <item.icon size={14} /> {item.label.toUpperCase()}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: '18px 18px 14px' }} className="md:px-[18px] px-0">
                {post.text && (
                    <div className="px-[18px] md:px-0">
                        <p style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: '17px',     /* big! */
                            lineHeight: 1.65,
                            color: 'var(--color-primary-text)',
                            marginBottom: 14,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                        }}>
                            {post.text.split(' ').map((w, i) =>
                                w.startsWith('#')
                                    ? <span key={i} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{w} </span>
                                    : <span key={i}>{w} </span>
                            )}
                        </p>
                    </div>
                )}

                {post.mediaUrl && post.type === 'VIDEO' && (
                    <div 
                        onClick={(e) => {
                            const now = Date.now();
                            if (now - lastTap.current < 300) {
                                // Double tap
                                if (onReelsOpen) onReelsOpen();
                            } else {
                                // Single tap
                                if (mediaRef.current) {
                                    if (mediaRef.current.paused) mediaRef.current.play();
                                    else mediaRef.current.pause();
                                }
                            }
                            lastTap.current = now;
                        }} 
                        style={{ cursor: 'pointer', position: 'relative' }}
                    >
                        <video ref={mediaRef as any} src={api.getMediaUrl(post.mediaUrl)} preload="metadata" playsInline style={{ width: '100%', borderRadius: '0', marginBottom: 12, outline: 'none', background: 'black', maxHeight: '600px', objectFit: 'cover' }} className="md:rounded-sm" />
                        
                        {/* Double tap hint for discovery */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Toque 2x para Reels</p>
                            </div>
                        </div>
                    </div>
                )}

                {post.mediaUrl && (post.type === 'LYRIC' || post.type === 'IMAGE') && (
                    <div onClick={onMediaClick} style={{ cursor: onMediaClick ? 'pointer' : 'default' }}>
                        <img src={api.getMediaUrl(post.mediaUrl)} alt="Post media" style={{ width: '100%', borderRadius: '0', marginBottom: 12, objectFit: 'cover', maxHeight: '600px', background: 'var(--color-nav-bg)' }} className="md:rounded-sm" />
                    </div>
                )}

                {post.type === 'TRACK' && (
                    <div style={{ borderRadius: '2px', border: '1px solid var(--color-nav-border)', background: 'var(--color-nav-bg)', padding: 14, marginBottom: 12 }} className="mx-[12px] md:mx-0">
                        <TrackPlayer ref={mediaRef as any} url={post.mediaUrl} title="Faixa" />
                    </div>
                )}

                {post.type === 'MARKETPLACE' && post.listingId && (
                    <div className="px-[18px] md:px-0">
                        <Link href={`/marketplace/listing/${post.listingId}`} style={{ textDecoration: 'none' }}>
                            <div className="beet-card p-4 flex items-center gap-4 transition-all hover:border-[var(--color-accent)] group/market">
                                <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-sm bg-black/20 border border-[var(--color-nav-border)]">
                                    {post.mediaUrl ? (
                                        <img src={api.getMediaUrl(post.mediaUrl)} alt="Marketplace" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-beet-red mb-1">Novo Anúncio no Marketplace</p>
                                    <h4 className="text-base font-bold text-[var(--color-primary-text,white)] truncate group-hover/market:text-beet-red transition-colors">{post.text || 'Anúncio sem título'}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">Ver detalhes ›</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {post.hashtags.length > 0 && (
                    <div className="px-[18px] md:px-0">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                            {post.hashtags.map(h => (
                                <span key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: `${tc.color}90` }}>
                                    #{h.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ 
                padding: '12px 18px', 
                borderTop: '1px solid var(--color-nav-border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Like */}
                    <motion.button whileTap={{ scale: 0.8 }}
                        onClick={() => { setLiked(!liked); togglePostLike(post.id); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, color: liked ? '#FF0055' : 'var(--color-muted)', minHeight: 40, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <Heart size={20} strokeWidth={2} fill={liked ? '#FF0055' : 'none'}
                            style={{ filter: liked ? 'drop-shadow(0 0 8px rgba(255,0,85,0.6))' : 'none', transition: 'filter .2s' }} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700 }}>
                            {post.likes.toLocaleString('pt-BR')}
                        </span>
                    </motion.button>

                    {/* Comment */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, color: showComments ? 'var(--color-primary-text)' : 'var(--color-muted)', minHeight: 40, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <MessageCircle size={20} strokeWidth={2} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700 }}>{post.comments}</span>
                    </button>
                </div>

                {/* Plays + Share */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                        {post.plays.toLocaleString('pt-BR')} PLAYS
                    </span>
                    <motion.button whileTap={{ scale: 0.85 }}
                        style={{
                            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '2px', border: '1px solid var(--color-nav-border)', background: 'var(--color-glass-btn)',
                            color: 'var(--color-muted)', cursor: 'pointer'
                        }}
                        onClick={() => alert("Compartilhado!")}
                    >
                        <Share2 size={16} strokeWidth={2} />
                    </motion.button>
                </div>
            </div>

            {/* ── INLINE COMMENTS ── */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'visible', borderTop: '1px solid var(--color-nav-border)' }}
                    >
                        <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                                <Avatar name="Você" imageUrl={artistProfile?.avatarUrl} size="sm" />
                                <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <CustomEmojiPicker onSelect={(emoji) => setCommentText(prev => prev + emoji)} />
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && commentText.trim()) {
                                                addPostComment(post.id, commentText);
                                                setCommentText('');
                                            }
                                        }}
                                        placeholder="Adicione um comentário..."
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-nav-border)', borderRadius: 20, padding: '8px 16px', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: 13, outline: 'none' }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (commentText.trim()) {
                                                addPostComment(post.id, commentText);
                                                setCommentText('');
                                            }
                                        }}
                                        style={{ background: 'var(--color-accent)', color: '#000', border: 'none', borderRadius: 20, padding: '0 16px', fontWeight: 700, fontFamily: 'Space Mono, monospace', fontSize: 11, cursor: 'pointer' }}
                                    >
                                        ENVIAR
                                    </button>
                                </div>
                            </div>

                            {/* Render Comments */}
                            {comments.length === 0 ? (
                                <EmptyState icon="💬" title="Nenhum comentário" description="Seja o primeiro a comentar!" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                                    {comments.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                            <Avatar name={c.authorName} imageUrl={c.authorName === 'Você' ? artistProfile?.avatarUrl : undefined} size="sm" />
                                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', borderTopLeftRadius: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'white' }}>{c.authorName}</span>
                                                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--color-muted)' }}>agora</span>
                                                </div>
                                                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--color-primary-text)', lineHeight: 1.4 }}>
                                                    <RenderTextWithEmojis text={c.text} />
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* ══════════════════════════════════════════════════════════
   SCORE GAUGE  (sidebar)
══════════════════════════════════════════════════════════ */
function ScoreGauge({ score }: { score: number }) {
    return (
        <div style={{
            background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)',
            borderTop: '2px solid var(--color-accent)', borderRadius: '2px', padding: 20,
        }}>
            <p className="section-label" style={{ marginBottom: 14 }}>SCORE BEET</p>
            <div style={{ position: 'relative', width: 112, height: 112, margin: '0 auto 16px' }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-nav-border)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-accent)" strokeWidth="6"
                        strokeDasharray={`${score * 2.51} 251`} strokeLinecap="square"
                        style={{ filter: 'drop-shadow(0 0 6px var(--color-accent-glow))', transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1, letterSpacing: '-0.03em' }}>{Math.round(score)}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--color-muted)', letterSpacing: '0.1em' }}>/ 100</span>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {[['ENGAJ.', '8.7%', false], ['CRESCIM.', '+4.2%', true]].map(([k, v, acc]) => (
                    <div key={String(k)} style={{ padding: 10, background: 'var(--color-glass-btn)', border: '1px solid var(--color-nav-border)', borderRadius: '2px' }}>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', letterSpacing: '0.12em', color: 'var(--color-muted)', marginBottom: 4 }}>{k}</p>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: acc ? 'var(--color-accent)' : 'var(--color-primary-text)' }}>{v}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   FLOATING PUBLISH FAB  — appears on scroll-up on mobile
══════════════════════════════════════════════════════════ */
function PublishFAB() {
    const [visible, setVisible] = useState(true);
    const lastY = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            // show when scrolling UP or near top
            setVisible(y < 80 || y < lastY.current);
            lastY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.85 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 60 }}
                    className="lg:bottom-10 lg:right-10"
                >
                    <Link href="/artist/post/new"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'var(--color-accent)', color: '#000',
                            fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                            borderRadius: '50px',
                            padding: '14px 22px',
                            boxShadow: '0 0 28px rgba(0,255,136,0.55), 0 4px 20px rgba(0,0,0,0.5)',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Zap size={16} strokeWidth={2.5} fill="#000" />
                        PUBLICAR
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function FeedPage() {
    useAuthGuard('ARTIST');
    const { artistProfile, stories, fetchFeed, fetchStories, getFeedPosts } = useStore();
    const feedPosts = getFeedPosts();
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [selectedPostMedia, setSelectedPostMedia] = useState<Post | null>(null);
    const [selectedReelsPost, setSelectedReelsPost] = useState<Post | null>(null);

    useEffect(() => {
        fetchFeed();
        fetchStories();
        const t = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    /* Story index for navigation */
    const storyIndex = selectedStory ? stories.findIndex(s => s.id === selectedStory.id) : -1;
    const goNextStory = () => {
        if (storyIndex < stories.length - 1) setSelectedStory(stories[storyIndex + 1]);
        else setSelectedStory(null);
    };
    const goPrevStory = () => {
        if (storyIndex > 0) setSelectedStory(stories[storyIndex - 1]);
    };

    return (
        <>
            {/* Smart floating FAB */}
            {/* <PublishFAB /> */} {/* Moved to the end of the return statement */}

            <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', paddingBottom: 96 }}>

                {/* ─── MAIN COLUMN ─── */}
                <div style={{ width: '100%', maxWidth: 640, padding: '0 0 8px' }}>



                    {/* ── STORIES BAR ── */}
                    <div style={{
                        display: 'flex', gap: 18, overflowX: 'auto', padding: '16px',
                        borderBottom: '1px solid var(--color-nav-border)',
                        scrollbarWidth: 'none',
                    }}
                        className="scrollbar-none"
                    >
                        <StoryBubble isAdd />
                        {stories.map(s => <StoryBubble key={s.id} story={s} onSelect={setSelectedStory} />)}
                    </div>

                    {/* ── INLINE COMPOSER ── */}
                    <InlineComposer />

                    {/* ── FEED ── */}
                    <div style={{ padding: '12px 12px 0' }}>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-52" />)}
                            </div>
                        ) : feedPosts.length === 0 ? (
                            <EmptyState icon="🎵" title="Nenhuma publicação ainda" description="Siga artistas para ver o feed"
                                action={<Link href="/rankings" className="btn-outline">EXPLORAR ARTISTAS</Link>} />
                        ) : (
                            feedPosts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    isStoryOpen={!!selectedStory || !!selectedPostMedia || !!selectedReelsPost} 
                                    onMediaClick={() => setSelectedPostMedia(post)} 
                                    onReelsOpen={() => setSelectedReelsPost(post)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ─── RIGHT SIDEBAR (xl only) ─── */}
                <aside className="hidden xl:block" style={{ width: 300, marginLeft: 40, paddingTop: 24, position: 'sticky', top: 0, height: 'fit-content' }}>
                    {artistProfile && (
                        <div style={{ marginBottom: 20 }}>
                            {/* Profile card */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '14px 16px', marginBottom: 8,
                                background: 'var(--color-card)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderLeft: '2px solid var(--color-accent)',
                                borderRadius: '2px',
                            }}>
                                <Avatar name={artistProfile.stageName} imageUrl={artistProfile.avatarUrl} size="md" />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-text, white)', lineHeight: 1, letterSpacing: '-0.01em' }}>{artistProfile.stageName}</p>
                                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--color-muted)', letterSpacing: '0.08em', marginTop: 4 }}>@{artistProfile.stageName.toLowerCase().replace(' ', '')}</p>
                                </div>
                                <button style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase' }}>MUDAR</button>
                            </div>
                            <ScoreGauge score={artistProfile.scoreBeet} />
                        </div>
                    )}

                    {/* Suggestions */}
                    <div style={{ borderTop: '1px solid var(--color-nav-border)', paddingTop: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <p className="section-label">SUGESTÕES</p>
                            <Link href="/rankings" style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent)', textDecoration: 'none' }}>VER TODOS</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[
                                { name: 'MC Vibrante', score: 94, id: 'artist-1', image: 'https://images.unsplash.com/photo-1520859050453-58ee97df39ee?w=100&h=100&fit=crop' },
                                { name: 'Ana Lima', score: 87, id: 'artist-2', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
                                { name: 'Dj Coruja', score: 79, id: 'artist-3', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
                            ].map((a, i) => (
                                <Link href={`/artist/profile/${a.id}`} key={a.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 12px', textDecoration: 'none',
                                        background: 'var(--color-card)',
                                        border: '1px solid var(--color-nav-border)',
                                        borderLeft: '2px solid transparent',
                                        borderRadius: '2px',
                                        transition: 'border-left-color .15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderLeftColor = 'var(--color-accent)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderLeftColor = 'transparent')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar name={a.name} imageUrl={a.image} size="sm" />
                                            <span style={{ position: 'absolute', top: -4, left: -8, fontFamily: 'Space Mono, monospace', fontSize: '7px', fontWeight: 700, background: 'var(--color-accent)', color: '#000', padding: '1px 4px', borderRadius: '2px' }}>#{i + 1}</span>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-text, white)', lineHeight: 1, marginBottom: 3 }}>{a.name}</p>
                                            <ScoreBeetBadge score={a.score} size="sm" />
                                        </div>
                                    </div>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent)' }}>
                                        <UserPlus size={11} strokeWidth={2} /> SEGUIR
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <p style={{ marginTop: 32, fontFamily: 'Space Mono, monospace', fontSize: '8px', letterSpacing: '0.1em', color: 'var(--color-muted)', lineHeight: 2, textTransform: 'uppercase' }}>
                        © 2024 BeatBR<br />O ecossistema do novo mercado musical.
                    </p>
                </aside>
            </div>

            <PublishFAB />

            {/* ── Story Viewer Modal ── */}
            <AnimatePresence>
                {selectedStory && selectedStory.mediaUrl && (
                    <StoryViewerModal
                        story={selectedStory}
                        stories={stories}
                        storyIndex={storyIndex}
                        onClose={() => setSelectedStory(null)}
                        onNext={goNextStory}
                        onPrev={goPrevStory}
                    />
                )}
            </AnimatePresence>

            {/* ── Post Media Theater Modal ── */}
            <AnimatePresence>
                {selectedPostMedia && (
                    <PostMediaViewerModal
                        post={selectedPostMedia}
                        onClose={() => setSelectedPostMedia(null)}
                    />
                )}
            </AnimatePresence>

            {/* ── BeeatBR Reels Mode ── */}
            <AnimatePresence>
                {selectedReelsPost && (
                    <ReelsViewerModal
                        initialPost={selectedReelsPost}
                        posts={feedPosts.filter(p => p.type === 'VIDEO')}
                        onClose={() => setSelectedReelsPost(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

/* ══════════════════════════════════════════════════════════
   POST MEDIA VIEWER MODAL — Immersive view for feed posts
══════════════════════════════════════════════════════════ */
function PostMediaViewerModal({ post, onClose }: { post: Post; onClose: () => void }) {
    const [liked, setLiked] = useState(false);
    const [muted, setMuted] = useState(false);
    
    // Swipe to close
    const onDragEnd = (event: any, info: any) => {
        if (Math.abs(info.offset.y) > 150 || Math.abs(info.velocity.y) > 500) {
            onClose();
        }
    };

    const tc = TC[post.type] || { label: 'POST', color: '#FFF' };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
            onClick={onClose}
        >
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={onDragEnd}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 100 }}
                className="relative w-full h-full flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header info */}
                <div className="absolute top-0 left-0 right-0 p-6 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                        <Avatar name={post.artist?.stageName || 'Artist'} imageUrl={post.artist?.avatarUrl} size="sm" />
                        <div>
                            <p className="font-bold text-white text-sm Syne">{post.artist?.stageName}</p>
                            <p className="text-[10px] text-white/50 SpaceMono">@{post.artist?.stageName?.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Media Container */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {post.type === 'VIDEO' ? (
                        <video 
                            src={api.getMediaUrl(post.mediaUrl!)} 
                            controls 
                            autoPlay 
                            muted={muted}
                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                        />
                    ) : post.type === 'TRACK' ? (
                        <div className="w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                             <TrackPlayer url={post.mediaUrl} title={post.text || 'Faixa'} />
                        </div>
                    ) : (
                        <img 
                            src={api.getMediaUrl(post.mediaUrl!)} 
                            alt="Media"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                    )}
                </div>

                {/* Footer / Interaction */}
                <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
                    {post.text && (
                        <p className="text-white text-lg mb-6 max-w-2xl mx-auto text-center font-medium leading-relaxed">
                            {post.text}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-10">
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setLiked(!liked)}
                            className={`flex flex-col items-center gap-2 ${liked ? 'text-beet-red' : 'text-white/70'}`}
                        >
                            <Heart size={32} fill={liked ? 'currentColor' : 'none'} className={liked ? 'drop-shadow-[0_0_10px_rgba(255,0,85,0.5)]' : ''} />
                            <span className="text-[10px] font-bold SpaceMono">{post.likes + (liked ? 1 : 0)}</span>
                        </motion.button>

                        <button className="flex flex-col items-center gap-2 text-white/70">
                            <MessageCircle size={32} />
                            <span className="text-[10px] font-bold SpaceMono">{post.comments}</span>
                        </button>

                        <button className="flex flex-col items-center gap-2 text-white/70">
                            <Share2 size={32} />
                            <span className="text-[10px] font-bold SpaceMono">SHARE</span>
                        </button>

                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            className="flex flex-col items-center gap-2 text-beet-green"
                        >
                            <Zap size={32} fill="currentColor" />
                            <span className="text-[10px] font-bold SpaceMono">BOOST</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════
   STORY VIEWER MODAL — 9:16 layout with timer, chat integration
══════════════════════════════════════════════════════════ */
function StoryViewerModal({ story, stories, storyIndex, onClose, onNext, onPrev }: {
    story: Story; stories: Story[]; storyIndex: number;
    onClose: () => void; onNext: () => void; onPrev: () => void;
}) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [liked, setLiked] = useState(false);
    const [paused, setPaused] = useState(false);
    const [muted, setMuted] = useState(true);
    const [duration, setDuration] = useState(story.mediaType === 'VIDEO' ? 45000 : 25000);
    const videoRef = useRef<HTMLVideoElement>(null);
    const dragY = useRef(0);

    useEffect(() => {
        setProgress(0);
        setLiked(false);
        setPaused(false);
        setDuration(story.mediaType === 'VIDEO' ? 45000 : 25000);
    }, [story.id, story.mediaType]);

    useEffect(() => {
        if (paused) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                const step = 100 / (duration / 50);
                const next = prev + step;
                if (next >= 100) { onNext(); return 0; }
                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [paused, story.id, onNext, duration]);

    const handleVideoMetadata = () => {
        if (videoRef.current) {
            const vidDurationMs = Math.floor(videoRef.current.duration * 1000);
            if (vidDurationMs > 0 && vidDurationMs < 45000) {
                setDuration(vidDurationMs);
            }
        }
    };

    const handleTap = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 3) onPrev();
        else if (x > (rect.width * 2) / 3) onNext();
        else setPaused(p => !p);
    };

    // Swipe detection for X axis (since framer-motion drag might interfere with tap zones on some browsers)
    const onDragEnd = (event: any, info: any) => {
        const { offset, velocity } = info;
        
        // Vertical Swipe (Up or Down) to close
        if (Math.abs(offset.y) > 150 || Math.abs(velocity.y) > 500) {
            onClose();
            return;
        }

        // Horizontal Swipe (Next/Prev)
        if (offset.x < -100 || velocity.x < -500) {
            onNext();
        } else if (offset.x > 100 || velocity.x > 500) {
            onPrev();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden"
            onClick={onClose}
        >
            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.4}
                onDragEnd={onDragEnd}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0, y: dragY.current > 0 ? 500 : -500 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 480,
                    height: '100%',
                    background: '#000',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                    touchAction: 'none'
                }} 
                onClick={e => e.stopPropagation()}
                className="md:h-[90vh] md:rounded-2xl md:aspect-[9/16] md:max-h-[850px]"
            >
                {/* Progress bars */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', gap: 3, padding: '12px 12px 0', zIndex: 100 }}>
                    {stories.map((s, i) => (
                        <div key={s.id} style={{ flex: 1, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: 2,
                                background: 'white',
                                width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                                transition: i === storyIndex ? 'none' : 'width 0.3s',
                            }} />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ position: 'absolute', top: 22, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
                    <Link href={`/artist/profile/${story.artistId}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{ border: '1.5px solid var(--color-accent)', borderRadius: '50%', padding: '1.5px' }}>
                            <Avatar name={story.artist?.stageName || 'Artist'} imageUrl={story.artist?.avatarUrl} size="sm" />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                {story.artist?.stageName || 'Artist'}
                            </p>
                            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                {new Date(story.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {story.mediaType === 'VIDEO' && (
                            <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} style={{
                                color: 'white', padding: 8,
                                background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        )}
                        <button onClick={onClose} style={{
                            color: 'white', padding: 8,
                            background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Media — tap zones */}
                <div 
                    onClick={handleTap} 
                    style={{ 
                        flex: 1, 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        position: 'relative',
                        background: '#000'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {story.mediaType === 'VIDEO' ? (
                                <video
                                    ref={videoRef}
                                    src={story.mediaUrl}
                                    autoPlay
                                    muted={muted}
                                    playsInline
                                    onLoadedMetadata={handleVideoMetadata}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onClick={e => e.stopPropagation()}
                                />
                            ) : story.mediaType === 'AUDIO' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    <div style={{ width: '100%', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <TrackPlayer url={story.mediaUrl} title="Audio Story" />
                                    </div>
                                </div>
                            ) : (
                                <img src={story.mediaUrl} alt="Story"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Left/Right Tap Hints (briefly visible on tap or drag) */}
                    <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none" />
                </div>

                {/* Bottom interaction bar */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    padding: '60px 20px 30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Reply Input */}
                    <div style={{ flex: 1, marginRight: 15 }}>
                        <input 
                            onClick={e => { e.stopPropagation(); setPaused(true); }}
                            onBlur={() => setPaused(false)}
                            placeholder="Enviar mensagem..."
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '25px',
                                padding: '10px 18px', color: 'white',
                                fontFamily: 'Inter, sans-serif', fontSize: '13px',
                                outline: 'none', backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        {/* Like */}
                        <motion.button whileTap={{ scale: 0.7 }}
                            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: liked ? '#FF0055' : 'white',
                            }}>
                            <Heart size={26} fill={liked ? '#FF0055' : 'none'} strokeWidth={2.5}
                                style={{ filter: liked ? 'drop-shadow(0 0 10px rgba(255,0,85,0.6))' : 'none' }} />
                        </motion.button>

                        {/* Share */}
                        <motion.button whileTap={{ scale: 0.7 }}
                            onClick={(e) => { e.stopPropagation(); alert('Link do story copiado!'); }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'white',
                            }}
                        >
                            <Share2 size={24} strokeWidth={2.5} />
                        </motion.button>

                        {/* Zap/Fire */}
                        <motion.button whileTap={{ scale: 0.7 }}
                            onClick={(e) => { e.stopPropagation(); alert('🔥 Boost enviado!'); }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-accent)',
                            }}>
                            <Zap size={24} fill="var(--color-accent)" strokeWidth={0} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════
   REELS VIEWER MODAL — Immersive vertical video discovery
 ══════════════════════════════════════════════════════════ */
function ReelsViewerModal({ initialPost, posts, onClose }: { initialPost: Post; posts: Post[]; onClose: () => void }) {
    const { togglePostLike, artistProfile, currentUser } = useStore();
    const [currentIndex, setCurrentIndex] = useState(posts.findIndex(p => p.id === initialPost.id));
    const [liked, setLiked] = useState(false);
    const [following, setFollowing] = useState(false);
    const post = posts[currentIndex] || initialPost;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Sync liked state with post
    useEffect(() => {
        if (post) {
            setLiked(post.liked || false);
        }
    }, [post]);

    const handleNext = () => {
        if (currentIndex < posts.length - 1) setCurrentIndex((prev: number) => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((prev: number) => prev - 1);
    };

    const onDragEnd = (event: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
        const { offset, velocity } = info;
        // Vertical swipe for navigation
        if (offset.y < -100 || velocity.y < -500) handleNext();
        else if (offset.y > 100 || velocity.y > 500) handlePrev();
        // Horizontal swipe to close (optional but user mentioned swipe right)
        else if (offset.x > 150 || velocity.x > 500) onClose();
    };

    if (!post) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100001] bg-black overflow-hidden flex items-center justify-center"
        >
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                className="relative w-full h-full max-w-[500px] bg-black shadow-2xl overflow-hidden"
            >
                {/* Background Blur for horizontal videos */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={api.getMediaUrl(post.mediaUrl)} 
                        className="w-full h-full object-cover blur-[80px] opacity-40 scale-110" 
                        alt="bg-blur"
                    />
                </div>

                {/* Main Video Content */}
                <div className="absolute inset-0 z-10 flex items-center justify-center" onClick={() => {
                    if (videoRef.current) {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                    }
                }}>
                    <video
                        key={post.id}
                        ref={videoRef}
                        src={api.getMediaUrl(post.mediaUrl)}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-contain md:object-cover"
                    />
                </div>

                {/* Overlay Interface */}
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-4 pb-12 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                    {/* Header Controls (Right side for mobile ergonomics) */}
                    <div className="absolute top-6 right-4 flex flex-col gap-4 pointer-events-auto">
                        <button onClick={onClose} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white">
                            <X size={24} />
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white">
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        {/* Left Side: Info */}
                        <div className="flex-1 pr-12 pointer-events-auto">
                            {/* Context Badges */}
                            <div className="flex gap-2 mb-4">
                                {post.type === 'VIDEO' && <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest bg-beet-purple text-white uppercase">REELS</span>}
                                {post.type === 'MARKETPLACE' && <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest bg-beet-red text-white uppercase">MARKETPLACE</span>}
                                {post.type === 'TRACK' && <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest bg-beet-green text-black uppercase">MÚSICA</span>}
                                {post.status === 'BOOSTED_48H' && <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest bg-neon text-black uppercase">FLY</span>}
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <Link href={`/artist/profile/${post.artistId}`} className="relative ring-2 ring-beet-green ring-offset-2 ring-offset-black rounded-full p-0.5">
                                    <Avatar name={post.artist?.stageName || 'Artist'} imageUrl={post.artist?.avatarUrl} size="md" />
                                </Link>
                                <div>
                                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">{post.artist?.stageName || 'Artist'}</h3>
                                    <p className="text-[10px] text-white/70 font-mono italic">Brasil • Pop/Trap</p>
                                </div>
                                <button 
                                    onClick={() => setFollowing(!following)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${following ? 'bg-white/10 text-white/50' : 'bg-beet-green text-black'}`}
                                >
                                    {following ? 'Seguindo' : 'Seguir'}
                                </button>
                            </div>

                            <p className="text-xs text-white/90 line-clamp-2 mb-4 font-body leading-relaxed max-w-xs">{post.text}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.hashtags?.map(h => (
                                    <span key={h} className="text-[10px] font-bold text-beet-green/80">#{h.toUpperCase()}</span>
                                ))}
                            </div>

                            {/* Contextual Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <Link href={`/artist/profile/${post.artistId}`} className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/20 transition-all">
                                    <UserPlus size={14} /> Ver Perfil
                                </Link>
                                
                                {post.type === 'MARKETPLACE' && (
                                    <Link href={`/marketplace/listing/${post.listingId}`} className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg bg-beet-red text-[10px] font-bold text-white uppercase tracking-widest shadow-lg shadow-beet-red/20">
                                        <ShoppingBag size={14} /> Ver Anúncio
                                    </Link>
                                )}
                                
                                {currentUser?.role === 'INDUSTRY' && (
                                    <button className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg bg-beet-blue text-[10px] font-bold text-white uppercase tracking-widest shadow-lg shadow-beet-blue/20">
                                        <PenLine size={14} /> Enviar Proposta
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Quick Actions */}
                        <div className="flex flex-col items-center gap-6 pointer-events-auto">
                            <motion.button 
                                whileTap={{ scale: 0.8 }}
                                onClick={() => { setLiked(!liked); togglePostLike(post.id); }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all ${liked ? 'bg-beet-red border-beet-red shadow-[0_0_20px_rgba(255,0,85,0.4)]' : 'bg-black/40 text-white/80'}`}>
                                    <Heart size={24} fill={liked ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white/90">{post.likes + (liked && !post.liked ? 1 : 0)}</span>
                            </motion.button>

                            <button className="flex flex-col items-center gap-1">
                                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
                                    <MessageCircle size={24} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white/90">{post.comments}</span>
                            </button>

                            <button className="flex flex-col items-center gap-1" onClick={() => alert("Link copiado!")}>
                                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
                                    <Share2 size={24} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white/90 italic">SHARE</span>
                            </button>

                            <button className="flex flex-col items-center gap-1">
                                <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
                                    <Bookmark size={24} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white/90 italic">SAVE</span>
                            </button>

                            <div className="flex flex-col items-center gap-1 mt-2">
                                <ScoreBeetBadge score={post.artist?.scoreBeet || 0} size="md" />
                                <span className="text-[8px] font-black text-neon/60 tracking-widest uppercase">SCORE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Indicator */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30 opacity-20 hover:opacity-100 transition-opacity">
                    {posts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((p, i) => (
                        <div key={p.id} className={`w-1 h-8 rounded-full transition-all ${p.id === post.id ? 'bg-beet-green h-12' : 'bg-white/20'}`} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

