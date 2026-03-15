import React, { useState, useEffect, useRef } from 'react';
import { Search, User, FileText, Loader2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalSearch = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    users: any[];
    requests: any[];
  }>({ users: [], requests: [] });
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults({ users: [], requests: [] });
        return;
      }

      setLoading(true);
      
      try {
        // Search users (professionals/volunteers)
        const { data: users } = await supabase
          .from('users')
          .select('id, name, role, avatar_url')
          .ilike('name', `%${query}%`)
          .limit(5);

        // Search requests
        const { data: requests } = await supabase
          .from('help_requests')
          .select('id, title, description')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5);

        setResults({
          users: users || [],
          requests: requests || []
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-md ${isMobile ? 'block' : 'hidden lg:block'}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 sm:text-sm transition-all"
          placeholder="Buscar profissionais, pedidos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4 text-zinc-400 hover:text-white" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-4 flex justify-center items-center text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Buscando...
              </div>
            ) : results.users.length === 0 && results.requests.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 text-sm">
                Nenhum resultado encontrado para "{query}"
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto py-2">
                {results.users.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Pessoas
                    </div>
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelect(`/profile/${user.id}`)}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-zinc-200">{user.name}</div>
                          <div className="text-xs text-zinc-500 capitalize">{user.role || 'Membro'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.requests.length > 0 && (
                  <div>
                    <div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Pedidos de Ajuda
                    </div>
                    {results.requests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => handleSelect(`/requests/${request.id}`)}
                        className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-start gap-3 transition-colors"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-medium text-zinc-200 truncate">{request.title}</div>
                          <div className="text-xs text-zinc-500 truncate">{request.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
