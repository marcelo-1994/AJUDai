import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Github, ArrowRight, Sparkles, Users, Rocket, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const Landing = () => {
  const videos = [
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://picsum.photos/seed/presentation1/1920/1080" },
    { src: "https://www.w3schools.com/html/movie.mp4", poster: "https://picsum.photos/seed/presentation2/1920/1080" },
    { src: "https://www.w3schools.com/html/forrest_gump.mp4", poster: "https://picsum.photos/seed/presentation3/1920/1080" }
  ];

  const [selectedVideo] = React.useState(() => videos[Math.floor(Math.random() * videos.length)]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-white transition-colors duration-300 overflow-hidden relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 dark:bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4" />
          <span>Chamado para Idealistas & Fundadores</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-zinc-900 dark:text-white"
        >
          O Futuro da <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400">
            Ajuda Mútua
          </span>
        </motion.h1>

        {/* Manifesto Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-12"
        >
          <p className="mb-6">
            O <span className="text-zinc-900 dark:text-white font-semibold">AJUDAÍ</span> nasceu de um sonho: criar uma rede onde ninguém precise enfrentar seus desafios sozinho. Não estamos apenas construindo um aplicativo, estamos forjando um novo contrato social baseado na colaboração e na confiança.
          </p>
          <p>
            Buscamos <span className="text-indigo-600 dark:text-indigo-300 font-medium">fundadores, visionários e mentes inquietas</span> que acreditam que a tecnologia deve servir à humanidade, e não o contrário. Se você é um idealista que quer deixar um legado, este é o seu lugar.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap w-full max-w-4xl"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-lg h-14 px-10 rounded-2xl group border-none">
              Entrar no App
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <a 
            href="https://ajuda-2026.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-lg h-14 px-10 rounded-2xl">
              <ExternalLink className="mr-2 h-5 w-5" />
              Acessar Projeto
            </Button>
          </a>
          
          <Link to="/explore" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-white text-lg h-14 px-10 rounded-2xl">
              Explorar Plataforma
            </Button>
          </Link>
        </motion.div>

        {/* Presentation Video */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="my-20 w-full max-w-4xl aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
        >
          <video 
            className="w-full h-full object-cover"
            controls
            poster={selectedVideo.poster}
          >
            <source src={selectedVideo.src} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        </motion.div>

        {/* Founder's Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 max-w-3xl"
        >
          <p className="italic text-zinc-400 text-lg leading-relaxed">
            "Este projeto não é sobre código, é sobre pessoas. Estamos em busca de quem não aceita o mundo como ele é, mas como ele pode ser. Se você sente que pode contribuir com sua visão, seu tempo ou seu talento, junte-se a nós nesta jornada."
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-zinc-700"></div>
            <span className="text-zinc-500 text-sm uppercase tracking-widest">Nota do Fundador</span>
            <div className="h-px w-8 bg-zinc-700"></div>
          </div>
        </motion.div>

        {/* Secondary Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left w-full"
        >
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <Users className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comunidade Primeiro</h3>
            <p className="text-zinc-500 text-sm">Construído por pessoas, para pessoas. A governança do AJUDAÍ pertence àqueles que o utilizam.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <Rocket className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Escalabilidade Social</h3>
            <p className="text-zinc-500 text-sm">Nossa tecnologia permite que a ajuda mútua escale de bairros para cidades inteiras.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
            <Heart className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Impacto Real</h3>
            <p className="text-zinc-500 text-sm">Cada linha de código escrita no GitHub tem o potencial de mudar a vida de alguém hoje.</p>
          </div>
        </motion.div>

        {/* Inspiration Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-16 text-center opacity-40"
        >
          <p className="text-xs text-zinc-500 italic">
            Inspirado em plataformas como GetNinjas e outros ecossistemas de serviços e colaboração.
            <br />
            Estrutura de pedidos e serviços focada na economia colaborativa.
          </p>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
};
