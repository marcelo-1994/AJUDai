import React, { useState, useEffect } from 'react';
import { Sparkles, X, Code2, ArrowRight, Mail, MessageCircle } from 'lucide-react';

export const CreatorButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const isHidden = localStorage.getItem('hideCreatorButton') === 'true';
      setIsVisible(!isHidden);
    };

    // Initial check with delay
    const isHidden = localStorage.getItem('hideCreatorButton') === 'true';
    if (!isHidden) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      
      // Listen for changes from settings
      window.addEventListener('storage', checkVisibility);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('storage', checkVisibility);
      };
    } else {
      window.addEventListener('storage', checkVisibility);
      return () => window.removeEventListener('storage', checkVisibility);
    }
  }, []);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('hideCreatorButton', 'true');
    window.dispatchEvent(new Event('storage'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {isExpanded && (
        <div className="mb-4 p-5 bg-zinc-900 border border-indigo-500/30 rounded-2xl shadow-2xl max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Code2 className="h-5 w-5" />
              <span>CRIADOR</span>
            </div>
            <button 
              onClick={handleHide}
              className="text-zinc-500 hover:text-white transition-colors p-1"
              title="Desativar este botão"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 leading-tight">
            CRIE SEU PRÓPRIO SISTEMA COM UMA IA INTEGRADA.
          </h3>
          
          <p className="text-sm text-zinc-400 mb-4">
            Transforme sua ideia em realidade. Desenvolvemos plataformas sob medida com o poder da inteligência artificial.
          </p>
          
          <div className="flex flex-col gap-2">
            <a 
              href="https://wa.me/5594991233751?text=Ol%C3%A1!%20Tenho%20interesse%20em%20criar%20meu%20pr%C3%B3prio%20sistema%20com%20IA." 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
            
            <a 
              href="mailto:marcelodasilvareia30@gmail.com?subject=Interesse%20em%20criar%20sistema%20com%20IA" 
              className="flex items-center justify-center w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all border border-zinc-700"
            >
              <Mail className="h-5 w-5" /> E-mail
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group flex items-center gap-2 rounded-full p-1 pr-4 shadow-xl transition-all duration-300 border ${
          isExpanded 
            ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]'
        }`}
      >
        <div className={`p-2 rounded-full ${isExpanded ? 'bg-zinc-700' : 'bg-white/20'}`}>
          {isExpanded ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <span className="font-bold tracking-wide text-sm">
          {isExpanded ? 'FECHAR' : 'CRIADOR'}
        </span>
      </button>
    </div>
  );
};
