import React, { useState } from 'react';
import { Facebook, MessageCircle, Copy, Check, Share2 } from 'lucide-react';
import { Button } from './ui/Button';

export const InviteFriends = () => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;
  
  const salesMessage = `Fala pessoal! 👋 Sabe aquele problema em casa que você não sabe como resolver? Ou aquele talento que você tem e poderia estar rendendo uma grana extra? 🤑\n\nConheçam o AJUDAÍ! É a plataforma definitiva para conectar quem precisa de ajuda com quem sabe fazer. Rápido, prático e seguro.\n\nEu já estou usando e recomendo demais! Clica no link e vem fazer parte dessa revolução: ${appUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(salesMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(salesMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(salesMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mt-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <Share2 className="h-7 w-7 text-blue-300" />
            Conecte-se com seus amigos!
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Seja um embaixador do AJUDAÍ! Compartilhe com seus amigos no Facebook e WhatsApp e ajude nossa comunidade a crescer. Preparamos uma mensagem especial para você enviar:
          </p>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-4 relative group shadow-inner">
            <p className="text-sm text-blue-50 whitespace-pre-wrap leading-relaxed">"{salesMessage}"</p>
            <button 
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 hover:scale-105"
              title="Copiar mensagem"
            >
              {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto min-w-[240px]">
          <Button 
            onClick={shareOnFacebook}
            className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white flex items-center justify-center gap-2 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none"
          >
            <Facebook className="h-6 w-6" />
            Postar no Facebook
          </Button>
          
          <Button 
            onClick={shareOnWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white flex items-center justify-center gap-2 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none"
          >
            <MessageCircle className="h-6 w-6" />
            Enviar no WhatsApp
          </Button>
          
          <Button 
            onClick={handleCopy}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 flex items-center justify-center gap-2 py-6 text-lg transition-all"
          >
            {copied ? <Check className="h-6 w-6 text-green-400" /> : <Copy className="h-6 w-6" />}
            {copied ? 'Mensagem Copiada!' : 'Copiar Texto'}
          </Button>
        </div>
      </div>
    </div>
  );
};
