'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Post, type Story } from '@/lib/store';
import { Avatar, ScoreBeetBadge, Skeleton, EmptyState, TrackPlayer } from '@/components/ui';
import { Heart, MessageCircle, Share2, Zap, MoreHorizontal, Plus, UserPlus, PenLine } from 'lucide-react';

/* ── Type colours ──────────────────────────────────────── */
const TC: Record<string, { label: string; color: string }> = {
    TRACK: { label: 'TRACK', color: '#00FF88' },
    VIDEO: { label: 'VIDEO', color: '#7000FF' },
    LYRIC: { label: 'LYRIC', color: '#00E5FF' },
};

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
                    <Avatar name={story.artist?.stageName || 'Artist'} size="lg" />
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
   POST CARD — bigger fonts, left accent border
══════════════════════════════════════════════════════════ */
function PostCard({ post }: { post: Post }) {
    const { togglePostLike } = useStore();
    const [liked, setLiked] = useState(post.liked);
    const tc = TC[post.type] || TC.TRACK;

    const timeAgo = () => {
        const diff = Date.now() - new Date(post.createdAt).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return 'AGORA';
        if (h < 24) return `${h}H`;
        return `${Math.floor(h / 24)}D`;
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                marginBottom: 16,
                background: 'var(--color-card)',
                border: '1px solid var(--color-nav-border)',
                borderLeft: `3px solid ${tc.color}`,
                borderRadius: '2px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
        >
            {/* top gradient line */}
            <div style={{ height: 1, background: `linear-gradient(90deg, ${tc.color}70, transparent)` }} />

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid var(--color-nav-border)' }}>
                <Link href={`/artist/profile/${post.artistId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <Avatar name={post.artist?.stageName || 'Artist'} size="md" />
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
                    <button style={{ color: 'var(--color-muted)', padding: '4px', lineHeight: 1 }}>
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
                    }}>
                        {post.text.split(' ').map((w, i) =>
                            w.startsWith('#')
                                ? <span key={i} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{w} </span>
                                : <span key={i}>{w} </span>
                        )}
                    </p>
                )}

                {post.mediaUrl && post.type === 'VIDEO' && (
                    <video controls src={post.mediaUrl} style={{ width: '100%', borderRadius: '4px', marginBottom: 12, outline: 'none', background: 'black', maxHeight: '500px' }} />
                )}

                {post.mediaUrl && (post.type === 'LYRIC' || post.type === 'IMAGE') && (
                    <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', borderRadius: '4px', marginBottom: 12, objectFit: 'contain', maxHeight: '500px', background: 'var(--color-nav-bg)' }} />
                )}

                {post.type === 'TRACK' && (
                    <div style={{ borderRadius: '2px', border: '1px solid var(--color-nav-border)', background: 'var(--color-nav-bg)', padding: 14, marginBottom: 12 }}>
                        <TrackPlayer url={post.mediaUrl} title="Faixa" />
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
                    style={{ display: 'flex', alignItems: 'center', gap: 7, color: liked ? '#FF0055' : 'var(--color-muted)', minHeight: 40 }}
                >
                    <Heart size={20} strokeWidth={2} fill={liked ? '#FF0055' : 'none'}
                        style={{ filter: liked ? 'drop-shadow(0 0 8px rgba(255,0,85,0.6))' : 'none', transition: 'filter .2s' }} />
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700 }}>
                        {post.likes.toLocaleString('pt-BR')}
                    </span>
                </motion.button>

                {/* Comment */}
                <button
                    style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--color-muted)', minHeight: 40 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
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
                            color: 'var(--color-muted)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-nav-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
                    >
                        <Share2 size={15} strokeWidth={2} />
                    </motion.button>
                </div>
            </div>
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
        const t = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <AppShell>
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
                            posts.map(post => <PostCard key={post.id} post={post} />)
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
                                <Avatar name={artistProfile.stageName} size="md" />
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

            {/* ── Story Viewer Modal ── */}
            <AnimatePresence>
                {selectedStory && selectedStory.mediaUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setSelectedStory(null)}
                    >
                        <button style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: 24, padding: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} onClick={() => setSelectedStory(null)}>✕</button>
                        {selectedStory.mediaType === 'VIDEO' ? (
                            <video src={selectedStory.mediaUrl} controls autoPlay style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
                        ) : (
                            <img src={selectedStory.mediaUrl} alt="Story" style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: 8, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </AppShell>
    );
}
