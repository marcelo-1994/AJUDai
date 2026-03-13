import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Copy, CheckCircle2, DollarSign, TrendingUp, Users, ArrowRight, Wallet } from 'lucide-react';

export const Affiliates = () => {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    clicks: 0,
    sales: 0,
    balance: 0,
    totalEarned: 0
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_sales')
        .select('commission, status')
        .eq('affiliate_id', user?.id);

      if (error) {
        // If table doesn't exist yet, just ignore
        if (error.code === '42P01') return;
        throw error;
      }

      const sales = data || [];
      const totalEarned = sales.reduce((acc, curr) => acc + Number(curr.commission), 0);
      const balance = sales.filter(s => s.status === 'pending').reduce((acc, curr) => acc + Number(curr.commission), 0);

      setStats(prev => ({
        ...prev,
        sales: sales.length,
        totalEarned,
        balance
      }));
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    }
  };

  const affiliateLink = user ? `${window.location.origin}/explore?ref=${user.id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-6">
          <DollarSign className="h-12 w-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Programa de Afiliados Ajudaí</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          Ganhe dinheiro indicando nossos serviços. Receba comissões por cada venda realizada através do seu link exclusivo.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg px-8">
            Criar Conta e Começar a Ganhar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-indigo-400" />
          Painel de Afiliado
        </h1>
        <p className="text-zinc-400">Gerencie seus links, acompanhe suas vendas e solicite saques.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Wallet className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Saldo Disponível</h3>
          </div>
          <p className="text-3xl font-bold text-white">R$ {stats.balance.toFixed(2).replace('.', ',')}</p>
          <Button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10">
            Solicitar Saque
          </Button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Total Ganho</h3>
          </div>
          <p className="text-3xl font-bold text-white">R$ {stats.totalEarned.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Vendas Realizadas</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.sales}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Cliques no Link</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.clicks}</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <h2 className="text-xl font-bold text-white mb-4 relative z-10">Seu Link de Afiliado</h2>
        <p className="text-zinc-400 mb-6 relative z-10">
          Compartilhe este link nas suas redes sociais, WhatsApp ou site. Você ganhará comissão por todas as compras feitas por usuários que se cadastrarem através dele.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-mono text-sm overflow-x-auto whitespace-nowrap">
            {affiliateLink}
          </div>
          <Button 
            onClick={copyLink}
            className={`${copied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all`}
          >
            {copied ? (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Copiado!</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copiar Link</>
            )}
          </Button>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Como funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-4">1</div>
            <h3 className="text-lg font-bold text-white mb-2">Compartilhe seu link</h3>
            <p className="text-zinc-400 text-sm">Envie seu link exclusivo para amigos, seguidores ou clientes em potencial.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-4">2</div>
            <h3 className="text-lg font-bold text-white mb-2">Eles compram</h3>
            <p className="text-zinc-400 text-sm">Quando alguém clica no seu link e faz uma compra no Ajudaí, nós registramos a venda para você.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-4">3</div>
            <h3 className="text-lg font-bold text-white mb-2">Você recebe</h3>
            <p className="text-zinc-400 text-sm">A comissão vai direto para o seu saldo. Solicite o saque via PIX a qualquer momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
