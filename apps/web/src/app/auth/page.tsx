'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mic2, Building2, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();

    const options = [
        {
            id: 'artist',
            title: 'Sou Artista',
            description: 'Quero mostrar meu trabalho e fechar contratos.',
            icon: <Mic2 size={32} />,
            color: '#00FF88',
            path: '/auth/artist',
            bg: 'rgba(0,255,136,0.05)',
            border: 'rgba(0,255,136,0.2)'
        },
        {
            id: 'industry',
            title: 'Sou Empresa',
            description: 'Procuro talentos para meus projetos e eventos.',
            icon: <Building2 size={32} />,
            color: '#00E5FF',
            path: '/auth/industry',
            bg: 'rgba(0,229,255,0.05)',
            border: 'rgba(0,229,255,0.2)'
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00FF88]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00E5FF]/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center z-10"
            >
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                    QUEM <span className="text-beet-muted">É VOCÊ?</span>
                </h1>
                <p className="text-sm font-mono text-beet-muted tracking-widest uppercase">Selecione seu perfil para continuar</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
                {options.map((opt, i) => (
                    <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        onClick={() => router.push(opt.path)}
                        className="group relative flex flex-col items-start p-8 rounded-3xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            backgroundColor: opt.bg,
                            borderColor: opt.border
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                            style={{ backgroundColor: `${opt.color}15`, color: opt.color }}
                        >
                            {opt.icon}
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2 uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {opt.title}
                        </h2>
                        <p className="text-beet-muted text-sm mb-8 leading-relaxed">
                            {opt.description}
                        </p>

                        <div
                            className="mt-auto flex items-center gap-2 text-xs font-bold font-mono tracking-widest uppercase"
                            style={{ color: opt.color }}
                        >
                            ACESSAR PORTAL <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </div>

                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ boxShadow: `0 0 40px ${opt.color}10` }} />
                    </motion.button>
                ))}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-[10px] font-mono text-beet-muted tracking-widest uppercase opacity-40"
            >
                BEATBR © 2026 — ECOSSISTEMA MUSICAL
            </motion.p>
        </div>
    );
}
