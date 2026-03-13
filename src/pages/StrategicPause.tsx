import React, { useState, useEffect } from 'react';
import { Gamepad2, Brain, Coins, Trophy, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export default function StrategicPause() {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCoins = async () => {
    if (!user) return;
    try {
      setIsRefreshing(true);
      // Assuming coins are stored in the users table or a specific wallet table.
      // We'll try to fetch from users table first. If it doesn't exist, we'll default to 0.
      const { data, error } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();
        
      if (data && data.coins !== undefined) {
        setCoins(data.coins);
      }
    } catch (err) {
      console.error('Error fetching coins:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCoins();

    // Subscribe to real-time updates for the user's coins
    const subscription = supabase
      .channel('public:users:coins')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.coins !== undefined) {
            setCoins(payload.new.coins);
          }
        }
      )
      .subscribe();

    // Listen for window focus to refresh coins when returning from another tab
    const handleFocus = () => {
      fetchCoins();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Gamepad2 className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Pausa Estratégica</h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl mt-4">
            Descanse a mente, recarregue as energias e ganhe recompensas. Jogue clássicos contra nossa IA no ecossistema ClassicVerse.
          </p>
        </div>
        
        {/* Coin Balance Card */}
        <div className="glass-panel p-6 rounded-3xl border-emerald-500/30 bg-emerald-500/5 min-w-[240px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-center justify-between w-full mb-2">
            <p className="text-zinc-400 text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              Suas Moedas AjudaAí
            </p>
            <button 
              onClick={fetchCoins}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
              title="Atualizar saldo"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg" />
          ) : (
            <div className="text-4xl font-black text-white tracking-tight">
              {coins.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Main CTA Section */}
      <div className="relative rounded-3xl overflow-hidden mb-16 border border-white/10 group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-black z-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://picsum.photos/seed/gaming/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay z-0 transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full z-0" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ClassicVerse AI</span>
          </h2>
          <p className="text-lg text-zinc-300 max-w-2xl mb-10 leading-relaxed">
            Um universo de jogos clássicos reimaginados com Inteligência Artificial. 
            Jogue, divirta-se, treine seu cérebro e acumule moedas para usar em todo o ecossistema AjudaAí+.
          </p>
          
          <a 
            href="https://classicverse-ai.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <Gamepad2 className="h-6 w-6" />
            Entrar no ClassicVerse
            <ExternalLink className="h-5 w-5 ml-2 opacity-50" />
          </a>
        </div>
      </div>

      {/* Benefits Grid */}
      <h3 className="text-2xl font-bold text-white mb-6">Por que fazer uma pausa?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all group">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Brain className="h-7 w-7 text-blue-400" />
          </div>
          <h4 className="text-xl font-bold text-white mb-3">+ Foco e Produtividade</h4>
          <p className="text-zinc-400 leading-relaxed">
            Pausas estratégicas comprovadamente melhoram a concentração. Descanse a mente resolvendo desafios divertidos e volte ao trabalho renovado.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 hover:border-emerald-500/30 transition-all group">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Coins className="h-7 w-7 text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-white mb-3">Ganhe Moedas</h4>
          <p className="text-zinc-400 leading-relaxed">
            Suas vitórias no ClassicVerse rendem Moedas AjudaAí. Use seu saldo para destacar pedidos, obter descontos ou acessar recursos premium.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5 hover:border-purple-500/30 transition-all group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Trophy className="h-7 w-7 text-purple-400" />
          </div>
          <h4 className="text-xl font-bold text-white mb-3">Desafie a IA</h4>
          <p className="text-zinc-400 leading-relaxed">
            Enfrente oponentes controlados por IA com diferentes níveis de dificuldade. Teste suas habilidades em clássicos atemporais.
          </p>
        </div>
      </div>
    </div>
  );
}
