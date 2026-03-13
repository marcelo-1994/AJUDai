import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, Gamepad2, GraduationCap, Music, 
  Tv, Radio, BookOpen, Coffee, ChevronRight,
  Star, Clock, TrendingUp
} from 'lucide-react';
import { NetflixRow } from '../components/NetflixRow';

const EntertainmentHub = () => {
  const categories = [
    {
      title: 'AJUDAÍ Play',
      description: 'Streaming de conhecimento e masterclasses.',
      icon: <PlayCircle className="h-8 w-8 text-rose-400" />,
      to: '/play',
      color: 'rose'
    },
    {
      title: 'Pausa Estratégica',
      description: 'Games clássicos e relaxamento com IA.',
      icon: <Gamepad2 className="h-8 w-8 text-amber-400" />,
      to: '/strategic-pause',
      color: 'amber'
    },
    {
      title: 'AJUDAÍ Educa',
      description: 'Cursos, trilhas e certificações.',
      icon: <GraduationCap className="h-8 w-8 text-emerald-400" />,
      to: '/educa',
      color: 'emerald'
    }
  ];

  const trendingVideos = [
    {
      title: 'O Futuro da IA',
      description: 'Como a IA está mudando o mercado de trabalho.',
      icon: <PlayCircle className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-rose-600 to-rose-900',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
      badge: 'POPULAR'
    },
    {
      title: 'Design Minimalista',
      description: 'Princípios de design para interfaces modernas.',
      icon: <PlayCircle className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-indigo-600 to-indigo-900',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
      badge: 'NOVO'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=2850" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30">
              <Tv className="h-5 w-5 text-rose-400" />
            </div>
            <span className="text-rose-400 font-bold tracking-widest uppercase text-xs">Hub de Entretenimento</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Relaxe & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Aprenda</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Um espaço dedicado para você recarregar as energias, aprender novas habilidades e se divertir entre um projeto e outro.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-10 relative z-10">
        {/* Categories Grid - The "Folder" structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={cat.to}
              className="group glass-panel p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {cat.icon}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>

        {/* Content Rows */}
        <div className="space-y-16">
          <NetflixRow title="Em Alta no Play" items={trendingVideos} />
          
          {/* Quick Access Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <Music className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Lofi & Foco</h3>
              </div>
              <p className="text-zinc-400 mb-6">Playlists selecionadas para manter seu ritmo de trabalho constante e produtivo.</p>
              <button className="text-indigo-400 font-bold flex items-center gap-2 hover:text-indigo-300 transition-colors">
                Ouvir Agora <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Biblioteca</h3>
              </div>
              <p className="text-zinc-400 mb-6">E-books, guias e documentações para aprofundar seu conhecimento técnico.</p>
              <button className="text-emerald-400 font-bold flex items-center gap-2 hover:text-emerald-300 transition-colors">
                Explorar Livros <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntertainmentHub;
