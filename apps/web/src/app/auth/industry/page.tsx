'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { setAuthCookies } from '@/components/shell/AppShell';
import { Spinner } from '@/components/ui';
import { Building2, ArrowRight } from 'lucide-react';

function IndustryLoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { loginAsIndustry } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginAsIndustry(email, password);
            setAuthCookies('INDUSTRY');
            router.push('/industry/dashboard');
        } catch (err: any) {
            setError(`// ${(err.message || 'ERRO NO ACESSO').toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm z-10"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] mb-4 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
                        ÁREA <span className="text-[#00E5FF]">BUSINESS</span>
                    </h1>
                    <p className="text-xs font-mono text-beet-muted mt-2 tracking-widest uppercase">Gerencie seus projetos e talentos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-beet-muted uppercase tracking-widest ml-1">Identificação Empresa</label>
                        <input
                            className="beet-input border-[#00E5FF]/20 focus:border-[#00E5FF]"
                            type="email"
                            placeholder="> business@label.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-beet-muted uppercase tracking-widest ml-1">Código de Acesso</label>
                        <input
                            className="beet-input border-[#00E5FF]/20 focus:border-[#00E5FF]"
                            type="password"
                            placeholder="> ••••••"
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
                        className="btn-accent w-full py-4 bg-[#00E5FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all uppercase font-black"
                    >
                        {loading ? <Spinner size="sm" /> : <span className="flex items-center justify-center gap-2">ACESSAR PAINEL <ArrowRight size={16} /></span>}
                    </button>
                </form>

                <p className="mt-8 text-center text-[10px] font-mono text-beet-muted">
                    É UM TALENTO? <button onClick={() => router.push('/auth/artist')} className="text-[#00E5FF] hover:underline font-bold">ACESSO ARTISTA</button>
                </p>
            </motion.div>
        </div>
    );
}

export default function IndustryLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050505]"><Spinner /></div>}>
            <IndustryLoginContent />
        </Suspense>
    );
}
