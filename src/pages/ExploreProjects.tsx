import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Sparkles, Box, Globe, Shield, Zap, ChevronRight, Lock, ExternalLink, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

import { Permission } from '../lib/permissions';

interface Project {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'experimental' | 'partner';
  category: string;
  isPremium: boolean;
  requiredPermission?: Permission;
  url?: string;
}

const HeartHandshake = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.96 0" />
    <path d="m12 5 2.96 2.96c.82.82.82 2.13 0 2.96v0a2.17 2.17 0 0 1-3.08 0" />
    <path d="m7 13 2 2 2-2" />
    <path d="m17 13-2 2-2-2" />
  </svg>
);

const projects: Project[] = [
  {
    id: 'ajudai-pro',
    name: 'AJUDAÍ Pro',
    description: 'Ferramentas avançadas para profissionais de elite. Gestão de clientes e CRM integrado.',
    icon: <Shield className="h-6 w-6 text-indigo-400" />,
    status: 'active',
    category: 'Profissional',
    isPremium: true,
    requiredPermission: 'access_pro_modules'
  },
  {
    id: 'ajudai-edu',
    name: 'AJUDAÍ Academy',
    description: 'Plataforma de cursos e mentorias para quem quer aprender a ajudar e monetizar habilidades.',
    icon: <Globe className="h-6 w-6 text-emerald-400" />,
    status: 'beta',
    category: 'Educação',
    isPremium: false,
    requiredPermission: 'access_academy'
  },
  {
    id: 'ajudai-labs',
    name: 'AJUDAÍ Labs',
    description: 'Ferramentas experimentais de IA para automação de tarefas e suporte inteligente.',
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    status: 'experimental',
    category: 'Tecnologia',
    isPremium: true,
    requiredPermission: 'access_labs'
  },
  {
    id: 'ajudai-social',
    name: 'AJUDAÍ Social',
    description: 'Módulo focado em ONGs e projetos sem fins lucrativos. Conectando voluntários a causas.',
    icon: <HeartHandshake className="h-6 w-6 text-pink-400" />,
    status: 'partner',
    category: 'Social',
    isPremium: false
  }
];

export const ExploreProjects = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'beta' | 'partner'>('all');

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6"
        >
          <Rocket className="h-4 w-4" /> Ecossistema AJUDAÍ+
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight">
          Explorar Novos <span className="text-gradient">Projetos</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          O AJUDAÍ+ é um HUB modular. Descubra novas ferramentas, projetos experimentais e parceiros integrados ao nosso ecossistema.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {(['all', 'active', 'beta', 'partner'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              filter === f 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
            }`}
          >
            {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 dark:border-white/10 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                project.status === 'beta' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                project.status === 'partner' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {project.status}
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              {project.icon}
            </div>

            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              {project.name}
              {project.isPremium && <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />}
            </h3>
            
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex-1 leading-relaxed">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <span>Categoria</span>
                <span className="text-zinc-900 dark:text-zinc-300">{project.category}</span>
              </div>
              
              <Button 
                className={`w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  project.status === 'active' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {project.status === 'active' ? (
                  <>Acessar Módulo <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>Saber Mais <Info className="h-4 w-4" /></>
                )}
              </Button>
            </div>

            {/* Premium Lock Overlay */}
            {project.requiredPermission && !profile?.permissions.includes(project.requiredPermission) && (
              <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                  <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Módulo Premium</h4>
                <p className="text-zinc-200 text-sm mb-4">Disponível apenas para assinantes AJUDAÍ+ Pro.</p>
                <Button className="bg-white text-black hover:bg-zinc-200 text-xs font-bold px-4 h-10 rounded-xl">
                  Fazer Upgrade
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Strategic Vision Section */}
      <section className="mt-32 pt-16 border-t border-zinc-200 dark:border-white/5">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-8 leading-tight">
              A Visão do <br />
              <span className="text-gradient">Ecossistema AJUDAÍ+</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Box className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Arquitetura Modular</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">Cada projeto é uma extensão independente que compartilha o mesmo núcleo de autenticação e dados.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Single Sign-On (SSO)</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">Uma única conta para todos os subprodutos. Experiência fluida e sem atritos para o usuário.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Monetização Unificada</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">Assinaturas que desbloqueiam múltiplos módulos ou compras avulsas por projeto.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel p-8 rounded-[3rem] border-indigo-500/30 bg-indigo-500/5 relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">A+</div>
                <div>
                  <h4 className="text-white font-bold">AJUDAÍ+ HUB</h4>
                  <p className="text-zinc-400 text-xs">Core Engine v2.0</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">Auth Service</span>
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Online</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">Billing Gateway</span>
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Online</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">Module Registry</span>
                  <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Active</span>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-zinc-500 font-bold">PRO</div>
                <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-zinc-500 font-bold">EDU</div>
                <div className="h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-zinc-500 font-bold">LABS</div>
              </div>
            </div>
            {/* Decorative Blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -z-0"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
