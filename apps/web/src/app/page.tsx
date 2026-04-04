'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Avatar, ScoreBeetBadge } from '@/components/ui';
import { Play, TrendingUp, Zap, Users, Handshake, Search, ArrowRight, Music2 } from 'lucide-react';

// ── Waveform floating card ───────────────────────────────────
function FloatingCard() {
    const bars = [40, 70, 55, 90, 65, 80, 50, 75, 60, 85, 45, 72, 38, 68, 52];
    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                width: 300,
                background: 'rgba(10,10,30,0.92)',
                border: '1px solid rgba(0,255,136,0.2)',
                borderLeft: '3px solid var(--color-accent)',
                borderRadius: '2px',
                boxShadow: '4px 4px 0 rgba(0,255,136,0.25), 0 0 60px rgba(0,255,136,0.08)',
                padding: '20px',
            }}
        >
            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, var(--color-accent), transparent)' }} />

            <div className="flex items-center gap-3 mb-4">
                <Avatar name="Artista Exemplo" size="md" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Seu Nome Aqui</p>
                    <div className="flex gap-1 mt-1">
                        {['#GENERO', '#ESTILO'].map(g => (
                            <span key={g} style={{
                                fontFamily: 'Space Mono, monospace',
                                fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em',
                                padding: '2px 6px', borderRadius: '2px',
                                border: '1px solid rgba(0,255,136,0.25)',
                                color: 'rgba(0,255,136,0.7)',
                                background: 'rgba(0,255,136,0.06)',
                            }}>{g}</span>
                        ))}
                    </div>
                </div>
                <ScoreBeetBadge score={99} />
            </div>

            {/* Waveform */}
            <div className="flex h-10 items-end gap-0.5 mb-3">
                {bars.map((h, i) => (
                    <div key={i} className="waveform-bar flex-1 rounded-sm"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.08}s`, borderRadius: '1px' }}
                    />
                ))}
                <button className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center text-black font-black"
                    style={{ background: 'var(--color-accent)', borderRadius: '2px', flexShrink: 0 }}>
                    <Play size={12} fill="black" />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--color-muted)', letterSpacing: '0.06em' }}>
                    -- PLAYS
                </span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--color-accent)', letterSpacing: '0.06em' }}>
                    +0.0% ↑
                </span>
            </div>
        </motion.div>
    );
}

// ── Stat counter ─────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="text-stat-sm font-black text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
                {value}
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                {label}
            </p>
        </div>
    );
}

const FEATURES = [
    {
        icon: <Zap size={20} strokeWidth={1.75} />,
        code: '01',
        title: 'Score Beet AI',
        color: '#00FF88',
        desc: 'Algoritmo que calcula o potencial de cada artista com base em dados reais de engajamento e mercado.',
    },
    {
        icon: <Handshake size={20} strokeWidth={1.75} />,
        code: '02',
        title: 'Deal Room',
        color: '#00E5FF',
        desc: 'Negocie, envie contratos e feche negócios em tempo real — tudo dentro da plataforma.',
    },
    {
        icon: <Search size={20} strokeWidth={1.75} />,
        code: '03',
        title: 'Descobrir Talentos',
        color: '#7000FF',
        desc: 'Empresas encontram artistas certos por gênero, estado, score e disponibilidade de agenda.',
    },
];

// ── Background scroll-driven sequence ──────────────────────────
function BackgroundSequence() {
    const [frame, setFrame] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const scrollFraction = scrollTop / maxScroll;
            const frameIndex = Math.max(
                1,
                Math.min(40, Math.ceil(scrollFraction * 40))
            );
            setFrame(frameIndex);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Preload frames to prevent flickering
    useEffect(() => {
        const preloadImages = () => {
            for (let i = 1; i <= 40; i++) {
                const img = new Image();
                img.src = `/background/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
            }
        };
        preloadImages();
    }, []);

    return (
        <div
            className="fixed inset-0 pointer-events-none filter contrast-110 brightness-75"
            style={{
                zIndex: 0,
                backgroundImage: `url(/background/ezgif-frame-${frame.toString().padStart(3, '0')}.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.7,
                transition: 'background-image 0.05s linear',
            }}
        >
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)' }} />
        </div>
    );
}

export default function LandingPage() {
    const { isAuthenticated, currentUser } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            const dest = currentUser.role === 'ARTIST' ? '/artist/feed' : '/industry/dashboard';
            router.replace(dest);
        }
    }, [isAuthenticated, currentUser, router]);

    return (
        <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            <BackgroundSequence />

            {/* ── Background Grid ── */}
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
            }} />
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 65%)' }} />
                <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(112,0,255,0.07) 0%, transparent 65%)' }} />
            </div>

            {/* ═══ NAV ═══ */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-16" style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        <span style={{ color: 'var(--color-accent)' }}>BEAT</span>
                        <span className="text-[var(--color-primary-text,white)]">BR</span>
                    </span>
                    <span style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '7px', fontWeight: 700,
                        letterSpacing: '0.2em', padding: '3px 6px', borderRadius: '2px',
                        border: '1px solid rgba(0,255,136,0.3)', color: 'var(--color-accent)',
                        background: 'rgba(0,255,136,0.06)',
                    }}>BETA</span>
                </div>

                <div className="hidden gap-8 lg:flex">
                    {['Como funciona', 'Rankings', 'Para artistas', 'Para empresas'].map(l => (
                        <button key={l} style={{
                            fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 500,
                            color: 'var(--color-muted)', transition: 'color 0.15s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
                        >{l}</button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/auth" style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.1em', color: 'var(--color-muted)',
                        textDecoration: 'none', display: 'none',
                    }}
                        className="lg:block transition-colors hover:text-white"
                    >ENTRAR</Link>
                    <Link href="/auth?tab=register" className="btn-accent" style={{ padding: '10px 20px', fontSize: '11px' }}>
                        COMEÇAR GRÁTIS
                    </Link>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative z-10 px-6 pt-16 pb-20 lg:flex lg:min-h-[calc(100vh-72px)] lg:items-center lg:gap-20 lg:px-16">

                {/* Left */}
                <motion.div className="max-w-3xl" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

                    {/* Eyebrow tag */}
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="mb-6 inline-flex items-center gap-2"
                        style={{
                            fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700,
                            letterSpacing: '0.18em', padding: '6px 14px', borderRadius: '2px',
                            border: '1px solid rgba(0,255,136,0.3)', color: 'var(--color-accent)',
                            background: 'rgba(0,255,136,0.06)',
                        }}>
                        <div className="h-1.5 w-1.5 rounded-full bg-beet-green" style={{ boxShadow: '0 0 6px #00FF88', animation: 'pulse 2s ease infinite' }} />
                        2.000+ ARTISTAS · 500+ EMPRESAS
                    </motion.div>

                    {/* Display headline */}
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: 'clamp(3rem, 7vw, 6rem)',
                        fontWeight: 800,
                        lineHeight: 0.92,
                        letterSpacing: '-0.04em',
                        textTransform: 'uppercase',
                        color: 'white',
                        marginBottom: '1.5rem',
                    }}>
                        A VITRINE<br />
                        <span style={{ color: 'var(--color-accent)', display: 'block', marginTop: '4px' }}>
                            DA NOVA MÚSICA
                        </span>
                        <span style={{ color: 'white', fontSize: '85%' }}>BRASILEIRA</span>
                    </h1>

                    <p style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.55)', maxWidth: 480, marginBottom: '2.5rem',
                    }}>
                        Conecte talentos. Feche negócios.<br />
                        Transforme a indústria musical.
                    </p>

                    {/* CTA row */}
                    <div className="flex flex-wrap gap-4 mb-12">
                        <Link href="/auth?role=ARTIST" className="btn-accent inline-flex items-center gap-2"
                            style={{ padding: '14px 28px', fontSize: '12px' }}>
                            <Music2 size={16} strokeWidth={2} />
                            SOU ARTISTA
                        </Link>
                        <Link href="/auth?role=INDUSTRY"
                            className="btn-outline inline-flex items-center gap-2"
                            style={{
                                padding: '13px 28px', fontSize: '12px',
                                border: '1px solid rgba(0,229,255,0.4)',
                                color: '#00E5FF',
                                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = 'rgba(0,229,255,0.08)';
                                el.style.boxShadow = '3px 3px 0 rgba(0,229,255,0.4)';
                                el.style.transform = 'translate(-2px,-2px)';
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = 'transparent';
                                el.style.boxShadow = 'none';
                                el.style.transform = 'none';
                            }}
                        >
                            <Users size={16} strokeWidth={2} />
                            SOU EMPRESA
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-8">
                        <Stat value="2K+" label="Artistas" />
                        <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <Stat value="500+" label="Empresas" />
                        <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <Stat value="1.2K" label="Contratos" />
                    </div>
                </motion.div>

                {/* Right: floating card */}
                <motion.div className="mt-16 flex justify-center lg:mt-0 lg:flex-1 lg:justify-end"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <FloatingCard />
                </motion.div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="relative z-10 px-6 py-16 lg:px-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Section label */}
                <div className="mb-10">
                    <p className="section-label" style={{ marginBottom: '8px' }}>POR QUE BEATBR</p>
                    <h2 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', color: 'white',
                    }}>
                        FERRAMENTAS PARA<br />
                        <span style={{ color: 'var(--color-accent)' }}>QUEM CRIA E INVESTE</span>
                    </h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -3 }}
                            style={{
                                background: 'rgba(10,10,30,0.8)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderTop: `2px solid ${f.color}`,
                                borderRadius: '2px',
                                padding: '28px 24px',
                                transition: 'box-shadow 0.2s, transform 0.15s',
                                cursor: 'default',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 0 ${f.color}40, 0 8px 40px rgba(0,0,0,0.6)`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                        >
                            {/* Corner glow */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${f.color}12, transparent 70%)`, pointerEvents: 'none' }} />

                            {/* Code number */}
                            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: f.color, opacity: 0.6, marginBottom: '12px' }}>{f.code}</p>

                            {/* Icon */}
                            <div className="mb-4 flex h-11 w-11 items-center justify-center" style={{
                                border: `1px solid ${f.color}35`,
                                borderRadius: '2px',
                                background: `${f.color}10`,
                                color: f.color,
                            }}>
                                {f.icon}
                            </div>

                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.01em', color: 'white', marginBottom: '8px' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>
                                {f.desc}
                            </p>

                            <div className="mt-4 flex items-center gap-1" style={{ color: f.color, fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em' }}>
                                SAIBA MAIS <ArrowRight size={12} strokeWidth={2} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="relative z-10 px-6 py-8 lg:px-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                    <span className="animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                        <span style={{ color: 'var(--color-accent)' }}>BEAT</span>
                        <span className="text-[var(--color-primary-text,white)]">BR</span>
                    </span>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--color-muted)' }}>
                        © 2025 BEATBR · A VITRINE DA NOVA MÚSICA BRASILEIRA
                    </p>
                    <Link href="/auth" className="btn-ghost" style={{ fontSize: '10px', padding: '8px 16px' }}>
                        ACESSAR
                    </Link>
                </div>
            </footer>
        </div>
    );
}
