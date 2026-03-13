import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  MapPin,
  Globe,
  User,
  ChevronRight,
  Banknote,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface Pedido {
  id: string;
  cliente_id: string;
  prestador_id: string | null;
  tipo_servico: string;
  descricao: string;
  valor: number;
  tipo: 'online' | 'presencial';
  localizacao: string;
  status: 'aguardando_aceite' | 'aguardando_pagamento' | 'pago' | 'em_andamento' | 'concluido' | 'liberado' | 'cancelado';
  link_pagamento: string | null;
  prazo: string | null;
  created_at: string;
  cliente?: { name: string; avatar_url: string };
  prestador?: { name: string; avatar_url: string; phone: string };
}

const PedidoItem = memo(({ 
  pedido, 
  currentUser, 
  onAccept, 
  onPayment, 
  onStatusUpdate, 
  actionLoading,
  navigate 
}: { 
  pedido: Pedido; 
  currentUser: any; 
  onAccept: (id: string) => void;
  onPayment: (id: string) => void;
  onStatusUpdate: (id: string, action: 'complete' | 'confirm') => void;
  actionLoading: string | null;
  navigate: any;
}) => {
  const isClient = currentUser?.id === pedido.cliente_id;
  const isProvider = currentUser?.id === pedido.prestador_id;
  const whatsappMsg = encodeURIComponent(`Olá, estou entrando em contato sobre o Pedido #${pedido.id.slice(0, 8)} no AJUDAÍ+`);
  const whatsappUrl = isClient && pedido.prestador?.phone 
    ? `https://wa.me/${pedido.prestador.phone.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      aguardando_aceite: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      aguardando_pagamento: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      pago: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      em_andamento: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      concluido: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      liberado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelado: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const labels: Record<string, string> = {
      aguardando_aceite: 'Aguardando Profissional',
      aguardando_pagamento: 'Aguardando Pagamento',
      pago: 'Pago - Em Andamento',
      em_andamento: 'Em Andamento',
      concluido: 'Serviço Concluído',
      liberado: 'Pagamento Liberado',
      cancelado: 'Cancelado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles.aguardando_aceite}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
      {pedido.status === 'em_andamento' && (
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 blur-[80px] pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-zinc-500">#{pedido.id.slice(0, 8)}</span>
                {getStatusBadge(pedido.status)}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                {pedido.tipo_servico}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">Valor</p>
              <p className="text-xl font-bold text-emerald-500">
                {pedido.valor ? `R$ ${Number(pedido.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A combinar'}
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-400 line-clamp-2">{pedido.descricao}</p>

          <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              {pedido.tipo === 'online' ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {pedido.tipo === 'online' ? 'Serviço Online' : pedido.localizacao}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
            </div>
            {pedido.prazo && (
              <div className="flex items-center gap-1.5 text-amber-500/80">
                <AlertCircle className="h-3.5 w-3.5" />
                Prazo: {new Date(pedido.prazo).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {pedido.cliente?.avatar_url ? (
                  <img src={pedido.cliente.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-3 w-3 text-zinc-500" />
                )}
              </div>
              <div className="text-[10px]">
                <p className="text-zinc-500">Cliente</p>
                <p className="text-white font-bold">{pedido.cliente?.name || 'Usuário'}</p>
              </div>
            </div>

            {pedido.prestador && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                  {pedido.prestador?.avatar_url ? (
                    <img src={pedido.prestador.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-3 w-3 text-indigo-400" />
                  )}
                </div>
                <div className="text-[10px]">
                  <p className="text-zinc-500">Profissional</p>
                  <p className="text-white font-bold">{pedido.prestador?.name || 'Profissional'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 min-w-[180px]">
          {pedido.status === 'aguardando_aceite' && !isClient && (
            <Button
              onClick={() => onAccept(pedido.id)}
              disabled={actionLoading === pedido.id}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3"
            >
              {actionLoading === pedido.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aceitar Pedido'}
            </Button>
          )}

          {isClient && pedido.status === 'aguardando_pagamento' && (
            <Button
              onClick={() => onPayment(pedido.id)}
              disabled={actionLoading === pedido.id}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 flex items-center justify-center gap-2"
            >
              {actionLoading === pedido.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar / Combinar
                </>
              )}
            </Button>
          )}

          {isClient && pedido.status === 'concluido' && (
            <Button
              onClick={() => onStatusUpdate(pedido.id, 'confirm')}
              disabled={actionLoading === pedido.id}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 flex items-center justify-center gap-2"
            >
              {actionLoading === pedido.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Entrega
                </>
              )}
            </Button>
          )}

          {isProvider && pedido.status === 'em_andamento' && (
            <Button
              onClick={() => onStatusUpdate(pedido.id, 'complete')}
              disabled={actionLoading === pedido.id}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 flex items-center justify-center gap-2 mb-2"
            >
              {actionLoading === pedido.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar Concluído
                </>
              )}
            </Button>
          )}

          {(isClient || isProvider) && pedido.status === 'em_andamento' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/workspace/${pedido.id}`);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 flex items-center justify-center gap-2 mt-2 border border-white/10"
            >
              <Users className="h-4 w-4" />
              Sala de Colaboração
            </Button>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold text-sm transition-all border border-emerald-500/20"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}

          {isClient && pedido.status === 'aguardando_pagamento' && pedido.link_pagamento && (
            <a
              href={pedido.link_pagamento}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 text-zinc-500 hover:text-white text-[10px] transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir link de pagamento
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

PedidoItem.displayName = 'PedidoItem';

export default function PedidosList({ type = 'my' }: { type?: 'my' | 'available' }) {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (type === 'available') {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, cliente:users!cliente_id(name, avatar_url)')
          .eq('status', 'aguardando_aceite')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPedidos(data || []);
      } else {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, cliente:users!cliente_id(name, avatar_url), prestador:users!prestador_id(name, avatar_url, phone)')
          .or(`cliente_id.eq.${user.id},prestador_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPedidos(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPedidos();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [fetchPedidos]);

  const handleAccept = useCallback(async (pedidoId: string) => {
    const valor_final = prompt('Confirme o valor final do serviço (R$):');
    if (!valor_final) return;

    setActionLoading(pedidoId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('pedidos')
        .update({
          prestador_id: user.id,
          valor: parseFloat(valor_final),
          prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'aguardando_pagamento'
        })
        .eq('id', pedidoId)
        .eq('status', 'aguardando_aceite');

      if (error) throw error;
      
      fetch('/api/admin/trigger-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        },
        body: JSON.stringify({
          event: 'pedido:accepted',
          data: { pedidoId, prestador_id: user.id, valor_final }
        })
      }).catch(console.error);

      fetchPedidos();
    } catch (error: any) {
      console.error("Erro ao aceitar:", error);
      alert(error.message || 'Erro ao aceitar pedido');
    } finally {
      setActionLoading(null);
    }
  }, [fetchPedidos]);

  const handleCreatePayment = useCallback(async (pedidoId: string) => {
    setActionLoading(pedidoId);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao gerar link de pagamento');
      const { init_point } = await response.json();
      window.open(init_point, '_blank');
      fetchPedidos();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  }, [fetchPedidos]);

  const handleDirectPayment = useCallback(async (pedidoId: string) => {
    setActionLoading(pedidoId);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'em_andamento' })
        .eq('id', pedidoId);

      if (error) throw error;
      fetchPedidos();
      setPaymentModalOpen(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar pagamento direto');
    } finally {
      setActionLoading(null);
    }
  }, [fetchPedidos]);

  const handleStatusUpdate = useCallback(async (pedidoId: string, action: 'complete' | 'confirm') => {
    setActionLoading(pedidoId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let updateData = {};
      let matchConditions: Record<string, any> = { id: pedidoId };

      if (action === 'complete') {
        updateData = { status: 'concluido' };
        matchConditions = { ...matchConditions, prestador_id: user.id, status: 'em_andamento' };
      } else if (action === 'confirm') {
        updateData = { status: 'liberado' };
        matchConditions = { ...matchConditions, cliente_id: user.id, status: 'concluido' };
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .match(matchConditions);

      if (error) throw error;
      fetchPedidos();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      alert(error.message || 'Erro ao atualizar status');
    } finally {
      setActionLoading(null);
    }
  }, [fetchPedidos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Carregando pedidos...</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-20 px-6 glass-panel rounded-3xl border-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Nenhum pedido encontrado</h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
          {type === 'available' 
            ? 'Não há pedidos abertos no momento. Volte em breve!' 
            : 'Você ainda não criou ou aceitou nenhum pedido.'}
        </p>
        {type === 'my' && (
          <Link to="/pedidos/novo">
            <Button className="bg-indigo-600 text-white">Criar Meu Primeiro Pedido</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => (
        <PedidoItem 
          key={pedido.id}
          pedido={pedido}
          currentUser={currentUser}
          onAccept={handleAccept}
          onPayment={(id) => setPaymentModalOpen(id)}
          onStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          navigate={navigate}
        />
      ))}

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-6">
            <h3 className="text-xl font-bold text-white">Como deseja pagar?</h3>
            <p className="text-zinc-400 text-sm">Escolha a forma de pagamento para este serviço.</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleCreatePayment(paymentModalOpen)}
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
                onClick={() => handleDirectPayment(paymentModalOpen)}
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
              onClick={() => setPaymentModalOpen(null)}
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
