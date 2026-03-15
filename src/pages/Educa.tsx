import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, GraduationCap, Info, Rocket } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Educa = () => {
  const educaUrl = "https://educa-cyan-one.vercel.app/";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gradient flex items-center gap-3"
          >
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            Educa AJUDAÍ+
          </motion.h1>
          <p className="text-zinc-400 mt-2">Acesse nossa plataforma educacional integrada.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <a href={educaUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Abrir em nova aba
            </Button>
          </a>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] min-h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="flex flex-col items-center gap-4 text-zinc-500">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p>Carregando plataforma Educa...</p>
          </div>
        </div>
        <iframe 
          src={educaUrl} 
          className="w-full h-full border-none"
          title="Educa AJUDAÍ+"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Cursos Exclusivos</h3>
          <p className="text-sm text-zinc-400">Acesse conteúdos preparados especialmente para a comunidade AJUDAÍ+.</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Aceleração</h3>
          <p className="text-sm text-zinc-400">Aprenda a escalar seus projetos e aumentar seu impacto na plataforma.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Info className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Suporte Integrado</h3>
          <p className="text-sm text-zinc-400">Dúvidas sobre o conteúdo? Nossa equipe está pronta para ajudar.</p>
        </div>
      </div>
    </div>
  );
};

export default Educa;
