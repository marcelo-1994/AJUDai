import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ScanFace, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface FaceIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, token: string) => void;
}

export const FaceIDModal: React.FC<FaceIDModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setStatus('scanning');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Simulate facial recognition logic
      // In a real app, you'd use face-api.js or a backend call here
      setTimeout(() => {
        const savedFaceData = localStorage.getItem('ajudai_face_auth');
        if (savedFaceData) {
          try {
            const { email, token } = JSON.parse(savedFaceData);
            setStatus('success');
            setTimeout(() => {
              onSuccess(email, token);
            }, 1500);
          } catch (e) {
            setStatus('error');
            setErrorMessage('Dados de reconhecimento facial corrompidos.');
          }
        } else {
          setStatus('error');
          setErrorMessage('Nenhum rosto cadastrado neste dispositivo. Faça login com senha primeiro e ative o Face ID.');
        }
      }, 3000);

    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setStatus('error');
      setErrorMessage('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4">
            <ScanFace className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Face ID AJUDAÍ</h2>
          <p className="text-zinc-400 text-sm mt-2">
            {status === 'scanning' && 'Escaneando seu rosto...'}
            {status === 'success' && 'Identidade confirmada!'}
            {status === 'error' && 'Falha no reconhecimento'}
          </p>
        </div>

        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800 border-2 border-white/5 mb-6">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          
          {status === 'scanning' && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '90%' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
            />
          )}

          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 rounded-full p-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  <ShieldCheck className="h-12 w-12 text-white" />
                </motion.div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 rounded-full p-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                >
                  <AlertCircle className="h-12 w-12 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {status === 'error' && (
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
            <Button 
              onClick={startCamera}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {status === 'scanning' && (
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-indigo-500 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
