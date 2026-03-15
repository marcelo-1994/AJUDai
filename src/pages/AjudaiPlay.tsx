import React, { useState, useEffect } from 'react';
import { Play, Lock, Unlock, Star, Award, CheckCircle2, TrendingUp, ShoppingCart, X, Video, DollarSign, ShieldCheck, Heart, MessageCircle, Share2, MoreVertical, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export const AjudaiPlay = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [unlockedVideos, setUnlockedVideos] = useState<number[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('negocios');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handlePlayClick = (video: any) => {
    if (video.isPremium && !unlockedVideos.includes(video.id)) {
      setSelectedVideo(video);
      setShowPaymentModal(true);
    } else {
      setPlayingVideo(video);
      setLiked(false);
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setUnlockedVideos([...unlockedVideos, selectedVideo.id]);
      setIsProcessing(false);
      setShowPaymentModal(false);
      alert('Pagamento aprovado! O conteúdo foi desbloqueado e o profissional foi remunerado.');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-16 relative">
        <div className="transform -skew-x-6 origin-left">
          <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase text-white mb-6">
            Ajudaí <span className="text-emerald-500">Play</span>
          </h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-t border-white/10 pt-6">
          <p className="text-zinc-400 max-w-xl text-lg font-light">
            Monetize seu conhecimento ou aprenda com os melhores. Entregue valor real através de masterclasses, tutoriais e consultorias gravadas.
          </p>
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={() => setShowPublishModal(true)}
              className="bg-white text-black hover:bg-zinc-200 rounded-full py-6 px-8 font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Publicar Conteúdo
            </Button>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Fique com 90% das vendas</p>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Masterclasses & Sessões
        </h2>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
          <Video className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum conteúdo publicado</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            Seja o primeiro a compartilhar seu conhecimento.
          </p>
          <Button 
            onClick={() => setShowPublishModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-full font-bold uppercase tracking-widest text-xs"
          >
            Publicar Agora
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => {
            const isUnlocked = !video.isPremium || unlockedVideos.includes(video.id);
            const numberStr = (index + 1).toString().padStart(2, '0');

            return (
              <div key={video.id} className="group relative bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-3xl p-4 md:p-6 transition-all duration-500 flex flex-col md:flex-row gap-6 md:gap-8 items-center overflow-hidden">
                
                {/* Number Indicator */}
                <div className="hidden md:block font-serif text-6xl font-light text-white/5 group-hover:text-white/10 transition-colors w-20 text-center select-none">
                  {numberStr}
                </div>

                {/* Thumbnail */}
                <div className="relative w-full md:w-80 aspect-video rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Lock className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center w-full relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">
                      {video.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {video.duration}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-medium text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-6 max-w-2xl font-light leading-relaxed">
                    {video.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-4 border-t border-white/5 gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={video.author.avatar} 
                        alt={video.author.name} 
                        className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all border border-white/10 cursor-pointer" 
                        onClick={(e) => { e.stopPropagation(); if(video.author.id) window.location.href = `/user/${video.author.id}`; }}
                      />
                      <div>
                        <span 
                          className="text-sm text-zinc-200 font-medium block cursor-pointer hover:text-emerald-400 transition-colors"
                          onClick={(e) => { e.stopPropagation(); if(video.author.id) window.location.href = `/user/${video.author.id}`; }}
                        >
                          {video.author.name}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">{video.author.role}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {video.isPremium ? (
                        isUnlocked ? (
                          <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                            <Unlock className="w-4 h-4" /> Acesso Liberado
                          </span>
                        ) : (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handlePlayClick(video); }}
                            className="bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-full px-6 py-2 text-sm font-medium transition-colors w-full sm:w-auto"
                          >
                            Desbloquear R$ {Number(video.price || 0).toFixed(2).replace('.', ',')}
                          </Button>
                        )
                      ) : (
                        <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                          <Unlock className="w-4 h-4" /> Grátis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Clickable Overlay for the whole row if unlocked */}
                {isUnlocked && (
                  <button 
                    onClick={() => handlePlayClick(video)}
                    className="absolute inset-0 w-full h-full cursor-pointer z-0 opacity-0"
                    aria-label={`Assistir ${video.title}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/20 blur-[50px] pointer-events-none" />

              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 mx-auto">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-bold text-white text-center mb-2">Desbloquear Conteúdo</h3>
                <p className="text-zinc-400 text-center mb-8 font-light">
                  Você está prestes a adquirir acesso vitalício a esta masterclass. O valor vai diretamente para o criador.
                </p>

                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-8">
                  <div className="flex gap-4">
                    <img src={selectedVideo.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg" />
                    <div>
                      <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">{selectedVideo.title}</h4>
                      <p className="text-zinc-500 text-xs font-mono">Por {selectedVideo.author.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <span className="text-zinc-400 text-sm uppercase tracking-widest font-mono">Total a pagar</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      R$ {Number(selectedVideo.price || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <ShoppingCart className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Confirmar Pagamento Seguro
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 font-mono uppercase tracking-widest">
                    <Lock className="w-3 h-3" /> Pagamento processado via Escrow AJUDAÍ+
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/20 blur-[50px] pointer-events-none" />

              <button 
                onClick={() => {
                  setShowPublishModal(false);
                  setSelectedFile(null);
                }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 mx-auto">
                  <Video className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-bold text-white text-center mb-2">Publicar Conteúdo</h3>
                <p className="text-zinc-400 text-center mb-8 font-light">
                  Compartilhe seu conhecimento e monetize suas aulas, tutoriais ou masterclasses.
                </p>

                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedFile) return;
                  
                  setIsProcessing(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const token = session?.access_token;
                    
                    if (!token) {
                      alert('Você precisa estar logado para publicar vídeos.');
                      setIsProcessing(false);
                      return;
                    }

                    const formData = new FormData();
                    formData.append('video', selectedFile);
                    formData.append('title', newTitle);
                    formData.append('description', newDescription);
                    formData.append('category', newCategory);

                    const response = await fetch('/api/videos/upload', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData
                    });

                    if (response.ok) {
                      const newVideo = await response.json();
                      setVideos([newVideo, ...videos]);
                      setShowPublishModal(false);
                      setSelectedFile(null);
                      setNewTitle('');
                      setNewDescription('');
                      setNewCategory('negocios');
                      alert('Conteúdo publicado com sucesso! Ele já está disponível no AJUDAÍ Play.');
                    } else {
                      const errorData = await response.json();
                      alert(`Erro ao publicar: ${errorData.error}`);
                    }
                  } catch (error) {
                    console.error('Error uploading video:', error);
                    alert('Erro ao publicar o vídeo. Tente novamente.');
                  } finally {
                    setIsProcessing(false);
                  }
                }}>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Título do Vídeo</label>
                    <input 
                      type="text" 
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: Masterclass de Vendas..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Descrição</label>
                    <textarea 
                      required
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      placeholder="Descreva o que os alunos vão aprender..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Arquivo de Vídeo</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="video/mp4,video/webm,video/ogg"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
                            if (!validTypes.includes(file.type)) {
                              alert('Formato inválido. Envie um vídeo MP4, WebM ou OGG.');
                              e.target.value = '';
                              setSelectedFile(null);
                              return;
                            }
                            setSelectedFile(file);
                          } else {
                            setSelectedFile(null);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full bg-black/40 border border-dashed rounded-xl px-4 py-6 text-center transition-colors flex flex-col items-center gap-2 ${selectedFile ? 'border-emerald-500/50' : 'border-white/20 hover:border-emerald-500/50'}`}>
                        <Upload className={`w-6 h-6 ${selectedFile ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span className={`text-sm ${selectedFile ? 'text-emerald-400 font-medium' : 'text-zinc-400'}`}>
                          {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste o vídeo do seu celular/computador'}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Formatos: MP4, WebM, OGG. Sem limite de tamanho.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Categoria</label>
                    <select 
                      required 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      <option value="negocios">Negócios</option>
                      <option value="tecnologia">Tecnologia</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Video className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Publicar Conteúdo
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shorts Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-6 left-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-md h-[100dvh] sm:h-[90vh] sm:rounded-[2rem] overflow-hidden bg-zinc-900 shadow-2xl">
              {/* Video Element */}
              <div className="absolute inset-0 bg-black">
                <video 
                  src={playingVideo.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  poster={playingVideo.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Gradient Overlay for Text */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20 pointer-events-none">
                <button 
                  onClick={() => setLiked(!liked)}
                  className="flex flex-col items-center gap-1 group pointer-events-auto"
                >
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs font-medium">{liked ? '1.2k' : '1.1k'}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">342</span>
                </button>

                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">Share</span>
                </button>

                <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <MoreVertical className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-16 p-6 z-20 pointer-events-none">
                <div className="flex items-center gap-3 mb-4 pointer-events-auto">
                  <img src={playingVideo.author.avatar} alt={playingVideo.author.name} className="w-10 h-10 rounded-full border-2 border-white" />
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-1 text-shadow-sm">
                      {playingVideo.author.name}
                      {playingVideo.author.verified && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </h3>
                    <p className="text-white/80 text-xs">{playingVideo.author.role}</p>
                  </div>
                  <Button size="sm" className="ml-2 bg-white text-black hover:bg-zinc-200 rounded-full h-8 px-4 text-xs font-bold pointer-events-auto">
                    Seguir
                  </Button>
                </div>
                
                <h2 className="text-white font-bold text-lg mb-2 leading-tight text-shadow-sm">
                  {playingVideo.title}
                </h2>
                <p className="text-white/90 text-sm line-clamp-2 text-shadow-sm">
                  {playingVideo.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
