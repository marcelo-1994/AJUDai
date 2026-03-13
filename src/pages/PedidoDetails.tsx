import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageCircle, Clock, MapPin, Globe, User, CheckCircle2, AlertCircle, Share2, CreditCard, Loader2, Banknote, Users } from 'lucide-react';

export default function PedidoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  useEffect(() => {
    fetchPedido();
  }, [id]);

  const fetchPedido = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Note: We need to ensure the foreign key relationship exists in Supabase for this join to work.
      // If 'cliente_id' is not a foreign key to 'auth.users' or 'public.users', this might fail.
      // Assuming 'public.users' exists and is linked.
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, cliente:users!cliente_id(name, avatar_url), prestador:users!prestador_id(name, avatar_url, phone)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      setPedido(data);
    } catch (err: any) {
      console.error('Error fetching pedido:', err);
      setError('Não foi possível carregar os detalhes do pedido.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido de Ajuda: ${pedido.tipo_servico}`,
          text: `Confira este pedido de ajuda no AJUDAÍ+: ${pedido.descricao}`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Confira este pedido de ajuda no AJUDAÍ+: ${pedido.tipo_servico}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleAccept = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/pedidos/${id}` } });
      return;
    }

    const valor_final = prompt('Confirme o valor final do serviço (R$):', pedido.valor?.toString());
    if (!valor_final) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        },
        body: JSON.stringify({
          valor_final: parseFloat(valor_final),
          prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (!response.ok) throw new Error('Erro ao aceitar pedido');
      fetchPedido();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'em_andamento' })
        .eq('id', id);

      if (error) throw error;
      fetchPedido();
      setPaymentModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar pagamento direto');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${id}/create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao gerar link de pagamento');
      const { init_point } = await response.json();
      window.open(init_point, '_blank');
      fetchPedido(); // Refresh to check status
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }
  
  if (error || !pedido) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Pedido não encontrado</h2>
        <p className="text-zinc-400 mb-6">{error || 'O pedido que você está procurando não existe ou foi removido.'}</p>
        <Button onClick={() => navigate('/pedidos')} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          Voltar para Pedidos
        </Button>
      </div>
    );
  }

  const isCreator = user?.id === pedido.cliente_id;
  const isProvider = user?.id === pedido.prestador_id;
  const canAccept = !isCreator && !pedido.prestador_id && pedido.status === 'aguardando_aceite';
  const canPay = isCreator && pedido.status === 'aguardando_pagamento';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate('/pedidos')}
        className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Lista
      </button>
      
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/5">
        {/* Status Badge */}
        <div className="absolute top-8 right-8">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            pedido.status === 'aguardando_aceite' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
            pedido.status === 'aguardando_pagamento' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
            pedido.status === 'em_andamento' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}>
            {pedido.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center">
            {pedido.cliente?.avatar_url ? (
              <img src={pedido.cliente.avatar_url} alt={pedido.cliente.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-zinc-500" />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{pedido.tipo_servico}</h1>
            <p className="text-zinc-400 flex items-center gap-2">
              <User className="h-4 w-4" /> {pedido.cliente?.name || 'Cliente'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-zinc-300">
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            {pedido.tipo === 'online' ? <Globe className="h-4 w-4 text-blue-400" /> : <MapPin className="h-4 w-4 text-emerald-400" />}
            <span>{pedido.tipo === 'online' ? 'Online' : pedido.localizacao}</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 font-bold">
            <span>{pedido.valor ? `R$ ${Number(pedido.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A combinar'}</span>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Descrição</h3>
          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {pedido.descricao}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-white/5 pt-8">
          <Button 
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Compartilhar no WhatsApp
          </Button>
          
          <Button 
            onClick={handleShare}
            className="bg-white/5 hover:bg-white/10 text-white flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Copiar Link
          </Button>

          {canAccept && (
            <Button 
              onClick={handleAccept}
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aceitar Pedido'}
            </Button>
          )}

          {canPay && (
            <Button 
              onClick={() => setPaymentModalOpen(true)}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar / Combinar
                </>
              )}
            </Button>
          )}

          {(isCreator || isProvider) && pedido.status === 'em_andamento' && (
            <Button 
              onClick={() => navigate(`/workspace/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Sala de Colaboração
            </Button>
          )}
        </div>
      </div>

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-6">
            <h3 className="text-xl font-bold text-white">Como deseja pagar?</h3>
            <p className="text-zinc-400 text-sm">Escolha a forma de pagamento para este serviço.</p>
            
            <div className="space-y-3">
              <button 
                onClick={handlePay}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-bold">Pagamento Seguro (Plataforma)</p>
                  <p className="text-xs text-zinc-400">Pix ou Cartão. O valor fica retido até a conclusão.</p>
                </div>
              </button>

              <button 
                onClick={handleDirectPayment}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-bold">Pagamento Direto</p>
                  <p className="text-xs text-zinc-400">Pague em dinheiro ou Pix direto ao profissional após o serviço.</p>
                </div>
              </button>
            </div>

            <Button 
              onClick={() => setPaymentModalOpen(false)}
              className="w-full bg-transparent hover:bg-white/5 text-zinc-400"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
