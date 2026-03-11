'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { setAuthCookies } from '@/components/shell/AppShell';
import { Spinner } from '@/components/ui';
import { Mic2, ArrowRight } from 'lucide-react';

function ArtistLoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { loginAsArtist } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginAsArtist(email, password);
            setAuthCookies('ARTIST');
            router.push('/artist/feed');
        } catch (err: any) {
            setError(`// ${(err.message || 'ERRO NO ACESSO').toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm z-10"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] mb-4">
                        <Mic2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
                        PORTAL <span className="text-[#00FF88]">ARTISTA</span>
                    </h1>
                    <p className="text-xs font-mono text-beet-muted mt-2 tracking-widest uppercase">Acesse sua vitrine musical</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-beet-muted uppercase tracking-widest ml-1">Usuário / Email</label>
                        <input
                            className="beet-input"
                            type="email"
                            placeholder="> artist@beatbr.online"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-beet-muted uppercase tracking-widest ml-1">Senha de Acesso</label>
                        <input
                            className="beet-input"
                            type="password"
                            placeholder="> ••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-500 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent w-full py-4 bg-[#00FF88] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
                    >
                        {loading ? <Spinner size="sm" /> : <span className="flex items-center justify-center gap-2">ENTRAR NO BEATBR <ArrowRight size={16} /></span>}
                    </button>
                </form>

                <p className="mt-8 text-center text-[10px] font-mono text-beet-muted">
                    NÃO É ARTISTA? <button onClick={() => router.push('/auth/industry')} className="text-[#00FF88] hover:underline font-bold">ACESSO EMPRESA</button>
                </p>
            </motion.div>
        </div>
    );
}

export default function ArtistLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Spinner /></div>}>
            <ArtistLoginContent />
        </Suspense>
    );
}
