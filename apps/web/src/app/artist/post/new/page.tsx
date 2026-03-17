'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Music, 
    Video, 
    Image as ImageIcon, 
    FileText, 
    ChevronLeft, 
    Upload, 
    X, 
    Plus, 
    Check, 
    Globe, 
    Clock, 
    Zap, 
    LayoutDashboard 
} from 'lucide-react';
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

    const PUBLISH_TARGETS: { key: PublishTarget; label: string; icon: any; desc: string }[] = [
        { key: 'FEED', label: 'Feed', icon: Zap, desc: 'Aparece no feed com boost 48h' },
        { key: 'STORY', label: 'Story', icon: Clock, desc: 'Expira em 24h' },
        { key: 'FEED_AND_STORY', label: 'Feed + Story', icon: Globe, desc: 'Máxima visibilidade' },
        { key: 'PROFILE_ONLY', label: 'Só Perfil', icon: LayoutDashboard, desc: 'Salva no portfólio' },
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
        TRACK: { icon: Music, label: 'Música', desc: 'Compartilhe uma faixa musical', accept: 'audio/*' },
        VIDEO: { icon: Video, label: 'Vídeo', desc: 'Compartilhe um videoclipe ou performance', accept: 'video/*' },
        IMAGE: { icon: ImageIcon, label: 'Imagem', desc: 'Compartilhe uma foto ou arte', accept: 'image/*' },
        LYRIC: { icon: FileText, label: 'Letra', desc: 'Compartilhe uma letra ou composição', accept: 'image/*' },
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
            <div className="mx-auto max-w-2xl px-4 py-8 pb-32">
                <div className="mb-10 flex items-center gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90"
                        style={{ background: 'var(--color-glass-btn)', border: '1px solid var(--color-nav-border)' }}
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-beet-muted uppercase tracking-[0.3em] mb-1 block">Estúdio Criativo</span>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                            Nova <span className="text-beet-green">Publicação</span>
                        </h1>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Type selector */}
                    <div>
                        <p className="section-title mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-beet-green" />
                            Tipo de conteúdo
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                            {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG.TRACK][]).map(([t, config]) => (
                                <button key={t} onClick={() => { setType(t); setFile(null); }}
                                    className="relative flex flex-col items-center justify-center rounded-2xl border p-4 md:p-5 text-center transition-all duration-300 group overflow-hidden active:scale-95"
                                    style={{
                                        borderColor: type === t ? 'var(--color-accent)' : 'var(--color-nav-border)',
                                        background: type === t ? 'var(--color-accent-dim)' : 'var(--color-nav-bg)',
                                        boxShadow: type === t ? '0 0 20px rgba(0,255,136,0.1)' : 'none'
                                    }}>
                                    {type === t && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-2 h-2 rounded-full bg-beet-green animate-pulse" />
                                        </div>
                                    )}
                                    <div className={`mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110 ${type === t ? 'text-beet-green' : 'text-beet-muted'}`}>
                                        <config.icon size={28} strokeWidth={type === t ? 2.5 : 2} className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest truncate w-full ${type === t ? 'text-beet-green' : 'text-beet-muted'}`}>
                                        {config.label}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload zone */}
                    <div>
                        <p className="section-title mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-beet-green" />
                            {type === 'TRACK' ? 'Arquivo de áudio' : type === 'VIDEO' ? 'Arquivo de vídeo' : type === 'IMAGE' ? 'Mídia da publicação' : 'Opcional: Imagem/Arte'}
                        </p>
                        <label className="group block cursor-pointer">
                            <input type="file" className="hidden" accept={TYPE_CONFIG[type].accept} onChange={onFileChange} />
                            <div className="relative rounded-[2rem] border-2 border-dashed p-8 md:p-12 text-center transition-all duration-500 overflow-hidden"
                                style={{ 
                                    borderColor: file ? 'var(--color-beet-green)' : 'rgba(255,255,255,0.1)',
                                    background: 'var(--color-nav-bg)',
                                }}>
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-beet-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className={`mb-4 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl border-2 transition-all duration-500 scale-100 group-hover:scale-110 ${
                                        file 
                                            ? 'bg-beet-green/20 border-beet-green text-beet-green' 
                                            : 'bg-white/5 border-white/10 text-beet-green shadow-neon'
                                    }`}>
                                        {file ? <Check size={28} /> : <Upload size={28} />}
                                    </div>
                                    
                                    <h4 className="text-sm md:text-lg font-black text-white uppercase tracking-tight line-clamp-1 px-4">
                                        {file ? file.name : TYPE_CONFIG[type].desc}
                                    </h4>
                                    
                                    <p className="mt-2 text-[9px] md:text-xs font-bold text-beet-muted uppercase tracking-widest">
                                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)}MB` : `${type === 'TRACK' ? 'MP3 ou WAV' : type === 'VIDEO' ? 'MP4 ou MOV' : 'JPG ou PNG'} · até 50MB`}
                                    </p>
                                    
                                    <div className={`mt-6 rounded-xl px-4 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                        file 
                                            ? 'bg-white/10 text-white' 
                                            : 'bg-beet-green text-[#080812] shadow-neon hover:scale-105 active:scale-95'
                                    }`}>
                                        {file ? 'Alterar arquivo' : 'Selecionar arquivo'}
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Text / caption */}
                    <div>
                        <p className="section-title mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-beet-green" />
                            Legenda / Texto
                        </p>
                        <div className="relative">
                            <textarea className="beet-input min-h-[160px] p-6 text-base"
                                placeholder={type === 'LYRIC' ? 'Cole sua letra ou composição aqui...' : 'Conte sobre essa música, show ou clipe...'}
                                value={text} onChange={(e) => setText(e.target.value)} />
                            <div className="absolute bottom-4 right-4 rounded-lg bg-black/40 px-2 py-1 backdrop-blur-md">
                                <p className="text-[10px] font-black text-beet-muted">{text.length}/500</p>
                            </div>
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                        <p className="section-title mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-beet-green" />
                            Hashtags em Alta
                        </p>
                        <div className="mb-4 flex flex-wrap gap-2">
                            {HASHTAG_SUGGESTIONS[type].map((h) => (
                                <button key={h} onClick={() => toggleHashtag(h)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        selectedHashtags.includes(h) 
                                            ? 'bg-beet-green text-[#080812] shadow-neon' 
                                            : 'bg-white/5 border border-white/5 text-white hover:border-white/20'
                                    }`}>
                                    #{h}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input className="beet-input py-4 pl-6 text-sm"
                                    placeholder="Add hashtag personalizada..."
                                    value={customHashtag} onChange={(e) => setCustomHashtag(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomHashtag(); } }} />
                            </div>
                            <button 
                                onClick={addCustomHashtag} 
                                className="flex aspect-square h-full items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        
                        {selectedHashtags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedHashtags.map((h) => (
                                    <span key={h} className="group flex items-center gap-2 rounded-xl border border-beet-green/30 bg-beet-green/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-beet-green">
                                        #{h}
                                        <button onClick={() => toggleHashtag(h)} className="text-beet-green/50 hover:text-beet-red transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <motion.div className="rounded-[2.5rem] border border-white/5 bg-beet-black/40 p-8 backdrop-blur-xl" key="preview">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-[10px] font-black text-beet-accent uppercase tracking-[0.3em]">Preview Instantâneo</p>
                            <div className="flex gap-1">
                                <div className="h-1 w-4 rounded-full bg-beet-accent" />
                                <div className="h-1 w-1 rounded-full bg-white/10" />
                                <div className="h-1 w-1 rounded-full bg-white/10" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-lg leading-relaxed text-white font-medium">
                                {text || <span className="text-beet-muted/30 italic">O texto aparecerá aqui...</span>}
                            </p>
                            {selectedHashtags.length > 0 && (
                                <p className="flex flex-wrap gap-2 text-sm font-bold text-beet-accent italic">
                                    {selectedHashtags.map((h) => `#${h}`).join(' ')}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Publish Target */}
                    <div>
                        <p className="section-title mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-beet-accent" />
                            Onde Publicar?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {PUBLISH_TARGETS.map(t => (
                                <button key={t.key} onClick={() => setPublishTarget(t.key)}
                                    className="rounded-2xl border p-4 text-left transition-all duration-300 group"
                                    style={{
                                        borderColor: publishTarget === t.key ? 'var(--color-accent)' : 'var(--color-nav-border)',
                                        background: publishTarget === t.key ? 'var(--color-accent-dim)' : 'var(--color-nav-bg)',
                                    }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${publishTarget === t.key ? 'text-beet-accent' : 'text-beet-muted'}`}>
                                            <t.icon size={20} />
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-widest ${publishTarget === t.key ? 'text-beet-accent' : 'text-beet-muted'}`}>
                                            {t.label}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-beet-muted uppercase tracking-tight leading-relaxed">{t.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Publish Button */}
                    <button 
                        onClick={handlePublish} 
                        disabled={publishing} 
                        className="group relative w-full flex items-center justify-center gap-3 overflow-hidden rounded-[2rem] py-5 text-sm font-black uppercase tracking-[0.2em] text-black shadow-neon transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                        style={{ background: 'var(--color-accent)' }}
                    >
                        {publishing ? (
                            <><Spinner size="sm" /> Publicando...</>
                        ) : (
                            <>
                                <Zap size={18} className="fill-current" />
                                <span>Publicar Agora</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-beet-muted uppercase tracking-widest">
                        Sua publicação será validada pela curadoria Beeat
                    </p>
                </div>
            </div>
        </div>
    );
}

