import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { 
  PlusCircle, Clock, CheckCircle2, Star, AlertCircle, Zap, Rocket, 
  Briefcase, GraduationCap, PlayCircle, Users, Store, Trophy, Share2, Coffee,
  Play, Info, BookOpen, Search, HelpCircle, Gift, Compass, LineChart, ChevronRight
} from 'lucide-react';
import PedidosList from '../components/PedidosList';
import { Tutorial } from '../components/Tutorial';
import { NetflixRow } from '../components/NetflixRow';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [stats, setStats] = useState({
    openRequests: 0,
    completedRequests: 0,
    responses: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    
    const status = searchParams.get('mp_status');
    if (status) {
      setPaymentStatus(status);
      searchParams.delete('mp_status');
      setSearchParams(searchParams);
    }
  }, [user, searchParams, setSearchParams]);

  const fetchStats = async () => {
    if (!user) return;
    
    const { count: openCount } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'open');

    const { count: completedCount } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const { count: responseCount } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('responder_id', user.id);

    setStats({
      openRequests: openCount || 0,
      completedRequests: completedCount || 0,
      responses: responseCount || 0,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const ecosystemItems = [
    {
      title: 'Pedidos Oficiais',
      description: 'Solicite ou preste serviços de forma segura.',
      icon: <Briefcase className="h-6 w-6 text-white" />,
      to: '/pedidos',
      bgGradient: 'bg-gradient-to-br from-indigo-600 to-blue-800',
      badge: 'NOVO',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'AJUDAÍ Educa',
      description: 'Cursos e certificações para profissionais.',
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-emerald-600 to-teal-800',
      badge: 'PRO',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'AJUDAÍ Play',
      description: 'Conteúdos em vídeo, tutoriais e masterclasses.',
      icon: <PlayCircle className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-rose-600 to-pink-800',
      badge: 'BETA',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Comunidade',
      description: 'Conecte-se com outros profissionais e clientes.',
      icon: <Users className="h-6 w-6 text-white" />,
      to: '/community',
      bgGradient: 'bg-gradient-to-br from-purple-600 to-fuchsia-800',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Explorar HUB',
      description: 'Descubra novos projetos e ferramentas experimentais.',
      icon: <Rocket className="h-6 w-6 text-white" />,
      to: '/explore-projects',
      bgGradient: 'bg-gradient-to-br from-slate-700 to-zinc-900',
      badge: 'LABS',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const professionalItems = [
    {
      title: 'Marketplace',
      description: 'Venda seus templates, scripts e ferramentas.',
      icon: <Store className="h-6 w-6 text-white" />,
      to: '/marketplace',
      bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-700',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Ranking',
      description: 'Acompanhe sua posição e ganhe recompensas.',
      icon: <Trophy className="h-6 w-6 text-white" />,
      to: '/ranking',
      bgGradient: 'bg-gradient-to-br from-yellow-500 to-amber-700',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Afiliados',
      description: 'Indique a plataforma e ganhe comissões.',
      icon: <Share2 className="h-6 w-6 text-white" />,
      to: '/affiliates',
      bgGradient: 'bg-gradient-to-br from-cyan-600 to-blue-800',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Pausa Estratégica',
      description: 'Recursos para bem-estar e produtividade.',
      icon: <Coffee className="h-6 w-6 text-white" />,
      to: '/strategic-pause',
      bgGradient: 'bg-gradient-to-br from-stone-600 to-neutral-800',
      image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const discoveryItems = [
    {
      title: 'Busca Global',
      description: 'Encontre profissionais, pedidos e conteúdos.',
      icon: <Search className="h-6 w-6 text-white" />,
      to: '/search',
      bgGradient: 'bg-gradient-to-br from-blue-600 to-indigo-800',
      image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Mural de Pedidos',
      description: 'Veja todas as solicitações da comunidade.',
      icon: <Compass className="h-6 w-6 text-white" />,
      to: '/requests',
      bgGradient: 'bg-gradient-to-br from-teal-500 to-emerald-700',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Timeline',
      description: 'Acompanhe as últimas atualizações.',
      icon: <Clock className="h-6 w-6 text-white" />,
      to: '/timeline',
      bgGradient: 'bg-gradient-to-br from-violet-600 to-purple-800',
      image: 'https://images.unsplash.com/photo-1508004680771-708b02aabdc0?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Blog',
      description: 'Artigos, dicas e novidades da plataforma.',
      icon: <BookOpen className="h-6 w-6 text-white" />,
      to: '/blog',
      bgGradient: 'bg-gradient-to-br from-rose-500 to-red-700',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const resourcesItems = [
    {
      title: 'Planos e Preços',
      description: 'Conheça os benefícios de ser PRO.',
      icon: <Zap className="h-6 w-6 text-white" />,
      to: '/pricing',
      bgGradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Indique e Ganhe',
      description: 'Convide amigos e ganhe recompensas.',
      icon: <Gift className="h-6 w-6 text-white" />,
      to: '/invite',
      bgGradient: 'bg-gradient-to-br from-emerald-500 to-green-700',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Arquitetura',
      description: 'Documentação técnica da plataforma.',
      icon: <LineChart className="h-6 w-6 text-white" />,
      to: '/architecture',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-zinc-800',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Central de Ajuda',
      description: 'Perguntas frequentes e suporte.',
      icon: <HelpCircle className="h-6 w-6 text-white" />,
      to: '/faq',
      bgGradient: 'bg-gradient-to-br from-cyan-500 to-blue-700',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const continueWatchingItems = [
    {
      title: 'Masterclass: Vendas B2B',
      description: 'Aprenda a fechar contratos de alto valor.',
      icon: <Play className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-red-600 to-red-900',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=600',
      badge: '45m restantes'
    },
    {
      title: 'Curso: IA para Profissionais',
      description: 'Automatize suas tarefas com Inteligência Artificial.',
      icon: <Play className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-blue-600 to-blue-900',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
      badge: 'Aula 3/10'
    },
    {
      title: 'Workshop: Precificação',
      description: 'Como cobrar o valor justo pelo seu serviço.',
      icon: <Play className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-emerald-600 to-emerald-900',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      badge: '12m restantes'
    }
  ];

  const trendingItems = [
    {
      title: 'Design de Interfaces',
      description: 'Aprenda UI/UX com especialistas do mercado.',
      icon: <Star className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-indigo-500 to-purple-700',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
      badge: 'TOP 1'
    },
    {
      title: 'Gestão de Tempo',
      description: 'Técnicas avançadas para profissionais independentes.',
      icon: <Clock className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-orange-500 to-red-700',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      badge: 'TOP 2'
    },
    {
      title: 'Marketing Pessoal',
      description: 'Como construir uma marca forte na internet.',
      icon: <Users className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-pink-500 to-rose-700',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
      badge: 'TOP 3'
    },
    {
      title: 'Finanças para Freelancers',
      description: 'Organize seu fluxo de caixa e impostos.',
      icon: <LineChart className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-700',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=600',
      badge: 'TOP 4'
    }
  ];

  const myListItems = [
    {
      title: 'Como Criar um Portfólio',
      description: 'Destaque-se no mercado com um portfólio incrível.',
      icon: <Briefcase className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Estratégias de Vendas',
      description: 'Aumente sua conversão de clientes.',
      icon: <LineChart className="h-6 w-6 text-white" />,
      to: '/play',
      bgGradient: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Comunicação Assertiva',
      description: 'Melhore o relacionamento com seus clientes.',
      icon: <Users className="h-6 w-6 text-white" />,
      to: '/educa',
      bgGradient: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const [activeTab, setActiveTab] = useState<'services' | 'entertainment' | 'resources'>('services');

  return (
    <div className="min-h-screen bg-[#141414] w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] -mt-8 pt-0 pb-20 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <Tutorial />
      </div>
      
      {/* Hero Section (Netflix Style) */}
      <div className="relative h-[50vh] md:h-[60vh] w-full mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={activeTab === 'entertainment' 
              ? "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=2850"
              : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2850"
            } 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent"></div>
        </div>

        <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-12 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                Ecossistema AJUDAÍ+
              </span>
              <span className="text-zinc-300 text-sm font-medium">Sua Central de Comando</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              {activeTab === 'services' ? 'Gestão de Serviços' : activeTab === 'entertainment' ? 'Hub de Entretenimento' : 'Recursos da Plataforma'}
            </h1>
            
            <p className="text-base md:text-lg text-zinc-300 mb-6 line-clamp-2 drop-shadow-md">
              {activeTab === 'services' 
                ? 'Gerencie seus pedidos, acompanhe seu desempenho e encontre novas oportunidades de trabalho.'
                : activeTab === 'entertainment'
                ? 'Relaxe com jogos clássicos, assista a masterclasses exclusivas e aprenda com os melhores profissionais.'
                : 'Acesse ferramentas de suporte, documentação técnica e gerencie seu plano de assinatura.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 p-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
              <button 
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'services' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <Briefcase className="h-4 w-4" />
                Serviços
              </button>
              <button 
                onClick={() => setActiveTab('entertainment')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'entertainment' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <PlayCircle className="h-4 w-4" />
                Entretenimento
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'resources' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <Zap className="h-4 w-4" />
                Recursos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* Alerts & Notifications */}
        <div className="px-4 md:px-12 mb-8">
          {profile?.plan === 'free' && activeTab === 'services' && (
            <div className="glass-panel p-6 rounded-xl border-indigo-500/30 bg-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Zap className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Seja um Profissional PRO</h3>
                  <p className="text-zinc-400 text-sm">Desbloqueie pedidos ilimitados, selo de verificado e destaque no ranking.</p>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap">
                  Ver Planos
                </Button>
              </Link>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 mt-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Pagamento aprovado!</h3>
                <p className="text-sm opacity-90">Seu pagamento foi processado com sucesso. Seus créditos ou plano serão ativados em breve.</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="px-4 md:px-12">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-indigo-500" />
                Seu Desempenho
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-medium text-zinc-400 text-xs uppercase tracking-widest">Pedidos Abertos</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.openRequests}</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-medium text-zinc-400 text-xs uppercase tracking-widest">Concluídos</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.completedRequests}</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-5 w-5 text-blue-400" />
                    <h3 className="font-medium text-zinc-400 text-xs uppercase tracking-widest">Respostas</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.responses}</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h3 className="font-medium text-zinc-400 text-xs uppercase tracking-widest">Reputação</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{profile?.reputation_score || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="px-4 md:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  Meus Pedidos Recentes
                </h2>
                <Link to="/pedidos" className="text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                  Ver Todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-white/5 p-6">
                <PedidosList type="my" />
              </div>
            </div>

            <NetflixRow title="Para Profissionais" items={professionalItems} />
            <NetflixRow title="Oportunidades" items={discoveryItems} />
          </div>
        )}

        {activeTab === 'entertainment' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-4 md:px-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-rose-500" />
                  Hub de Entretenimento
                </h2>
                <Link to="/entertainment" className="text-sm text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                  Ver Hub Completo <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/play" className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-rose-500/50 transition-all">
                  <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white mb-1">AJUDAÍ Play</h3>
                    <p className="text-zinc-400 text-sm">Streaming de conhecimento</p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </Link>

                <Link to="/strategic-pause" className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/50 transition-all">
                  <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white mb-1">Pausa Estratégica</h3>
                    <p className="text-zinc-400 text-sm">Games e bem-estar</p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Coffee className="h-6 w-6 text-white" />
                  </div>
                </Link>

                <Link to="/educa" className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white mb-1">AJUDAÍ Educa</h3>
                    <p className="text-zinc-400 text-sm">Cursos e certificações</p>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                </Link>
              </div>
            </div>

            <NetflixRow title="Continue Assistindo" items={continueWatchingItems} />
            <NetflixRow title="Minha Lista" items={myListItems} />
            <NetflixRow title="Em Alta no AJUDAÍ+" items={trendingItems} />
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-4 md:px-12">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Recursos & Suporte
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {resourcesItems.map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={item.to}
                    className="group glass-panel p-6 rounded-3xl border-white/5 hover:border-white/20 transition-all flex flex-col items-center text-center"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-zinc-500 text-xs">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-4 md:px-12">
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold text-white mb-4">Precisa de ajuda técnica?</h2>
                  <p className="text-zinc-300">Nossa documentação de arquitetura e central de ajuda estão disponíveis 24/7 para garantir que você tire o máximo proveito da plataforma.</p>
                </div>
                <div className="flex gap-4">
                  <Link to="/architecture">
                    <Button className="bg-white text-black hover:bg-zinc-200">Ver Docs</Button>
                  </Link>
                  <Link to="/faq">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">FAQ</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
