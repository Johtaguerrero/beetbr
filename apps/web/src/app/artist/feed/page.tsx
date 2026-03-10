'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Post, type Story } from '@/lib/store';
import { Avatar, ScoreBeetBadge, Skeleton, EmptyState, TrackPlayer, CustomEmojiPicker, RenderTextWithEmojis } from '@/components/ui';
import { Heart, MessageCircle, Share2, Zap, MoreHorizontal, Plus, UserPlus, PenLine, Image, Upload, X, Music, Film, Camera, FileText, VolumeX, Volume2 } from 'lucide-react';


/* ── Type colours ──────────────────────────────────────── */
const TC: Record<string, { label: string; color: string }> = {
    TRACK: { label: 'TRACK', color: '#00FF88' },
    VIDEO: { label: 'VIDEO', color: '#7000FF' },
    IMAGE: { label: 'IMAGE', color: '#FF8800' },
    LYRIC: { label: 'LYRIC', color: '#00E5FF' },
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
    const [publishing, setPublishing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

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
        if (fileRef.current) fileRef.current.value = '';
    };

    const handlePublish = async () => {
        if (!text.trim() && !file) { addToast({ message: 'Adicione texto ou arquivo!', type: 'error' }); return; }
        setPublishing(true);
        try {
            await createPost({ type: postType as any, text, hashtags: [], file: file || undefined });
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
            {/* Collapsed: just a clickable bar */}
            {!expanded ? (
                <button onClick={() => setExpanded(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--color-accent-dim)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <PenLine size={16} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px',
                        color: 'var(--color-muted)', flex: 1,
                    }}>O que você quer compartilhar?</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {POST_TYPES.map(t => (
                            <t.icon key={t.key} size={16} style={{ color: t.color, opacity: 0.5 }} />
                        ))}
                    </div>
                </button>
            ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    {/* Type tabs */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {POST_TYPES.map(t => (
                            <button key={t.key} onClick={() => { setPostType(t.key); clearFile(); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: '2px', border: '1px solid',
                                    borderColor: postType === t.key ? t.color : 'var(--color-nav-border)',
                                    background: postType === t.key ? `${t.color}15` : 'transparent',
                                    color: postType === t.key ? t.color : 'var(--color-muted)',
                                    fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700,
                                    letterSpacing: '0.1em', cursor: 'pointer', transition: 'all .15s',
                                }}>
                                <t.icon size={12} /> {t.label.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Text area */}
                    <textarea
                        value={text} onChange={e => setText(e.target.value)}
                        placeholder={postType === 'LYRIC' ? 'Cole sua letra ou composição...' : 'O que está rolando?'}
                        rows={3}
                        style={{
                            width: '100%', resize: 'none', border: '1px solid var(--color-nav-border)',
                            borderRadius: '2px', padding: 12, background: 'var(--color-glass-btn)',
                            color: 'var(--color-primary-text)', fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: '14px', outline: 'none',
                        }}
                    />

                    {/* File preview */}
                    {file && (
                        <div style={{ marginTop: 10, position: 'relative' }}>
                            {filePreview && file.type.startsWith('image') && (
                                <img src={filePreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-nav-border)' }} />
                            )}
                            {filePreview && file.type.startsWith('video') && (
                                <video src={filePreview} controls style={{ width: '100%', maxHeight: 200, borderRadius: '4px' }} />
                            )}
                            {file.type.startsWith('audio') && (
                                <div style={{ padding: 10, background: 'var(--color-glass-btn)', borderRadius: '4px', border: '1px solid var(--color-nav-border)' }}>
                                    <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>🎵 {file.name}</p>
                                    <audio controls src={URL.createObjectURL(file)} style={{ width: '100%', height: 32 }} />
                                </div>
                            )}
                            <button onClick={clearFile} style={{
                                position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                                borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: 12,
                            }}><X size={14} /></button>
                        </div>
                    )}

                    {/* Actions row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input type="file" ref={fileRef} className="hidden" accept={selectedType.accept} onChange={handleFile} />
                            <button onClick={() => fileRef.current?.click()} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: '2px', border: '1px solid var(--color-nav-border)',
                                background: 'var(--color-glass-btn)', color: 'var(--color-muted)',
                                fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700,
                                cursor: 'pointer',
                            }}>
                                <Upload size={12} /> {file ? 'TROCAR' : 'ARQUIVO'}
                            </button>
                            <button onClick={() => { setText(''); clearFile(); setExpanded(false); }} style={{
                                padding: '6px 12px', borderRadius: '2px', border: '1px solid var(--color-nav-border)',
                                background: 'transparent', color: 'var(--color-muted)',
                                fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700,
                                cursor: 'pointer',
                            }}>
                                CANCELAR
                            </button>
                        </div>
                        <button onClick={handlePublish} disabled={publishing} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 20px', borderRadius: '2px', border: 'none',
                            background: 'var(--color-accent)', color: '#000',
                            fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700,
                            letterSpacing: '0.1em', cursor: publishing ? 'not-allowed' : 'pointer',
                            opacity: publishing ? 0.6 : 1,
                        }}>
                            <Zap size={12} fill="#000" /> {publishing ? 'PUBLICANDO...' : 'PUBLICAR'}
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
function PostCard({ post, isStoryOpen }: { post: Post; isStoryOpen?: boolean }) {
    const { togglePostLike } = useStore();
    const [liked, setLiked] = useState(post.liked);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<any[]>([]); // Local state for demo
    const tc = TC[post.type] || TC.TRACK;

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid var(--color-nav-border)' }}>
                <Link href={`/artist/profile/${post.artistId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <Avatar name={post.artist?.stageName || 'Artist'} imageUrl={post.artist?.avatarUrl} size="md" />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* BIG name */}
                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 800, color: 'var(--color-primary-text, white)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                                {post.artist?.stageName || 'Artist'}
                            </span>
                            <ScoreBeetBadge score={post.artist?.scoreBeet || 0} size="sm" />
                        </div>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: 4, display: 'block' }}>
                            {timeAgo()} AGO
                        </span>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* type badge */}
                    <span style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                        padding: '4px 10px', borderRadius: '2px',
                        border: `1px solid ${tc.color}50`, background: `${tc.color}12`, color: tc.color,
                    }}>{tc.label}</span>
                    <button style={{ color: 'var(--color-muted)', padding: '4px', lineHeight: 1, border: 'none', background: 'none' }}>
                        <MoreHorizontal size={18} strokeWidth={1.75} />
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: '18px 18px 14px' }}>
                {post.text && (
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
                )}

                {post.mediaUrl && post.type === 'VIDEO' && (
                    <video ref={mediaRef as any} controls src={post.mediaUrl} preload="metadata" playsInline style={{ width: '100%', borderRadius: '4px', marginBottom: 12, outline: 'none', background: 'black', maxHeight: '500px' }} />
                )}

                {post.mediaUrl && (post.type === 'LYRIC' || post.type === 'IMAGE') && (
                    <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', borderRadius: '4px', marginBottom: 12, objectFit: 'contain', maxHeight: '500px', background: 'var(--color-nav-bg)' }} />
                )}

                {post.type === 'TRACK' && (
                    <div style={{ borderRadius: '2px', border: '1px solid var(--color-nav-border)', background: 'var(--color-nav-bg)', padding: 14, marginBottom: 12 }}>
                        <TrackPlayer ref={mediaRef as any} url={post.mediaUrl} title="Faixa" />
                    </div>
                )}

                {post.hashtags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                        {post.hashtags.map(h => (
                            <span key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: `${tc.color}90` }}>
                                #{h.toUpperCase()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* ── ACTIONS ── */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--color-nav-border)', display: 'flex', alignItems: 'center', gap: 20 }}>
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
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary-text)')}
                    onMouseLeave={e => { if (!showComments) e.currentTarget.style.color = 'var(--color-muted)'; }}
                >
                    <MessageCircle size={20} strokeWidth={2} />
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700 }}>{post.comments}</span>
                </button>

                {/* Plays + Share */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--color-muted)', letterSpacing: '0.06em' }}>
                        {post.plays.toLocaleString('pt-BR')} PLAYS
                    </span>
                    <motion.button whileTap={{ scale: 0.85 }}
                        style={{
                            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '2px', border: '1px solid var(--color-nav-border)', background: 'var(--color-glass-btn)',
                            color: 'var(--color-muted)', cursor: 'pointer'
                        }}
                        onClick={() => alert("Compartilhado!")}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-nav-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
                    >
                        <Share2 size={15} strokeWidth={2} />
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
                                <Avatar name="Você" size="sm" />
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
                                            <Avatar name={c.authorName} size="sm" />
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
    const { artistProfile, posts, stories, fetchFeed, fetchStories } = useStore();
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

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

                    {/* Mobile header */}
                    <div className="md:hidden" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 16px 12px',
                        borderBottom: '1px solid var(--color-nav-border)',
                        position: 'sticky', top: 0, zIndex: 30,
                        background: 'var(--color-nav-bg)',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <span className="animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-primary-text, white)', textTransform: 'uppercase' }}>
                            <span style={{ color: 'var(--color-accent)' }}>BEAT</span>BR
                        </span>
                        {/* small inline button for desktop ref visibility */}
                        <Link href="/artist/post/new" style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                            background: 'rgba(0,255,136,0.12)', color: 'var(--color-accent)',
                            padding: '8px 14px', borderRadius: '2px', border: '1px solid rgba(0,255,136,0.3)',
                            textDecoration: 'none',
                        }}>
                            <PenLine size={12} strokeWidth={2.5} />
                            NOVO
                        </Link>
                    </div>

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
                        ) : posts.length === 0 ? (
                            <EmptyState icon="🎵" title="Nenhuma publicação ainda" description="Siga artistas para ver o feed"
                                action={<Link href="/rankings" className="btn-outline">EXPLORAR ARTISTAS</Link>} />
                        ) : (
                            posts.map(post => <PostCard key={post.id} post={post} isStoryOpen={!!selectedStory} />)
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
                                { name: 'MC Vibrante', score: 94, id: 'artist-1' },
                                { name: 'Ana Lima', score: 87, id: 'artist-2' },
                                { name: 'Dj Coruja', score: 79, id: 'artist-3' },
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
                                            <Avatar name={a.name} size="sm" />
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

            {/* ── Enhanced Story Viewer Modal ── */}
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
        </>
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
    const [duration, setDuration] = useState(story.mediaType === 'VIDEO' ? 45000 : 25000); // 45s for video, 25s for img
    const videoRef = useRef<HTMLVideoElement>(null);

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.95)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div style={{
                position: 'relative',
                width: '100vw',
                maxWidth: 480,
                height: '100vh',
                maxHeight: 'min(100vh, 853px)',
                aspectRatio: '9/16',
                background: '#111',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }} onClick={e => e.stopPropagation()}>
                {/* Progress bars */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', gap: 3, padding: '8px 8px 0', zIndex: 10 }}>
                    {stories.map((s, i) => (
                        <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: 2,
                                background: 'white',
                                width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}% ` : '0%',
                                transition: i === storyIndex ? 'none' : 'width 0.3s',
                            }} />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ position: 'absolute', top: 18, left: 12, right: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={story.artist?.stageName || 'Artist'} size="sm" />
                        <div>
                            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800, color: 'white' }}>
                                {story.artist?.stageName || 'Artist'}
                            </p>
                            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>
                                {new Date(story.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                {paused && ' · PAUSADO'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {story.mediaType === 'VIDEO' && (
                            <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} style={{
                                color: 'white', padding: 8,
                                background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        )}
                        <button onClick={onClose} style={{
                            color: 'white', fontSize: 20, padding: 8,
                            background: 'rgba(255,255,255,0.1)', borderRadius: '50%',
                            border: 'none', cursor: 'pointer', lineHeight: 1, width: 36, height: 36,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>✕</button>
                    </div>
                </div>

                {/* Media — tap zones */}
                <div onClick={handleTap} style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                    {story.mediaType === 'VIDEO' ? (
                        <video
                            ref={videoRef}
                            src={story.mediaUrl}
                            autoPlay
                            muted={muted}
                            playsInline
                            onLoadedMetadata={handleVideoMetadata}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <img src={story.mediaUrl} alt="Story"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    )}
                </div>

                {/* Bottom interaction bar */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '40px 20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Like */}
                    <motion.button whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: liked ? '#FF0055' : 'white',
                        }}>
                        <Heart size={26} fill={liked ? '#FF0055' : 'none'} strokeWidth={2}
                            style={{ filter: liked ? 'drop-shadow(0 0 8px rgba(255,0,85,0.6))' : 'none' }} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700 }}>
                            {liked ? 'CURTIU' : 'CURTIR'}
                        </span>
                    </motion.button>

                    {/* Comment - Redirects to DM */}
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/ marketplace / chat / ${story.artistId} `); onClose(); }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer', color: 'white',
                        }}
                    >
                        <MessageCircle size={26} strokeWidth={2} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700 }}>CHAT</span>
                    </button>

                    {/* Share */}
                    <button
                        onClick={(e) => { e.stopPropagation(); alert('Link do story copiado!'); }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer', color: 'white',
                        }}
                    >
                        <Share2 size={26} strokeWidth={2} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700 }}>ENVIAR</span>
                    </button>

                    {/* Zap/fire */}
                    <motion.button whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); alert('Boost enviado!'); }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-accent)',
                        }}>
                        <Zap size={26} fill="var(--color-accent)" strokeWidth={0} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700 }}>BOOST</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

