'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Music, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  PlusCircle, 
  Trash2, 
  AlertCircle,
  FileAudio,
  ImageIcon,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  Share2
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, title: 'Tipo de Collab', icon: Music },
  { id: 2, title: 'Título', icon: PlusCircle },
  { id: 3, title: 'Descrição', icon: PlusCircle },
  { id: 4, title: 'Informações', icon: MapPin },
  { id: 5, title: 'Acordo', icon: DollarSign },
  { id: 6, title: 'Uploads', icon: Upload },
  { id: 7, title: 'Visibilidade', icon: Share2 }
];

const collabTypes = [
  { value: 'BEATMAKER', label: 'Beatmaker' },
  { value: 'PRODUCER', label: 'Produtor' },
  { value: 'MC', label: 'MC' },
  { value: 'SINGER', label: 'Cantor(a)' },
  { value: 'SONGWRITER', label: 'Compositor(a)' },
  { value: 'DJ', label: 'DJ' },
  { value: 'INSTRUMENTALIST', label: 'Instrumentista' },
  { value: 'VIDEO_EDITOR', label: 'Editor de vídeo' },
  { value: 'VIDEOMAKER', label: 'Videomaker' },
  { value: 'DESIGNER', label: 'Designer / capa' },
  { value: 'OTHER', label: 'Outro' },
];

const collabModes = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'HIBRIDO', label: 'Híbrido' },
];

const compensationTypes = [
  { value: 'FREE', label: 'Collab gratuita' },
  { value: 'REV_SHARE', label: 'Collab com divisão de receita' },
  { value: 'PAID', label: 'Collab com cachê' },
  { value: 'NEGOTIABLE', label: 'A combinar' },
];

const deadlines = [
  { value: 'urgente', label: 'Urgente' },
  { value: '7 dias', label: '7 dias' },
  { value: '15 dias', label: '15 dias' },
  { value: 'sem pressa', label: 'Sem pressa' },
];

export default function NewCollabPage() {
  const router = useRouter();
  const { createCollabPost, artistProfile, addToast } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    genres: [] as string[],
    subgenres: [] as string[],
    city: artistProfile?.city || '',
    state: artistProfile?.state || '',
    mode: 'ONLINE',
    deadline: '7 dias',
    compensation: 'FREE',
    compensationValue: 0,
    coverUrl: '',
    audioUrl: '',
    videoUrl: '',
    links: [] as string[],
    publishedInFeed: true,
    publishedInStory: false
  });

  const [newLink, setNewLink] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const { url } = await api.upload(file);
      if (type === 'cover') setFormData(prev => ({ ...prev, coverUrl: url }));
      if (type === 'audio') setFormData(prev => ({ ...prev, audioUrl: url }));
      if (type === 'video') setFormData(prev => ({ ...prev, videoUrl: url }));
      addToast({ message: 'Upload concluído!', type: 'success' });
    } catch (error) {
      addToast({ message: 'Erro ao subir arquivo', type: 'error' });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleAddLink = () => {
    if (!newLink) return;
    setFormData(prev => ({ ...prev, links: [...prev.links, newLink] }));
    setNewLink('');
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      addToast({ message: 'Preencha os campos obrigatórios', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await createCollabPost(formData as any);
      addToast({ message: 'Collab publicada!', type: 'success' });
      router.push('/artist/collabs');
    } catch (error) {
      // error toast handled in store
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">O que você está procurando?</h2>
            <div className="grid grid-cols-2 gap-3">
              {collabTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setFormData({ ...formData, type: type.value });
                    nextStep();
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.type === type.value
                      ? 'border-beet-green bg-beet-green/10 text-white'
                      : 'border-white/10 bg-white/5 text-beet-muted hover:border-white/30'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Título da Collab</h2>
            <p className="text-beet-muted text-sm">Dê um título atrativo para sua oportunidade.</p>
            <input
              type="text"
              placeholder="Ex: Procuro beatmaker para EP trap dark"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-beet-green"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Descrição</h2>
            <p className="text-beet-muted text-sm">Explique o projeto e o que você espera dessa collab.</p>
            <textarea
              rows={6}
              placeholder="Conte mais sobre o som, suas referências e quem você busca..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-beet-green resize-none"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Informações principais</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-beet-muted">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-beet-muted">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-beet-muted">Prazo</label>
              <div className="grid grid-cols-2 gap-2">
                {deadlines.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setFormData({ ...formData, deadline: d.value })}
                    className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                      formData.deadline === d.value
                        ? 'border-beet-green bg-beet-green/10 text-white'
                        : 'border-white/10 bg-white/5 text-beet-muted'
                    }`}
                  >
                    <Clock size={16} />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-beet-muted">Formato</label>
              <div className="flex gap-2">
                {collabModes.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setFormData({ ...formData, mode: m.value })}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      formData.mode === m.value
                        ? 'border-beet-green bg-beet-green/10 text-white'
                        : 'border-white/10 bg-white/5 text-beet-muted'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Tipo de acordo</h2>
            <p className="text-beet-muted text-sm">Como você pretende conduzir essa parceria?</p>
            
            <div className="space-y-3">
              {compensationTypes.map(c => (
                <button
                  key={c.value}
                  onClick={() => setFormData({ ...formData, compensation: c.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.compensation === c.value
                      ? 'border-beet-green bg-beet-green/10 text-white'
                      : 'border-white/10 bg-white/5 text-beet-muted'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {formData.compensation === 'PAID' && (
              <div className="space-y-2">
                <label className="text-sm text-beet-muted">Valor do cachê (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-beet-muted" size={20} />
                  <input
                    type="number"
                    value={formData.compensationValue}
                    onChange={(e) => setFormData({ ...formData, compensationValue: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-beet-green"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Uploads da Collab</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-beet-green/20 flex items-center justify-center text-beet-green">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Capa da Collab</h4>
                      <p className="text-xs text-beet-muted">Formato 1:1 recomendado (1080x1080)</p>
                    </div>
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Upload size={20} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cover')} />
                  </label>
                </div>
                {formData.coverUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                    <img src={formData.coverUrl} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFormData({ ...formData, coverUrl: '' })}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-md text-beet-red"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-beet-blue/20 flex items-center justify-center text-beet-blue">
                      <FileAudio size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Áudio Demo</h4>
                      <p className="text-xs text-beet-muted">Trecho do projeto ou idéia (MP3/WAV)</p>
                    </div>
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Upload size={20} className="text-white" />
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                  </label>
                </div>
                {formData.audioUrl && (
                  <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                    <FileAudio size={16} className="text-beet-muted" />
                    <span className="text-xs text-beet-muted truncate flex-1">Áudio carregado</span>
                    <button onClick={() => setFormData({ ...formData, audioUrl: '' })} className="text-beet-red">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Onde publicar?</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setFormData({ ...formData, publishedInFeed: true, publishedInStory: false })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.publishedInFeed && !formData.publishedInStory
                    ? 'border-beet-green bg-beet-green/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">Publicar no Feed</span>
                  {formData.publishedInFeed && !formData.publishedInStory && <Check size={20} className="text-beet-green" />}
                </div>
                <p className="text-sm text-beet-muted">Gera uma postagem automática no feed de notícias.</p>
              </button>

              <button
                onClick={() => setFormData({ ...formData, publishedInFeed: true, publishedInStory: true })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.publishedInFeed && formData.publishedInStory
                    ? 'border-beet-green bg-beet-green/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold">Feed + Stories</span>
                  {formData.publishedInFeed && formData.publishedInStory && <Check size={20} className="text-beet-green" />}
                </div>
                <p className="text-sm text-beet-muted">Recomendado! Maior visibilidade e velocidade de resposta.</p>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-beet-green/5 border border-beet-green/20 flex gap-4">
              <AlertCircle size={24} className="text-beet-green shrink-0" />
              <p className="text-xs text-beet-green/80">
                Ao publicar no feed, sua collab ficará em destaque por 48h para todos os artistas da rede.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-beet-dark">
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-beet-green text-black flex items-center justify-center font-bold">
                {currentStep}
              </div>
              <div>
                <span className="text-xs text-beet-muted block">Passo {currentStep} de {steps.length}</span>
                <span className="text-white font-medium">{steps.find(s => s.id === currentStep)?.title}</span>
              </div>
            </div>
            <button 
              onClick={() => router.back()}
              className="text-beet-muted hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex gap-1 h-1">
            {steps.map(s => (
              <div 
                key={s.id}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  s.id <= currentStep ? 'bg-beet-green' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-beet-dark-lighter border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                currentStep === 1 ? 'opacity-0' : 'text-beet-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <ChevronLeft size={20} />
              Voltar
            </button>

            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-beet-green text-black px-10 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Publicar Collab <Check size={20} /></>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !formData.type}
                className="bg-white text-black px-10 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                Continuar
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Uploading Overlay */}
      {Object.values(uploading).some(Boolean) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-beet-dark-lighter border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-beet-green/30 border-t-beet-green rounded-full animate-spin" />
            <p className="text-white font-medium">Subindo mídia...</p>
          </div>
        </div>
      )}
    </div>
  );
}
