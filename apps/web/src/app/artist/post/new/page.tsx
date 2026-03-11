'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/components/shell/AppShell';
import { useStore, type PublishTarget } from '@/lib/store';
import { Spinner } from '@/components/ui';

const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
    TRACK: ['FunkBR', 'TrapNacional', 'BeatBR', 'NovaMusica', 'RnBBR', 'MusicaBrasileira'],
    VIDEO: ['ClipeBR', 'YoutubeBR', 'BeatBR', 'VideoClipe', 'NovoclipeBR'],
    IMAGE: ['FotoBR', 'ShowBR', 'BeatBR', 'Bastidores', 'StreetArtBR'],
    LYRIC: ['Letra', 'LetraBR', 'Composicao', 'BeatBR', 'NovaletraBR'],
};

type PostType = 'TRACK' | 'VIDEO' | 'IMAGE' | 'LYRIC';

export default function CreatePost() {
    useAuthGuard('ARTIST');
    const { createPost, addToast } = useStore();
    const router = useRouter();

    const [type, setType] = useState<PostType>('TRACK');
    const [text, setText] = useState('');
    const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['BeatBR']);
    const [customHashtag, setCustomHashtag] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [publishTarget, setPublishTarget] = useState<PublishTarget>('FEED');

    const PUBLISH_TARGETS: { key: PublishTarget; label: string; icon: string; desc: string }[] = [
        { key: 'FEED', label: 'Feed', icon: '📡', desc: 'Aparece no feed com boost 48h' },
        { key: 'STORY', label: 'Story', icon: '⏱', desc: 'Expira em 24h' },
        { key: 'FEED_AND_STORY', label: 'Feed + Story', icon: '🚀', desc: 'Máxima visibilidade' },
        { key: 'PROFILE_ONLY', label: 'Só Perfil', icon: '📂', desc: 'Salva no portfólio' },
    ];

    const toggleHashtag = (h: string) =>
        setSelectedHashtags((p) => p.includes(h) ? p.filter((x) => x !== h) : [...p, h]);

    const addCustomHashtag = () => {
        const tag = customHashtag.replace('#', '').trim();
        if (tag && !selectedHashtags.includes(tag)) {
            setSelectedHashtags((p) => [...p, tag]);
            setCustomHashtag('');
        }
    };

    const handlePublish = async () => {
        if (!text.trim()) { addToast({ message: 'Adicione um texto à sua publicação!', type: 'error' }); return; }
        if (!file && type !== 'LYRIC') { addToast({ message: 'Selecione um arquivo para publicar!', type: 'error' }); return; }

        setPublishing(true);
        try {
            await createPost({
                type,
                text,
                hashtags: selectedHashtags,
                file: file || undefined,
                publishTarget,
            });
            router.push('/artist/feed');
        } catch (error) {
            setPublishing(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const TYPE_CONFIG = {
        TRACK: { icon: '🎵', label: 'Faixa/Música', desc: 'Compartilhe uma faixa musical', accept: 'audio/*' },
        VIDEO: { icon: '🎬', label: 'Vídeo', desc: 'Compartilhe um videoclipe ou performance', accept: 'video/*' },
        IMAGE: { icon: '📸', label: 'Imagem', desc: 'Compartilhe uma foto ou arte', accept: 'image/*' },
        LYRIC: { icon: '📝', label: 'Letra/Poesia', desc: 'Compartilhe uma letra ou composição', accept: 'image/*' },
    };

    return (
        <>
            <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:px-6 lg:pb-6">
                <div className="mb-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">←</button>
                    <h1 className="text-xl font-bold text-white">Nova publicação</h1>
                </div>

                <div className="space-y-5">
                    {/* Type selector */}
                    <div>
                        <p className="section-title mb-3">Tipo de conteúdo</p>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG.TRACK][]).map(([t, config]) => (
                                <button key={t} onClick={() => { setType(t); setFile(null); }}
                                    className="rounded-xl border p-3 text-center transition-all duration-200"
                                    style={{
                                        borderColor: type === t ? 'var(--color-accent)' : 'var(--color-border)',
                                        background: type === t ? 'var(--color-accent-dim)' : 'transparent',
                                    }}>
                                    <span className="text-2xl">{config.icon}</span>
                                    <p className="mt-1 text-xs font-semibold" style={{ color: type === t ? 'var(--color-accent)' : 'var(--color-gray)' }}>
                                        {config.label}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload zone */}
                    <div>
                        <p className="section-title mb-2">
                            {type === 'TRACK' ? 'Arquivo de áudio' : type === 'VIDEO' ? 'Arquivo de vídeo' : 'Opcional: imagem'}
                        </p>
                        <label className="block">
                            <input type="file" className="hidden" accept={TYPE_CONFIG[type].accept} onChange={onFileChange} />
                            <div className="rounded-xl border-2 border-dashed p-8 text-center hover:bg-white/3 transition-colors cursor-pointer"
                                style={{ borderColor: file ? 'var(--color-beet-green)' : 'var(--color-accent)' }}>
                                <span className="text-3xl">{file ? '✅' : TYPE_CONFIG[type].icon}</span>
                                <p className="mt-2 text-sm font-medium text-white">
                                    {file ? file.name : TYPE_CONFIG[type].desc}
                                </p>
                                <p className="mt-1 text-xs text-beet-muted">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)}MB` : `${type === 'TRACK' ? 'MP3 ou WAV' : type === 'VIDEO' ? 'MP4 ou MOV' : 'JPG ou PNG'} · até 50MB`}
                                </p>
                                <div className="btn-outline mt-3 px-4 py-2 text-xs inline-block">
                                    {file ? 'Alterar arquivo' : 'Selecionar arquivo'}
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Text / caption */}
                    <div>
                        <p className="section-title mb-2">Legenda / Texto</p>
                        <textarea className="beet-input" rows={4}
                            placeholder={type === 'LYRIC' ? 'Cole sua letra ou composição aqui...' : 'Conte sobre essa música, show ou clipe...'}
                            value={text} onChange={(e) => setText(e.target.value)} />
                        <p className="mt-1 text-right text-[10px] text-beet-muted">{text.length}/500</p>
                    </div>

                    {/* Hashtags */}
                    <div>
                        <p className="section-title mb-2">Hashtags</p>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {HASHTAG_SUGGESTIONS[type].map((h) => (
                                <button key={h} onClick={() => toggleHashtag(h)}
                                    className={`beet-pill cursor-pointer text-xs ${selectedHashtags.includes(h) ? 'active' : ''}`}>
                                    #{h}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input className="beet-input flex-1 text-sm py-2"
                                placeholder="Adicionar hashtag personalizada..."
                                value={customHashtag} onChange={(e) => setCustomHashtag(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomHashtag(); } }} />
                            <button onClick={addCustomHashtag} className="btn-outline px-3 py-2 text-xs">+</button>
                        </div>
                        {selectedHashtags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {selectedHashtags.map((h) => (
                                    <span key={h} className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                                        #{h}
                                        <button onClick={() => toggleHashtag(h)} className="text-beet-muted hover:text-beet-red ml-0.5 text-[10px]">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <motion.div className="beet-card p-4" key="preview">
                        <p className="section-title mb-3">Preview da publicação</p>
                        <p className="text-sm text-beet-gray">
                            {text || <span className="text-beet-muted italic">O texto aparecerá aqui...</span>}
                        </p>
                        {selectedHashtags.length > 0 && (
                            <p className="mt-2 text-sm" style={{ color: 'var(--color-accent)' }}>
                                {selectedHashtags.map((h) => `#${h}`).join(' ')}
                            </p>
                        )}
                    </motion.div>

                    {/* Publish Target */}
                    <div>
                        <p className="section-title mb-3">Publicar em</p>
                        <div className="grid grid-cols-2 gap-2">
                            {PUBLISH_TARGETS.map(t => (
                                <button key={t.key} onClick={() => setPublishTarget(t.key)}
                                    className="rounded-xl border p-3 text-left transition-all duration-200"
                                    style={{
                                        borderColor: publishTarget === t.key ? 'var(--color-accent)' : 'var(--color-border)',
                                        background: publishTarget === t.key ? 'var(--color-accent-dim)' : 'transparent',
                                    }}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{t.icon}</span>
                                        <span className="text-xs font-bold" style={{ color: publishTarget === t.key ? 'var(--color-accent)' : 'var(--color-gray)' }}>
                                            {t.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[10px] text-beet-muted">{t.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Publish */}
                    <button onClick={handlePublish} disabled={publishing} className="btn-accent w-full flex items-center justify-center gap-2 py-4">
                        {publishing ? <><Spinner size="sm" /> Publicando...</> : '🚀 Publicar agora'}
                    </button>
                </div>
            </div>
        </>
    );
}

