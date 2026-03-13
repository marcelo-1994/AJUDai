import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageCircle, Clock, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';

export const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('help_requests')
          .select('*, user:users(name, avatar_url, phone)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setRequest(data);
      } catch (err: any) {
        console.error('Error fetching request:', err);
        setError('Não foi possível carregar os detalhes do pedido.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [id]);
  
  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const contactPhone = request?.phone || request?.user?.phone;
    
    if (contactPhone) {
      const message = encodeURIComponent(`Olá! Vi seu pedido de ajuda "${request.title}" no AJUDAÍ e gostaria de ajudar.`);
      window.open(`https://wa.me/${contactPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
    } else {
      alert('O usuário não disponibilizou um número de telefone.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Pedido não encontrado</h2>
        <p className="text-zinc-400 mb-6">{error || 'O pedido que você está procurando não existe ou foi removido.'}</p>
        <Button onClick={() => navigate('/requests')} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          Voltar para Pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </button>
      
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-8 right-8">
          {request.status === 'open' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Aberto
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Concluído
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-indigo-500/30 cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => window.location.href = `/user/${request.user_id}`}
          >
            {request.user?.avatar_url ? (
              <img src={request.user.avatar_url} alt={request.user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-xl font-bold">
                {request.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{request.title}</h1>
            <p 
              className="text-zinc-400 flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors w-fit"
              onClick={() => window.location.href = `/user/${request.user_id}`}
            >
              <User className="h-4 w-4" /> {request.user?.name || 'Usuário Anônimo'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-zinc-300">
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>{new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span>{request.location || 'Remoto'}</span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-300 font-medium">
            <span>{request.category}</span>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Descrição do Pedido</h3>
          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </div>
        
        {request.status === 'open' && user?.id !== request.user_id && (
          <div className="flex justify-center">
            <Button 
              onClick={handleContact}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3"
            >
              <MessageCircle className="h-6 w-6" />
              Entrar em Contato (WhatsApp)
            </Button>
          </div>
        )}
        
        {user?.id === request.user_id && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
            <p className="text-indigo-300">Este é o seu pedido. Você pode gerenciá-lo no seu Dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};
