import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MessageSquare, HeartHandshake, Star, Users, MessageCircle, Info } from 'lucide-react';
import { PermissionGuard } from '../components/PermissionGuard';

type TimelineEvent = {
  id: string;
  type: 'request_created' | 'response_added' | 'request_completed';
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  request_id: string;
  request_title: string;
  details?: string;
};

export const Timeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      
      // Fetch recent requests
      const { data: requests, error: reqError } = await supabase
        .from('requests')
        .select(`
          id, 
          title, 
          created_at, 
          status,
          user_id,
          profiles:user_id (name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reqError) throw reqError;

      // Fetch recent responses
      const { data: responses, error: resError } = await supabase
        .from('responses')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          request_id,
          requests (title),
          profiles:user_id (name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (resError) throw resError;

      const timelineEvents: TimelineEvent[] = [];

      requests?.forEach(req => {
        const profile = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
        timelineEvents.push({
          id: `req-${req.id}`,
          type: 'request_created',
          created_at: req.created_at,
          user_id: req.user_id,
          user_name: profile?.name || 'Usuário',
          user_avatar: profile?.avatar_url,
          request_id: req.id,
          request_title: req.title
        });

        if (req.status === 'completed') {
          timelineEvents.push({
            id: `comp-${req.id}`,
            type: 'request_completed',
            created_at: req.created_at, // Ideally we'd have a completed_at timestamp
            user_id: req.user_id,
            user_name: profile?.name || 'Usuário',
            user_avatar: profile?.avatar_url,
            request_id: req.id,
            request_title: req.title
          });
        }
      });

      responses?.forEach(res => {
        const profile = Array.isArray(res.profiles) ? res.profiles[0] : res.profiles;
        const request = Array.isArray(res.requests) ? res.requests[0] : res.requests;
        timelineEvents.push({
          id: `res-${res.id}`,
          type: 'response_added',
          created_at: res.created_at,
          user_id: res.user_id,
          user_name: profile?.name || 'Usuário',
          user_avatar: profile?.avatar_url,
          request_id: res.request_id,
          request_title: request?.title || 'Pedido',
          details: res.content
        });
      });

      // Sort by date descending
      timelineEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'request_created':
        return <HeartHandshake className="h-5 w-5 text-indigo-400" />;
      case 'response_added':
        return <MessageSquare className="h-5 w-5 text-emerald-400" />;
      case 'request_completed':
        return <Star className="h-5 w-5 text-amber-400" />;
      default:
        return <Clock className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getEventText = (event: TimelineEvent) => {
    switch (event.type) {
      case 'request_created':
        return <span>criou um novo pedido de ajuda: <strong>{event.request_title}</strong></span>;
      case 'response_added':
        return <span>ofereceu ajuda no pedido: <strong>{event.request_title}</strong></span>;
      case 'request_completed':
        return <span>marcou o pedido como resolvido: <strong>{event.request_title}</strong></span>;
      default:
        return <span>realizou uma ação</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tempo Real (Timeline)</h1>
        <p className="text-zinc-400">Acompanhe o que está acontecendo na comunidade AJUDAÍ agora.</p>
      </div>

      {/* WhatsApp Groups Banner */}
      <div className="mb-8 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 shrink-0">
            <MessageCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Grupos do WhatsApp</h2>
            <p className="text-emerald-100/80 mb-4">
              Conecte-se com a comunidade AJUDAÍ e outros grupos locais. Participe das discussões e fique por dentro das novidades!
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <a 
                href="https://chat.whatsapp.com/CilC3a21huq0vtw4DWMkw4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Users className="h-4 w-4" />
                COMUNIDADE DO AJUDAÍ
              </a>
              <PermissionGuard permission="admin_panel" hideFallback>
                <button 
                  onClick={() => alert('Em breve: funcionalidade para adicionar novos grupos da comunidade.')}
                  className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl font-medium transition-colors border border-white/5"
                >
                  + Adicionar Grupo
                </button>
              </PermissionGuard>
            </div>

            <div className="flex items-start gap-2 bg-black/20 rounded-xl p-4 border border-emerald-500/10">
              <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-100/70">
                <strong className="text-emerald-300">Importante:</strong> O método de pagamento oficial da plataforma é o Mercado Pago. Seus créditos serão ativados automaticamente após a confirmação.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 pb-8">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="relative pl-8 md:pl-10">
              <div className="absolute -left-5 md:-left-6 top-1 bg-zinc-900 border border-white/10 rounded-full p-2 shadow-lg">
                {getEventIcon(event.type)}
              </div>
              
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:bg-zinc-900/80 transition-colors">
                <div className="flex items-start gap-4">
                  {event.user_avatar ? (
                    <img src={event.user_avatar} alt={event.user_name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <span className="text-indigo-300 font-bold text-sm">
                        {event.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <p className="text-zinc-200">
                        <span className="font-medium text-white">{event.user_name}</span> {getEventText(event)}
                      </p>
                      <span className="text-xs text-zinc-500 whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    
                    {event.details && (
                      <div className="mt-3 bg-black/30 rounded-xl p-4 text-sm text-zinc-400 border border-white/5">
                        <p className="line-clamp-2">{event.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="pl-8 text-zinc-500">
            Nenhuma atividade recente encontrada.
          </div>
        )}
      </div>
    </div>
  );
};
