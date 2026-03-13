import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Star, Award, Medal, CheckCircle2, MessageSquare, Trophy, MapPin, Loader2, ArrowLeft, Briefcase, Wrench } from 'lucide-react';

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    responsesCount: 0,
    completedRequests: 0,
    isTop10: false,
  });
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (userError) throw userError;
        setProfile(userData);

        // Fetch responses count
        const { count: responsesCount } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', id);

        // Fetch completed requests count
        const { count: completedRequests } = await supabase
          .from('help_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', id)
          .eq('status', 'completed');

        // Check if user is in top 10
        const { data: topUsers } = await supabase
          .from('users')
          .select('id')
          .order('reputation_score', { ascending: false })
          .limit(10);

        const isTop10 = topUsers?.some(u => u.id === id) || false;

        setStats({
          responsesCount: responsesCount || 0,
          completedRequests: completedRequests || 0,
          isTop10,
        });

        // Fetch experimental tools / projects (using help_requests or products)
        // For this example, let's fetch their help_requests as "projects"
        const { data: toolsData } = await supabase
          .from('help_requests')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(5);

        setTools(toolsData || []);

      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Usuário não encontrado</h2>
        <Button onClick={() => navigate(-1)} variant="outline" className="border-white/10 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const getLevel = (score: number) => {
    return Math.floor(Math.sqrt((score || 0) / 10)) + 1;
  };

  const level = getLevel(profile.reputation_score);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button 
        onClick={() => navigate(-1)} 
        variant="outline" 
        className="mb-6 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-900/50 to-emerald-900/50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
          <div className="relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-black shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold text-4xl border-4 border-black shadow-xl">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-white/10">
              <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                L{level}
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
              {profile.name}
              {profile.plan === 'pro' && <span className="text-xs uppercase tracking-wider bg-indigo-500 text-white px-2 py-1 rounded-full font-bold">PRO</span>}
              {profile.plan === 'strategic' && <span className="text-xs uppercase tracking-wider bg-purple-500 text-white px-2 py-1 rounded-full font-bold">VIP</span>}
            </h1>
            <p className="text-zinc-400 mb-4 flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="w-4 h-4" /> {profile.role === 'admin' ? 'Administrador' : 'Profissional'}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{profile.reputation_score || 0}</span>
                <span className="text-zinc-400 text-sm">Reputação</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
            <Button 
              onClick={() => {
                if (profile.phone) {
                  const message = encodeURIComponent(`Olá ${profile.name}! Encontrei seu perfil no AJUDAÍ e gostaria de conversar.`);
                  window.open(`https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
                } else {
                  alert('Este usuário não disponibilizou um número de contato.');
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Entrar em Contato
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Sobre {profile.name?.split(' ')[0]}</h2>
            {profile.bio ? (
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="text-zinc-500 text-sm italic">Nenhuma biografia adicionada.</p>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-400" /> Ferramentas & Projetos Experimentais
            </h2>
            {tools.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/50 rounded-2xl border border-white/5">
                <p className="text-zinc-500 text-sm">Nenhum projeto ou ferramenta publicada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tools.map(tool => (
                  <div key={tool.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/30 transition-colors">
                    <h3 className="text-white font-bold mb-1">{tool.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 bg-black/50 px-2 py-1 rounded-md uppercase tracking-wider font-mono">
                        {tool.category || 'Projeto'}
                      </span>
                      <Button variant="outline" size="sm" className="text-xs border-white/10 hover:bg-white/5" onClick={() => navigate(`/requests/${tool.id}`)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-400" /> Conquistas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`flex flex-col items-center text-center p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.completedRequests > 0 ? 'hover:bg-white/10' : 'opacity-50 grayscale'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${stats.completedRequests > 0 ? 'bg-[#0f3d2e]' : 'bg-zinc-800'}`}>
                  <CheckCircle2 className={`h-6 w-6 ${stats.completedRequests > 0 ? 'text-[#10b981]' : 'text-zinc-500'}`} />
                </div>
                <span className="text-xs font-bold text-white mb-1">Primeira Ajuda</span>
              </div>
              <div className={`flex flex-col items-center text-center p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${profile.reputation_score >= 50 ? 'hover:bg-white/10' : 'opacity-50 grayscale'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${profile.reputation_score >= 50 ? 'bg-[#3d2e0f]' : 'bg-zinc-800'}`}>
                  <Star className={`h-6 w-6 ${profile.reputation_score >= 50 ? 'text-[#f59e0b]' : 'text-zinc-500'}`} />
                </div>
                <span className="text-xs font-bold text-white mb-1">5 Estrelas</span>
              </div>
              <div className={`flex flex-col items-center text-center p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.responsesCount >= 10 ? 'hover:bg-white/10' : 'opacity-50 grayscale'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${stats.responsesCount >= 10 ? 'bg-indigo-900/40' : 'bg-zinc-800'}`}>
                  <MessageSquare className={`h-6 w-6 ${stats.responsesCount >= 10 ? 'text-indigo-400' : 'text-zinc-500'}`} />
                </div>
                <span className="text-xs font-bold text-white mb-1">Comunicador</span>
              </div>
              <div className={`flex flex-col items-center text-center p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.isTop10 ? 'hover:bg-white/10' : 'opacity-50 grayscale'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${stats.isTop10 ? 'bg-yellow-900/40' : 'bg-zinc-800'}`}>
                  <Trophy className={`h-6 w-6 ${stats.isTop10 ? 'text-yellow-400' : 'text-zinc-500'}`} />
                </div>
                <span className="text-xs font-bold text-white mb-1">Top 10</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Membro desde</span>
                <span className="text-white text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Respostas dadas</span>
                <span className="text-white text-sm font-medium">{stats.responsesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Pedidos concluídos</span>
                <span className="text-white text-sm font-medium">{stats.completedRequests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
