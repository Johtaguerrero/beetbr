'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, useAuthGuard, clearAuthCookies } from '@/components/shell/AppShell';
import { useStore } from '@/lib/store';
import { Toggle } from '@/components/ui';

type SettingsSection = 'conta' | 'privacidade' | 'notificacoes' | 'plano';

const SECTIONS = [
    { id: 'conta', label: 'Conta', icon: '👤' },
    { id: 'privacidade', label: 'Privacidade', icon: '🔒' },
    { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
    { id: 'plano', label: 'Plano & Assinatura', icon: '⭐' },
] as const;

export default function Settings() {
    useAuthGuard();
    const [section, setSection] = useState<SettingsSection>('conta');
    const [prefs, setPrefs] = useState({
        profilePublic: true,
        appearInSearch: true,
        notifyProposals: true,
        notifyMessages: true,
        notifyContracts: true,
        notifyFollowers: false,
    });
    const { currentUser, artistProfile, industryProfile, logout, addToast } = useStore();
    const router = useRouter();

    const togglePref = (key: keyof typeof prefs) =>
        setPrefs((p) => ({ ...p, [key]: !p[key] }));

    const handleLogout = () => {
        logout();
        clearAuthCookies();
        router.push('/');
    };

    const handleDeleteAccount = () => {
        if (!confirm('Tem certeza? Esta ação é irreversível e todos os dados serão perdidos.')) return;
        logout();
        clearAuthCookies();
        addToast({ message: 'Conta excluída.', type: 'info' });
        router.push('/');
    };

    const isArtist = currentUser?.role === 'ARTIST';
    const displayName = artistProfile?.stageName || industryProfile?.companyName || currentUser?.email || 'Usuário';

    return (
        <AppShell>
            <div className="flex min-h-screen flex-col lg:flex-row overflow-hidden max-h-screen">
                {/* Nav sidebar */}
                <aside className="w-full border-b px-4 py-4 lg:w-56 lg:border-b-0 lg:border-r lg:py-6 lg:px-3 flex-shrink-0"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }} className="hidden lg:block">
                        CONFIGURA<span style={{ color: 'var(--color-accent)' }}>ÇÕES</span>
                    </p>
                    {/* Mobile: horizontal scroll */}
                    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:space-y-0.5">
                        {SECTIONS.map((s) => (
                            <button key={s.id} onClick={() => setSection(s.id as SettingsSection)}
                                className={`sidebar-link flex-shrink-0 whitespace-nowrap ${section === s.id ? 'active' : ''}`}>
                                <span>{s.icon}</span>
                                <span className="hidden lg:inline">{s.label}</span>
                                <span className="lg:hidden text-xs">{s.label}</span>
                            </button>
                        ))}
                        <div className="hidden lg:block my-2 border-t" style={{ borderColor: 'var(--color-border)' }} />
                        <button onClick={handleLogout} className="sidebar-link text-beet-red hover:bg-beet-red/10 hidden lg:flex">
                            🚪 <span>Sair da conta</span>
                        </button>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-2xl space-y-5">
                        {section === 'conta' && (
                            <>
                                <h2 className="page-header-sm" style={{ marginBottom: 16 }}>CONTA</h2>
                                <div className="beet-card p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: 'var(--color-accent-dim)' }}>
                                            {isArtist ? '🎤' : '🏢'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{displayName}</p>
                                            <p className="text-sm text-beet-muted">{currentUser?.email}</p>
                                            <span className="beet-pill text-[10px]">{isArtist ? '🎵 Artista' : '🏢 Empresa'}</span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-beet-muted">Email</span>
                                            <span className="text-white">{currentUser?.email}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-beet-muted">Senha</span>
                                            <button className="text-neon text-xs hover:underline">Alterar →</button>
                                        </div>
                                    </div>
                                </div>

                                {isArtist && artistProfile && (
                                    <div className="beet-card p-5">
                                        <p className="section-title mb-3">Perfil artístico</p>
                                        <div className="space-y-2 text-sm">
                                            {[
                                                { label: 'Nome artístico', value: artistProfile.stageName },
                                                { label: 'Gêneros', value: artistProfile.genres.join(', ') },
                                                { label: 'Localização', value: `${artistProfile.city}, ${artistProfile.state}` },
                                                { label: 'Score Beet', value: `🐝 ${Math.round(artistProfile.scoreBeet)}` },
                                            ].map((item) => (
                                                <div key={item.label} className="flex justify-between">
                                                    <span className="text-beet-muted">{item.label}</span>
                                                    <span className="text-white font-medium">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile logout */}
                                <button onClick={handleLogout}
                                    className="btn-outline w-full text-beet-red border-beet-red/30 hover:bg-beet-red/10 lg:hidden">
                                    🚪 Sair da conta
                                </button>

                                {/* Danger zone */}
                                <div className="rounded-xl border border-beet-red/30 p-5">
                                    <p className="mb-3 font-semibold text-beet-red">⚠️ Zona de Perigo</p>
                                    <p className="mb-4 text-xs text-beet-muted">Esta ação exclui permanentemente sua conta e todos os dados associados. Não pode ser desfeita.</p>
                                    <button onClick={handleDeleteAccount} className="btn-danger w-full py-3 text-sm">
                                        Excluir conta permanentemente
                                    </button>
                                </div>
                            </>
                        )}

                        {section === 'privacidade' && (
                            <>
                                <h2 className="page-header-sm" style={{ marginBottom: 16 }}>PRIVACIDADE</h2>
                                <div className="space-y-3">
                                    {[
                                        { key: 'profilePublic', label: 'Perfil público', desc: 'Qualquer pessoa pode ver seu perfil' },
                                        { key: 'appearInSearch', label: 'Aparecer nas buscas', desc: 'Empresas podem encontrá-lo em Descobrir' },
                                    ].map((item) => (
                                        <div key={item.key} className="beet-card flex items-center justify-between p-4">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{item.label}</p>
                                                <p className="text-xs text-beet-muted">{item.desc}</p>
                                            </div>
                                            <Toggle checked={prefs[item.key as keyof typeof prefs]}
                                                onChange={() => togglePref(item.key as keyof typeof prefs)} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {section === 'notificacoes' && (
                            <>
                                <h2 className="page-header-sm" style={{ marginBottom: 16 }}>NOTIFICAÇÕES</h2>
                                <div className="space-y-3">
                                    {[
                                        { key: 'notifyProposals', label: 'Novas propostas', desc: 'Quando uma empresa enviar uma proposta' },
                                        { key: 'notifyMessages', label: 'Mensagens no Deal Room', desc: 'Novas mensagens de negociação' },
                                        { key: 'notifyContracts', label: 'Contratos atualizados', desc: 'Nova versão de contrato enviada' },
                                        { key: 'notifyFollowers', label: 'Novos seguidores', desc: 'Quando alguém te seguir' },
                                    ].map((item) => (
                                        <div key={item.key} className="beet-card flex items-center justify-between p-4">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{item.label}</p>
                                                <p className="text-xs text-beet-muted mt-0.5">{item.desc}</p>
                                            </div>
                                            <Toggle checked={prefs[item.key as keyof typeof prefs]}
                                                onChange={() => togglePref(item.key as keyof typeof prefs)} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {section === 'plano' && (
                            <>
                                <h2 className="page-header-sm" style={{ marginBottom: 16 }}>PLANO <span style={{ color: 'var(--color-accent)' }}>&</span> ASSINATURA</h2>
                                <div className="beet-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-muted)', border: '1px solid var(--color-border)', padding: '4px 12px', borderRadius: '2px' }}>GRATUITO</span>
                                        <span className="text-xs text-beet-muted">Atualizado em março/2025</span>
                                    </div>
                                    <ul className="space-y-2 text-sm text-beet-gray mb-5">
                                        {[
                                            '✓ Perfil público',
                                            '✓ Feed e Stories',
                                            isArtist ? '✓ Receber propostas ilimitadas' : '✓ Até 3 propostas/mês',
                                            '✓ Deal Room com chat',
                                            '✓ Score Beet público',
                                        ].map((f) => <li key={f}>{f}</li>)}
                                    </ul>
                                    <div className="rounded-xl bg-beet-dark p-4 mb-4">
                                        <p className="font-bold text-white mb-1">🚀 BeatBR Pro</p>
                                        <ul className="text-xs text-beet-muted space-y-1">
                                            {['Score Beet detalhado', 'Propostas ilimitadas', 'Analytics avançado', 'Badge verificado', 'Suporte prioritário'].map((f) => (
                                                <li key={f}>⭐ {f}</li>
                                            ))}
                                        </ul>
                                        <p className="mt-3 font-black text-white">R$ 49/mês <span className="text-xs text-beet-muted font-normal">ou R$ 399/ano</span></p>
                                    </div>
                                    <button className="btn-accent w-full py-3">Upgrade para Pro →</button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </AppShell>
    );
}

