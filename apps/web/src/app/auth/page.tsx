'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, DEMO_ARTIST_EMAIL, DEMO_INDUSTRY_EMAIL, DEMO_PASSWORD } from '@/lib/store';
import { setAuthCookies } from '@/components/shell/AppShell';
import { Spinner } from '@/components/ui';
import { Zap, Mic2, Building2, AlertTriangle, ArrowRight, Terminal } from 'lucide-react';

type Tab = 'login' | 'register';
type Role = 'ARTIST' | 'INDUSTRY';

function AuthContent() {
    const [tab, setTab] = useState<Tab>('login');
    const [role, setRole] = useState<Role>('ARTIST');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const params = useSearchParams();
    const router = useRouter();
    const { loginAsArtist, loginAsIndustry, registerArtist, registerIndustry } = useStore();

    useEffect(() => {
        const r = params.get('role') as Role;
        if (r === 'ARTIST' || r === 'INDUSTRY') setRole(r);
        const t = params.get('tab') as Tab;
        if (t === 'register') setTab('register');
    }, [params]);

    const isArtist = role === 'ARTIST';
    const accentColor = isArtist ? '#00FF88' : '#00E5FF';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email) { setError('// EMAIL OBRIGATÓRIO'); return; }
        if (!password) { setError('// SENHA OBRIGATÓRIA'); return; }
        if (tab === 'register' && password !== confirm) { setError('// SENHAS NÃO COINCIDEM'); return; }
        if (tab === 'register' && !name) { setError(`// ${role === 'ARTIST' ? 'NOME ARTÍSTICO' : 'NOME DA EMPRESA'} OBRIGATÓRIO`); return; }

        setLoading(true);
        try {
            if (tab === 'login') {
                if (role === 'ARTIST') await loginAsArtist(email, password);
                else await loginAsIndustry(email, password);
            } else {
                if (role === 'ARTIST') await registerArtist({ email, password, stageName: name });
                else await registerIndustry({ email, password, companyName: name });
            }
            setAuthCookies(role);
            if (tab === 'register') {
                router.push(role === 'ARTIST' ? '/artist/onboarding' : '/industry/onboarding');
            } else {
                router.push(role === 'ARTIST' ? '/artist/feed' : '/industry/dashboard');
            }
        } catch (err: any) {
            setError(`// ${(err.message || 'ERRO INESPERADO').toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    const enterDemo = async (demoRole: Role) => {
        setRole(demoRole);
        setLoading(true);
        setError('');
        try {
            const demoEmail = demoRole === 'ARTIST' ? DEMO_ARTIST_EMAIL : DEMO_INDUSTRY_EMAIL;
            if (demoRole === 'ARTIST') await loginAsArtist(demoEmail, DEMO_PASSWORD);
            else await loginAsIndustry(demoEmail, DEMO_PASSWORD);
            setAuthCookies(demoRole);
            router.push(demoRole === 'ARTIST' ? '/artist/feed' : '/industry/dashboard');
        } catch (err: any) {
            setError(`// ${(err.message || 'ERRO INESPERADO').toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>

            {/* ── Background grid ── */}
            <div className="pointer-events-none fixed inset-0">
                {/* Grid lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />
                {/* Corner glow */}
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full" style={{ background: `radial-gradient(circle, ${accentColor}12 0%, transparent 60%)`, transition: 'all 0.7s ease' }} />
                <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, transparent 60%)' }} />
                {/* Scan lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
                }} />
            </div>

            {/* ── Left panel — brand (desktop only) ── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
                {/* Logo */}
                <div>
                    <div className="text-5xl font-black mb-2 animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}>
                        <span style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}60, 0 0 60px ${accentColor}20` }}>BEAT</span>
                        <span className="text-[var(--color-primary-text,white)]">BR</span>
                    </div>
                    <p className="text-xs font-mono text-beet-muted tracking-widest">A VITRINE DA NOVA MÚSICA BRASILEIRA</p>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                    {[
                        { label: 'ARTISTAS ATIVOS', value: '12.4K', icon: <Mic2 size={14} /> },
                        { label: 'DEALS FECHADOS', value: '3.8K', icon: <Zap size={14} /> },
                        { label: 'PLAYS TOTAIS', value: '48M+', icon: <Terminal size={14} /> },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex h-8 w-8 items-center justify-center" style={{ border: `1px solid ${accentColor}40`, color: accentColor, borderRadius: '2px' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-black leading-none text-[var(--color-primary-text,white)]" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
                                <p className="text-[9px] font-mono tracking-widest text-beet-muted">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom tag */}
                <div className="text-[9px] font-mono tracking-widest text-beet-muted">
                    © 2026 BEATBR — GRUPO BEET
                </div>
            </div>

            {/* ── Right panel — form ── */}
            <div className="flex flex-1 items-center justify-center p-4 lg:p-12">
                <motion.div
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    {/* Mobile logo */}
                    <div className="mb-6 text-center lg:hidden">
                        <div className="text-4xl font-black animate-beat-glitch" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}>
                            <span style={{ color: accentColor }}>BEAT</span>
                            <span className="text-[var(--color-primary-text,white)]">BR</span>
                        </div>
                        <p className="text-[9px] font-mono text-beet-muted tracking-widest mt-1">A VITRINE DA NOVA MÚSICA BR</p>
                    </div>

                    {/* ═══ DEMO ACCESS ═══ */}
                    <div className="mb-5 overflow-hidden" style={{
                        border: '1px solid rgba(255,230,0,0.2)',
                        borderLeft: '2px solid #FFE600',
                        borderRadius: '2px',
                        background: 'rgba(255,230,0,0.04)',
                    }}>
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-yellow-500/10">
                            <Terminal size={11} className="text-yellow-400 flex-shrink-0" />
                            <p className="text-[9px] font-mono font-bold text-yellow-400 tracking-widest uppercase">ACCESS_DEMO.sh — execute para entrar</p>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-white/5">
                            <button
                                onClick={() => enterDemo('ARTIST')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold transition-all disabled:opacity-40 group"
                                style={{ background: 'var(--color-bg)', color: '#00FF88' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,136,0.08)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                            >
                                {loading ? <Spinner size="sm" /> : <Mic2 size={13} />}
                                $ artista
                            </button>
                            <button
                                onClick={() => enterDemo('INDUSTRY')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold transition-all disabled:opacity-40"
                                style={{ background: 'var(--color-bg)', color: '#00E5FF' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.08)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                            >
                                {loading ? <Spinner size="sm" /> : <Building2 size={13} />}
                                $ empresa
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px" style={{ background: 'var(--color-nav-border)' }} />
                        <span className="text-[8px] font-mono tracking-[0.2em] text-beet-muted">OU CONTINUE</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--color-nav-border)' }} />
                    </div>

                    {/* Tab toggle */}
                    <div className="mb-4 grid grid-cols-2 gap-px" style={{ background: 'var(--color-nav-border)', borderRadius: '2px' }}>
                        {(['login', 'register'] as Tab[]).map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className="py-2.5 text-[9px] font-mono font-bold tracking-widest uppercase transition-all"
                                style={{
                                    background: tab === t ? accentColor : 'transparent',
                                    color: tab === t ? '#000' : 'var(--color-muted)',
                                    borderRadius: '2px',
                                }}
                            >
                                {t === 'login' ? '[ ENTRAR ]' : '[ CRIAR CONTA ]'}
                            </button>
                        ))}
                    </div>

                    {/* Role toggle */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                        {(['ARTIST', 'INDUSTRY'] as Role[]).map((r) => (
                            <button key={r} onClick={() => setRole(r)}
                                className="flex items-center justify-center gap-2 py-2.5 text-[10px] font-mono font-bold tracking-widest uppercase transition-all"
                                style={{
                                    borderRadius: '2px',
                                    border: `1px solid ${role === r ? accentColor : 'var(--color-nav-border)'}`,
                                    background: role === r ? `${accentColor}12` : 'transparent',
                                    color: role === r ? accentColor : 'var(--color-muted)',
                                    boxShadow: role === r ? `2px 2px 0 ${accentColor}40` : 'none',
                                }}
                            >
                                {r === 'ARTIST' ? <Mic2 size={12} /> : <Building2 size={12} />}
                                {r === 'ARTIST' ? 'ARTISTA' : 'EMPRESA'}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <AnimatePresence>
                            {tab === 'register' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <input className="beet-input" placeholder={role === 'ARTIST' ? '> nome_artístico' : '> nome_empresa'} value={name} onChange={(e) => setName(e.target.value)} required />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input className="beet-input" type="email" placeholder="> seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input className="beet-input" type="password" placeholder="> ••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <AnimatePresence>
                            {tab === 'register' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <input className="beet-input" type="password" placeholder="> confirmar_senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        {error && (
                            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-3 text-xs font-mono"
                                style={{ background: 'rgba(255,0,85,0.06)', border: '1px solid rgba(255,0,85,0.2)', borderLeft: '2px solid #FF0055', borderRadius: '2px', color: '#FF0055' }}
                            >
                                <AlertTriangle size={12} className="flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="btn-accent w-full flex items-center justify-center gap-3 py-4 mt-2"
                            style={{ background: accentColor }}
                        >
                            {loading
                                ? <><Spinner size="sm" /> PROCESSANDO...</>
                                : <>{tab === 'login' ? `ACESSAR — ${role === 'ARTIST' ? 'ARTISTA' : 'EMPRESA'}` : 'CRIAR CONTA GRÁTIS'} <ArrowRight size={14} /></>
                            }
                        </button>
                    </form>

                    {/* Version tag */}
                    <p className="mt-6 text-center text-[8px] font-mono tracking-widest text-beet-muted opacity-40">
                        BEATBR v2.0 — SISTEMA DEMO ATIVO
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}><Spinner /></div>}>
            <AuthContent />
        </Suspense>
    );
}
