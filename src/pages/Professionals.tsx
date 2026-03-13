import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Award, Loader2, CheckCircle, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export const Professionals = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        // Assuming we have a 'professionals' view or we query users with a specific role/flag
        // For now, let's just query users who have a bio or skills
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .not('bio', 'is', null)
          .limit(20);

        if (error) throw error;
        setProfessionals(data || []);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  const handleContact = (phone: string | null, name: string) => {
    if (!phone) {
      alert('Este profissional não disponibilizou um número de contato.');
      return;
    }
    const message = encodeURIComponent(`Olá ${name}! Encontrei seu perfil no AJUDAÍ e gostaria de conversar sobre um serviço.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const filteredProfessionals = professionals.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Award className="h-10 w-10 text-indigo-400" />
            Profissionais
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Encontre os melhores talentos da comunidade para te ajudar com seus projetos.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, habilidade ou profissão..." 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 text-lg shadow-inner"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 py-4 px-6 rounded-2xl h-auto">
          <Filter className="h-5 w-5 mr-2" /> Filtros
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <Award className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Nenhum profissional encontrado</h3>
          <p className="text-zinc-400">Tente buscar por outros termos ou habilidades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((prof) => (
            <div key={prof.id} className="glass-panel p-6 rounded-3xl flex flex-col relative group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                  {prof.avatar_url ? (
                    <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                      {prof.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                    {prof.name}
                    {prof.is_verified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                    {prof.is_educa_certified && <GraduationCap className="h-4 w-4 text-emerald-400" />}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-zinc-400 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{prof.location || 'Remoto'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-medium text-sm">5.0</span>
                    <span className="text-zinc-500 text-xs ml-1">(12 avaliações)</span>
                  </div>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm mb-6 line-clamp-3 flex-1">
                {prof.bio || 'Profissional da comunidade AJUDAÍ.'}
              </p>
              
              {prof.skills && prof.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {prof.skills.slice(0, 3).map((skill: string, idx: number) => (
                    <span key={idx} className="bg-white/5 border border-white/10 text-zinc-300 px-2 py-1 rounded-md text-xs">
                      {skill}
                    </span>
                  ))}
                  {prof.skills.length > 3 && (
                    <span className="bg-white/5 border border-white/10 text-zinc-500 px-2 py-1 rounded-md text-xs">
                      +{prof.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 mt-auto">
                <Button 
                  onClick={() => window.location.href = `/user/${prof.id}`}
                  variant="outline"
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  Ver Perfil
                </Button>
                <Button 
                  onClick={() => handleContact(prof.phone, prof.name)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 transition-colors"
                >
                  Contato
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
