import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Rocket } from 'lucide-react';
import { Button } from './ui/Button';

export const BetaNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the notice
    const hasDismissed = localStorage.getItem('novapublica_beta_notice_dismissed');
    if (!hasDismissed) {
      // Small delay to show the modal after the app loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('novapublica_beta_notice_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-indigo-500/30 rounded-3xl p-8 w-full max-w-lg relative shadow-[0_0_50px_rgba(79,70,229,0.15)]">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
            <Rocket className="h-8 w-8 text-indigo-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao AJUDAÍ!</h2>
          
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Em fase de desenvolvimento
          </div>
          
          <p className="text-zinc-300 mb-6 leading-relaxed">
            Nossa plataforma está atualmente em <strong>fase de testes e desenvolvimento contínuo</strong>. 
            Você já pode explorar as funcionalidades, mas pode encontrar instabilidades ou recursos em construção.
          </p>
          
          <div className="bg-black/30 rounded-xl p-4 mb-8 text-sm text-zinc-400 text-left w-full border border-white/5">
            <ul className="space-y-2 list-disc list-inside">
              <li>Novas funcionalidades sendo adicionadas diariamente</li>
              <li>O design e os recursos podem sofrer alterações</li>
              <li>Seu feedback é fundamental para nossa evolução</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleDismiss}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
          >
            Entendi, quero explorar!
          </Button>
        </div>
      </div>
    </div>
  );
};
