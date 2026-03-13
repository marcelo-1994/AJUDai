import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Globe, User, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

export const Search = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    users: any[];
    requests: any[];
    aiResponse: string | null;
  }>({ users: [], requests: [], aiResponse: null });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults({ users: [], requests: [], aiResponse: null });

    try {
      // 1. Internal Search
      const [usersRes, requestsRes] = await Promise.all([
        supabase.from('users').select('id, name, role, avatar_url').ilike('name', `%${query}%`).limit(5),
        supabase.from('help_requests').select('id, title, description').or(`title.ilike.%${query}%,description.ilike.%${query}%`).limit(5)
      ]);

      // 2. AI Search
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResults({
        users: usersRes.data || [],
        requests: requestsRes.data || [],
        aiResponse: response.text || "Nenhuma resposta da IA."
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Busca AJUDAÍ+</h1>
      
      <form onSubmit={handleSearch} className="relative mb-12">
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 border border-white/10 rounded-full bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-lg"
          placeholder="O que você procura?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400" />
        <Button type="submit" className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 rounded-full px-6">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Buscar'}
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      )}

      {!loading && (results.users.length > 0 || results.requests.length > 0 || results.aiResponse) && (
        <div className="space-y-8">
          {results.aiResponse && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-400" /> Pesquisa Geral (IA)
              </h2>
              <div className="text-zinc-300 leading-relaxed">{results.aiResponse}</div>
            </div>
          )}

          {(results.users.length > 0 || results.requests.length > 0) && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Resultados na Plataforma</h2>
              <div className="space-y-4">
                {results.users.map(user => (
                  <div key={user.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                    <User className="h-5 w-5 text-indigo-400" />
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                ))}
                {results.requests.map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">{req.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
