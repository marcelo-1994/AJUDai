import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Search, Clock, MessageSquare, DollarSign, Star, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const Requests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'offers'>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, [activeTab, page]);

  const fetchRequests = async () => {
    setLoading(true);
    
    let query = supabase
      .from('help_requests')
      .select(`
        *,
        users (name, avatar_url, reputation_score)
      `, { count: 'exact' });

    // In a real app, you might filter by type (request vs offer)
    // For now, we'll just fetch all if 'all', or filter if your DB supports it.
    // Assuming 'type' column doesn't exist yet, we just fetch all.
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col items-center text-center mb-8 mt-4">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">AJUDAÍ</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8">Ajude quem precisa ou encontre quem pode te ajudar.</p>
        
        <Link to="/create-request" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-medium py-6 px-8 rounded-xl flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] border-none">
            <Plus className="h-5 w-5" /> Novo Pedido
          </Button>
        </Link>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2 justify-start sm:justify-center">
        <button
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${
            activeTab === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setPage(1); }}
          className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${
            activeTab === 'requests' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Pedidos de Ajuda
        </button>
        <button
          onClick={() => { setActiveTab('offers'); setPage(1); }}
          className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${
            activeTab === 'offers' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Ofertas de Ajuda
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Carregando publicações...</div>
      ) : (
        <div className="grid gap-6">
          {requests.length > 0 ? (
            <>
              {requests.map((request) => (
                <Link key={request.id} to={`/requests/${request.id}`} className="block group">
                  <div className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {request.users?.avatar_url ? (
                          <img src={request.users.avatar_url} alt={request.users.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                            {request.users?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-white">{request.users?.name || 'Usuário Anônimo'}</h3>
                          <div className="flex items-center text-xs text-zinc-400 gap-2 mt-1">
                            <span className="flex items-center text-amber-400"><Star className="h-3 w-3 mr-1 fill-amber-400" /> {request.users?.reputation_score || 0}</span>
                            <span>•</span>
                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {request.is_paid ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <DollarSign className="h-3 w-3 mr-1" /> Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Comunidade
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-400 transition-colors">{request.title}</h2>
                    <p className="text-zinc-400 line-clamp-2 mb-6 leading-relaxed">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-zinc-300 border border-white/5">
                        {request.category}
                      </span>
                      <div className="flex items-center text-sm text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                        <MessageSquare className="h-4 w-4 mr-2" /> Responder
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/10 bg-black/50 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-zinc-400 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-white/10 bg-black/50 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-white/5">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma publicação encontrada</h3>
              <p className="text-zinc-400">Seja o primeiro a publicar algo nesta categoria!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
