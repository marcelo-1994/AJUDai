import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Tag, MapPin, Clock, MessageSquare, Share2, MoreVertical, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'offer' | 'request';
  location: string;
  price?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export const Ads = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAds();
  }, [filter]);

  const fetchAds = async () => {
    setLoading(true);
    let query = supabase
      .from('ads')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Anúncios e Ofertas</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Conecte-se com quem precisa ou oferece ajuda no ecossistema.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-5 w-5 mr-2" /> Criar Anúncio
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input 
            type="text"
            placeholder="Buscar anúncios..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('offer')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'offer' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
          >
            Ofertas
          </button>
          <button 
            onClick={() => setFilter('request')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'request' ? 'bg-orange-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
          >
            Pedidos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel h-64 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <motion.div 
              key={ad.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    ad.type === 'offer' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {ad.type === 'offer' ? 'Oferta' : 'Pedido'}
                  </span>
                  <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">{ad.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 line-clamp-2">{ad.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-zinc-400">
                    <Tag className="h-3 w-3 mr-2" /> {ad.category}
                  </div>
                  <div className="flex items-center text-xs text-zinc-400">
                    <MapPin className="h-3 w-3 mr-2" /> {ad.location}
                  </div>
                  <div className="flex items-center text-xs text-zinc-400">
                    <Clock className="h-3 w-3 mr-2" /> {new Date(ad.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                      {ad.profiles?.avatar_url ? (
                        <img src={ad.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-400">
                          {ad.profiles?.full_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {ad.profiles?.full_name || 'Usuário'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <Search className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Nenhum anúncio encontrado</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Tente mudar os filtros ou busque por algo diferente.</p>
        </div>
      )}

      {/* Create Ad Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Novo Anúncio</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                // Logic to save ad would go here
                setShowCreateModal(false);
              }}>
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Ofereço aulas de violão"
                    className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500">
                      <option value="offer">Oferta</option>
                      <option value="request">Pedido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria</label>
                    <select className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500">
                      <option>Educação</option>
                      <option>Serviços</option>
                      <option>Doação</option>
                      <option>Tecnologia</option>
                      <option>Outros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Localização</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: São Paulo, SP"
                    className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Descreva o que você oferece ou precisa..."
                    className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                    Publicar Anúncio
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
