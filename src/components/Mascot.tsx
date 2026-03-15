import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, HeartHandshake, Bot, Zap, Trash2, Volume2, VolumeX, Pin, ExternalLink, Mic, MicOff, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

const messages = [
  "Olá! Eu sou o Ajudinha, seu guia no ecossistema AJUDAÍ+! 👋",
  "Sabia que o AJUDAÍ Labs está em desenvolvimento? Teremos IA avançada para te ajudar! 🤖",
  "O AJUDAÍ Academy está quase pronto! Prepare-se para aprender e monetizar. 📚",
  "Precisamos de mais corações no AJUDAÍ Social. Quer fazer a diferença? ❤️",
  "Nossa arquitetura é modular e escalável. Já viu os docs técnicos? 🏗️",
  "Estamos em fase Beta! Se encontrar algo estranho, me avise. 🛠️",
  "O Marketplace é o lugar perfeito para encontrar talentos da nossa comunidade! 🛒",
  "Sua reputação no AJUDAÍ+ abre portas para módulos exclusivos. Continue ajudando! 🌟",
  "Agora você pode conectar seu negócio online ao AJUDAÍ+ na página de Integrações! 🤝",
  "Aceitamos PIX com QR Code real agora! Mais facilidade para apoiar a comunidade. ⚡"
];

export const Mascot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isFloatingEnabled, setIsFloatingEnabled] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [pipWindow, setPipWindow] = useState<any>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const recognitionRef = React.useRef<any>(null);

  const checkSettings = useCallback(() => {
    const dismissed = localStorage.getItem('ajudinha_dismissed') === 'true';
    const voice = localStorage.getItem('ajudinha_voice_enabled') === 'true';
    const floating = localStorage.getItem('ajudinha_floating_enabled') === 'true';
    setIsDismissed(dismissed);
    setIsVoiceEnabled(voice);
    setIsFloatingEnabled(floating);
    if (!dismissed) setIsVisible(true);
  }, []);

  useEffect(() => {
    checkSettings();
    window.addEventListener('storage', checkSettings);
    return () => window.removeEventListener('storage', checkSettings);
  }, [checkSettings]);

  const speak = useCallback(async (text: string) => {
    if (!isVoiceEnabled || isDismissed) return;

    try {
      setIsSpeaking(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga com uma voz amigável e robótica: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error in Mascot TTS:', error);
      setIsSpeaking(false);
    }
  }, [isVoiceEnabled, isDismissed]);

  useEffect(() => {
    if (isVisible && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isVisible, isDismissed]);

  useEffect(() => {
    if (isVisible && !isDismissed && isVoiceEnabled && isChatOpen) {
      speak(messages[currentMessage]);
    }
  }, [currentMessage, isVisible, isDismissed, isVoiceEnabled, isChatOpen, speak]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('ajudinha_dismissed', 'true');
    window.dispatchEvent(new Event('storage'));
    if (pipWindow) pipWindow.close();
  };

  const toggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !isVoiceEnabled;
    setIsVoiceEnabled(newValue);
    if (newValue) {
      localStorage.setItem('ajudinha_voice_enabled', 'true');
    } else {
      localStorage.removeItem('ajudinha_voice_enabled');
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleVoiceCommand = useCallback(async (transcript: string) => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `O usuário disse: "${transcript}". Como o Ajudinha (o mascote do ecossistema AJUDAÍ+), responda de forma curta, amigável e prestativa. 
        Você é o guia definitivo do AJUDAÍ+. Você tem conhecimento sobre:
        - Integrações: Agora qualquer negócio online pode se conectar ao AJUDAÍ+ via página de Integrações.
        - Pagamentos: Aceitamos Cartão, Boleto e PIX (com QR Code real) via Mercado Pago.
        - Módulos: Social (ajuda mútua), Pro (serviços profissionais), Academy (educação), Marketplace (comércio), Labs (inovação/IA) e Timeline (notícias).
        Se o usuário perguntar sobre como conectar o negócio dele, diga que ele pode ir na página de Integrações e preencher o formulário de validação.
        Se perguntar sobre pagamentos, confirme que usamos Mercado Pago com total segurança.`,
      });

      const reply = response.text || "Desculpe, não entendi. Pode repetir?";
      // Update the current message to show the reply
      messages.push(reply);
      setCurrentMessage(messages.length - 1);
      
      if (isVoiceEnabled) {
        await speak(reply);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    } finally {
      setIsThinking(false);
    }
  }, [isVoiceEnabled, speak]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle listening clicked, current state:', isListening);
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome ou Edge.');
      return;
    }

    try {
      // Request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error('Microphone permission denied:', err);
      alert('Permissão de microfone negada. Por favor, ative o microfone nas configurações do seu navegador.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      alert('Não foi possível iniciar o microfone. Verifique as permissões do seu navegador.');
    }
  };

  const enterFloatingMode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Desktop Chrome 116+ (Document Picture-in-Picture)
    if ('documentPictureInPicture' in window) {
      try {
        // @ts-ignore
        const pip = await window.documentPictureInPicture.requestWindow({
          width: 300,
          height: 400,
        });

        // Copy stylesheets to the new window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            if (styleSheet.href) {
              link.rel = 'stylesheet';
              link.href = styleSheet.href;
              pip.document.head.appendChild(link);
            }
          }
        });

        // Create a container in the PiP window
        const pipContainer = pip.document.createElement('div');
        pipContainer.id = 'pip-mascot-root';
        pip.document.body.appendChild(pipContainer);
        pip.document.body.style.margin = '0';
        pip.document.body.style.overflow = 'hidden';
        pip.document.body.style.backgroundColor = '#09090b';

        const renderPipContent = () => {
          pipContainer.innerHTML = `
            <div style="padding: 20px; color: white; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: linear-gradient(to bottom, #1e1b4b, #09090b);">
              <div style="width: 80px; height: 80px; background: linear-gradient(to bottom right, #4f46e5, #7e22ce); border-radius: 20px; display: flex; items-center: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white; margin-top: 20px;"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
              <h2 style="font-size: 14px; font-weight: bold; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Ajudinha Flutuante</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #d4d4d8;">${messages[currentMessage]}</p>
              <div style="margin-top: 20px; font-size: 10px; color: #71717a;">Status: Ativo em Segundo Plano</div>
            </div>
          `;
        };

        renderPipContent();
        const updateInterval = setInterval(renderPipContent, 1000);
        pip.addEventListener('pagehide', () => {
          clearInterval(updateInterval);
          setPipWindow(null);
        });
        setPipWindow(pip);
        return;
      } catch (err) {
        console.error('Failed to enter PiP:', err);
      }
    }

    // Mobile Fallback (Video Picture-in-Picture)
    if (canvasRef.current && videoRef.current) {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawFrame = () => {
          // Background
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#1e1b4b');
          gradient.addColorStop(1, '#09090b');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Mascot Icon (Simplified)
          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - 40, 40, 80, 80, 20);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🤖', canvas.width / 2, 90);

          // Title
          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('AJUDINHA', canvas.width / 2, 160);

          // Message
          ctx.fillStyle = '#d4d4d8';
          ctx.font = '16px sans-serif';
          const words = messages[currentMessage].split(' ');
          let line = '';
          let y = 200;
          const maxWidth = canvas.width - 60;
          const lineHeight = 24;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, canvas.width / 2, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, canvas.width / 2, y);
        };

        drawFrame();
        const stream = canvas.captureStream(1); // 1 FPS is enough
        video.srcObject = stream;
        await video.play();
        // @ts-ignore
        await video.requestPictureInPicture();
        
        const interval = setInterval(drawFrame, 1000);
        video.addEventListener('leavepictureinpicture', () => {
          clearInterval(interval);
          video.srcObject = null;
        });
      } catch (err) {
        console.error('Mobile PiP Error:', err);
        alert('Não foi possível ativar o modo flutuante no seu celular. Verifique se o seu navegador suporta Picture-in-Picture.');
      }
    } else {
      alert('Seu navegador não suporta o Modo Flutuante (PiP).');
    }
  };

  const handleDrag = (_: any, info: any) => {
    const threshold = window.innerHeight - 120;
    const centerX = window.innerWidth / 2;
    const isNearBottom = info.point.y > threshold;
    const isNearCenter = Math.abs(info.point.x - centerX) < 100;
    setIsOverTrash(isNearBottom && isNearCenter);
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const threshold = window.innerHeight - 120;
    const centerX = window.innerWidth / 2;
    const isNearBottom = info.point.y > threshold;
    const isNearCenter = Math.abs(info.point.x - centerX) < 100;
    
    if (isNearBottom && isNearCenter) {
      handleDismiss();
    }
    setIsOverTrash(false);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Trash Bin Zone */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <motion.div
              animate={{ 
                scale: isOverTrash ? 1.5 : 1,
                backgroundColor: isOverTrash ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isOverTrash ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'
              }}
              className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-200"
            >
              <Trash2 className={`h-8 w-8 transition-colors duration-200 ${isOverTrash ? 'text-red-500' : 'text-zinc-500'}`} />
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${isOverTrash ? 'text-red-500' : 'text-zinc-500'}`}>
              {isOverTrash ? 'Solte para remover' : 'Arraste aqui para remover'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        initial={{ x: window.innerWidth - 100, y: window.innerHeight - 200, opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-end z-[100]"
        style={{ touchAction: 'none' }}
        role="complementary"
        aria-label="Assistente Ajudinha"
      >
        <AnimatePresence>
          {isChatOpen && !isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mb-4 w-72 glass-panel p-4 rounded-3xl border-indigo-500/30 shadow-2xl relative z-[110]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Ajudinha Bot</span>
                </div>
                <div className="flex items-center gap-1">
                  {isFloatingEnabled && (
                    <button
                      onClick={enterFloatingMode}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                      title="Modo Flutuante (Overlay)"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleVoice}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`p-1.5 rounded-lg transition-colors ${isVoiceEnabled ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-white'}`}
                    title={isVoiceEnabled ? "Desativar Voz" : "Ativar Voz"}
                  >
                    {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={toggleListening}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`p-2 rounded-xl transition-all duration-300 relative ${
                      isListening 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'text-zinc-500 hover:text-white bg-white/5 border border-white/10'
                    }`}
                    title={isListening ? "Parar de Ouvir" : "Falar com Ajudinha"}
                  >
                    <div className="flex items-center gap-1.5">
                      {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isListening ? 'bg-emerald-400' : 'bg-zinc-800'}`}></div>
                        {isListening && (
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                        )}
                      </div>
                    </div>
                    {isListening && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        ATIVO
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-zinc-300 leading-relaxed" aria-live="polite">
                {messages[currentMessage]}
              </p>

              {!isListening && !isThinking && !isSpeaking && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-indigo-400/60 italic">
                    Dica: Clique no microfone para falar comigo!
                  </p>
                  {/Android|iPhone|iPad/i.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches && (
                    <p className="text-[9px] text-emerald-400/60 italic">
                      📱 Adicione à tela de início para sincronizar com seu celular!
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  {isThinking ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Pensando...</>
                  ) : isListening ? (
                    <><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ouvindo...</>
                  ) : isSpeaking ? (
                    'Falando...'
                  ) : (
                    'Status: Online'
                  )}
                </span>
                <div className="flex gap-1">
                  <div className={`w-1 h-1 rounded-full bg-emerald-500 ${isSpeaking || isListening ? 'animate-bounce' : 'animate-pulse'}`}></div>
                  <div className={`w-1 h-1 rounded-full bg-emerald-500 ${isSpeaking || isListening ? 'animate-bounce delay-75' : 'animate-pulse delay-75'}`}></div>
                  <div className={`w-1 h-1 rounded-full bg-emerald-500 ${isSpeaking || isListening ? 'animate-bounce delay-150' : 'animate-pulse delay-150'}`}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group z-[100]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
            onClick={() => !isDragging && setIsChatOpen(!isChatOpen)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsChatOpen(!isChatOpen)}
          >
            {/* Notification Badge */}
            {!isChatOpen && !isDragging && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-zinc-950 z-10"
              />
            )}

            {/* Mascot Body */}
            <motion.div 
              animate={{
                scale: isOverTrash ? 0.5 : 1,
                opacity: isOverTrash ? 0.5 : 1,
                boxShadow: isListening 
                  ? '0 0 30px rgba(16, 185, 129, 0.6)' 
                  : isSpeaking 
                    ? '0 0 20px rgba(79, 70, 229, 0.6)' 
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br transition-colors duration-500 ${
                isListening 
                  ? 'from-emerald-600 to-teal-700' 
                  : 'from-indigo-600 to-purple-700'
              } flex items-center justify-center shadow-lg border border-white/10 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]"></div>
              
              <motion.div
                animate={{ 
                  y: isSpeaking ? [0, -6, 0] : [0, -4, 0],
                  rotate: isSpeaking ? [0, 10, -10, 0] : [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: isSpeaking ? 0.5 : 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Bot className="h-8 w-8 text-white" />
              </motion.div>

              {/* Glowing Eyes Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className={`absolute top-[40%] left-[35%] w-1 h-1 ${isListening ? 'bg-white' : 'bg-cyan-400'} rounded-full blur-[1px] ${isSpeaking || isListening ? 'animate-ping' : 'animate-pulse'}`}></div>
                <div className={`absolute top-[40%] right-[35%] w-1 h-1 ${isListening ? 'bg-white' : 'bg-cyan-400'} rounded-full blur-[1px] ${isSpeaking || isListening ? 'animate-ping' : 'animate-pulse'}`}></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hover Label */}
          {!isDragging && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {isChatOpen ? 'Arraste para mover' : isListening ? 'Ouvindo você...' : 'Clique ou Fale para conversar'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Hidden elements for Mobile PiP fallback */}
      <canvas ref={canvasRef} width={400} height={400} className="hidden" />
      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
};
