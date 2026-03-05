'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type Proposal, type Message } from '@/lib/store';
import { Avatar, StatusBadge, ScoreBeetBadge, Spinner } from '@/components/ui';

const TYPE_LABELS: Record<string, string> = {
    LIVE_SHOW: 'Show ao vivo', RECORDING: 'Gravação', FEAT: 'Feat',
    MUSIC_VIDEO: 'Clipe', EVENT: 'Evento', OTHER: 'Outro',
};

function MessageBubble({ msg, myId }: { msg: Message; myId: string }) {
    const isMine = msg.senderId === myId;
    if (msg.isSystem) return (
        <div className="my-2 text-center text-xs text-beet-muted">{msg.message}</div>
    );
    return (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar name={msg.senderName} size="sm" emoji={msg.senderRole === 'ARTIST' ? '🎤' : '🏢'} isIndustry={msg.senderRole === 'INDUSTRY'} />
            <div className="max-w-[75%]">
                {!isMine && <p className="mb-0.5 text-[10px] text-beet-muted">{msg.senderName}</p>}
                <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                        background: isMine ? 'var(--color-accent-dim)' : 'var(--color-card)',
                        color: isMine ? 'var(--color-accent)' : 'var(--color-gray)',
                        border: '1px solid var(--color-border)',
                        borderBottomRightRadius: isMine ? '4px' : undefined,
                        borderBottomLeftRadius: !isMine ? '4px' : undefined,
                    }}>
                    {msg.message}
                </div>
                <p className="mt-0.5 text-[9px] text-beet-muted text-right">
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
}

export default function DealRoom() {
    useAuthGuard();
    const { proposalId } = useParams<{ proposalId: string }>();
    const { proposals, currentUser, sendMessage, acceptProposal, rejectProposal, cancelProposal, uploadContract, addToast } = useStore();
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [actLoading, setActLoading] = useState(false);
    const [tab, setTab] = useState<'chat' | 'details' | 'contract'>('chat');

    const proposal = proposals.find((p) => p.id === proposalId);
    const isArtist = currentUser?.role === 'ARTIST';
    const canAct = isArtist && ['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal?.status || '');
    const canCancel = !isArtist && ['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal?.status || '');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [proposal?.messages]);

    if (!proposal) return (
        <AppShell>
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <p className="text-2xl">📋</p>
                <p className="text-white font-semibold">Proposta não encontrada</p>
                <button onClick={() => router.back()} className="btn-outline text-sm">Voltar</button>
            </div>
        </AppShell>
    );

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(proposalId, input.trim());
        setInput('');
    };

    const handleAccept = async () => {
        setActLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        acceptProposal(proposalId);
        setActLoading(false);
    };

    const handleReject = async () => {
        if (!confirm('Recusar esta proposta?')) return;
        setActLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        rejectProposal(proposalId);
        setActLoading(false);
    };

    const handleUploadContract = async () => {
        setUploading(true);
        await new Promise((r) => setTimeout(r, 1200));
        uploadContract(proposalId, `Contrato_v${proposal.contractVersions.length + 1}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
        setUploading(false);
    };

    return (
        <AppShell noPadding>
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col overflow-hidden w-full max-w-[480px] h-full md:h-[calc(100vh-2rem)] md:my-4 md:rounded-2xl md:border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    {/* Left panel */}
                    <div className="flex-shrink-0 border-b overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
                        {/* Mobile tabs */}
                        <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
                            {(['chat', 'details', 'contract'] as const).map((t) => (
                                <button key={t} onClick={() => setTab(t)}
                                    className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
                                    style={{ color: tab === t ? 'var(--color-accent)' : 'var(--color-muted)', borderBottom: tab === t ? '2px solid var(--color-accent)' : '2px solid transparent' }}>
                                    {t === 'chat' ? '💬 Chat' : t === 'details' ? '📋 Proposta' : '📄 Contrato'}
                                </button>
                            ))}
                        </div>

                        <div className={`p-5 space-y-4 ${tab !== 'details' && tab !== 'contract' ? 'hidden' : ''}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-white text-sm">Deal Room</h2>
                                <StatusBadge status={proposal.status} />
                            </div>

                            {/* Participants */}
                            <div className="beet-card p-3 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <Avatar name={proposal.industryName || 'Empresa'} size="sm" emoji="🏢" isIndustry />
                                    <div>
                                        <p className="text-xs font-semibold text-white">{proposal.industryName || 'Empresa'}</p>
                                        <p className="text-[10px] text-beet-muted">Empresa</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Avatar name={proposal.artistName || 'Artista'} size="sm" emoji="🎤" />
                                    <div>
                                        <p className="text-xs font-semibold text-white">{proposal.artistName || 'Artista'}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] text-beet-muted">Artista</p>
                                            <ScoreBeetBadge score={proposal.artistScore || 0} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Proposal details */}
                            <div className="space-y-1.5">
                                <p className="section-title">Proposta</p>
                                {[
                                    { label: 'Tipo', value: TYPE_LABELS[proposal.type] },
                                    { label: 'Valor', value: `R$ ${Number(proposal.amount).toLocaleString('pt-BR')}` },
                                    { label: 'Local', value: proposal.location || (proposal.online ? '🌐 Online' : '—') },
                                    { label: 'Data', value: proposal.date ? new Date(proposal.date).toLocaleDateString('pt-BR') : '—' },
                                    { label: 'Duração', value: proposal.durationHours ? `${proposal.durationHours}h` : '—' },
                                    { label: 'Resp. em', value: proposal.responseDeadline ? new Date(proposal.responseDeadline).toLocaleDateString('pt-BR') : '—' },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between text-xs">
                                        <span className="text-beet-muted">{item.label}</span>
                                        <span className="font-semibold text-white text-right max-w-[55%]">{item.value}</span>
                                    </div>
                                ))}
                                {proposal.terms && (
                                    <div className="mt-2 rounded-xl bg-beet-dark p-2.5 text-xs text-beet-gray leading-relaxed">{proposal.terms}</div>
                                )}
                            </div>

                            {/* Contract versions */}
                            <div>
                                <p className="section-title mb-2">Contrato</p>
                                {proposal.contractVersions.length === 0 ? (
                                    <p className="text-xs text-beet-muted">Nenhuma versão enviada ainda</p>
                                ) : (
                                    <div className="space-y-2">
                                        {proposal.contractVersions.map((v) => (
                                            <div key={v.id} className="flex items-center gap-2 rounded-xl bg-beet-dark px-3 py-2">
                                                <span className="text-sm">📄</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-white truncate">{v.fileName}</p>
                                                    <p className="text-[10px] text-beet-muted">v{v.version} · {v.uploaderRole === 'ARTIST' ? '🎤' : '🏢'}</p>
                                                </div>
                                                <span className="text-xs text-beet-blue cursor-pointer hover:underline">⬇</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {proposal.status === 'ACCEPTED' && (
                                    <button onClick={handleUploadContract} disabled={uploading}
                                        className="btn-outline w-full mt-2 py-2 text-xs flex items-center justify-center gap-2">
                                        {uploading ? <><Spinner size="sm" /> Enviando...</> : '📤 Enviar nova versão'}
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            {(canAct || canCancel) && (
                                <div className="space-y-2 pt-2">
                                    {canAct && (
                                        <>
                                            <button onClick={handleAccept} disabled={actLoading}
                                                className="btn-accent w-full py-3 flex items-center justify-center gap-2">
                                                {actLoading ? <Spinner size="sm" /> : '✓ Aceitar proposta'}
                                            </button>
                                            <button onClick={handleReject} disabled={actLoading}
                                                className="btn-danger w-full py-2.5 text-xs">
                                                ✕ Recusar
                                            </button>
                                        </>
                                    )}
                                    {canCancel && (
                                        <button onClick={() => { if (confirm('Cancelar esta proposta?')) cancelProposal(proposalId); }}
                                            className="btn-danger w-full py-2.5 text-xs">
                                            🚫 Cancelar proposta
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat panel */}
                    <div className={`flex flex-1 flex-col overflow-hidden ${tab !== 'chat' ? 'hidden' : ''}`}>
                        {/* Chat header */}
                        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
                            <button onClick={() => router.back()} className="text-beet-muted hover:text-white transition-colors mr-1">←</button>
                            <p className="text-sm font-semibold text-white">
                                {proposal.industryName} × {proposal.artistName}
                            </p>
                            <StatusBadge status={proposal.status} />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4">
                            {proposal.messages.length === 0 && (
                                <div className="flex h-full items-center justify-center flex-col gap-3 text-center">
                                    <span className="text-4xl">💬</span>
                                    <p className="text-sm text-beet-muted">Nenhuma mensagem ainda.<br />Inicie a conversa!</p>
                                </div>
                            )}
                            {proposal.messages.map((msg) => (
                                <MessageBubble key={msg.id} msg={msg} myId={currentUser?.id || ''} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {['SENT', 'VIEWED', 'NEGOTIATING', 'ACCEPTED'].includes(proposal.status) && (
                            <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex gap-2">
                                    <input className="beet-input flex-1 py-2.5 text-sm"
                                        placeholder="Escreva uma mensagem..."
                                        value={input} onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                                    <button onClick={handleSend} disabled={!input.trim()}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-beet-black disabled:opacity-40 transition-all hover:scale-110"
                                        style={{ background: 'var(--color-accent)' }}>↑</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
