import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Star, Medal, Award } from 'lucide-react';

export const Ranking = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, reputation_score, plan')
      .order('reputation_score', { ascending: false })
      .limit(50);

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const getLevel = (score: number) => {
    return Math.floor(Math.sqrt((score || 0) / 10)) + 1;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Ranking de Profissionais</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Os melhores profissionais da plataforma, classificados por sua reputação e contribuição para a comunidade.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Carregando ranking...</div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-sm font-medium text-zinc-400 uppercase tracking-wider">
            <div className="col-span-2 md:col-span-1 text-center">Posição</div>
            <div className="col-span-7 md:col-span-5">Profissional</div>
            <div className="hidden md:block md:col-span-2 text-center">Nível</div>
            <div className="col-span-3 md:col-span-4 text-right md:text-center">Reputação</div>
          </div>

          <div className="divide-y divide-white/5">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/user/${user.id}`}
              >
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {index === 0 ? (
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  ) : index === 1 ? (
                    <Medal className="h-8 w-8 text-zinc-300" />
                  ) : index === 2 ? (
                    <Medal className="h-8 w-8 text-amber-600" />
                  ) : (
                    <span className="text-xl font-bold text-zinc-500">#{index + 1}</span>
                  )}
                </div>
                
                <div className="col-span-7 md:col-span-5 flex items-center gap-4">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {user.name || 'Usuário Anônimo'}
                      {user.plan === 'pro' && <span className="text-[10px] uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                      {user.plan === 'strategic' && <span className="text-[10px] uppercase tracking-wider bg-purple-500 text-white px-2 py-0.5 rounded-full">VIP</span>}
                    </h3>
                  </div>
                </div>

                <div className="hidden md:flex md:col-span-2 justify-center items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  <span className="font-bold text-zinc-300">Lvl {getLevel(user.reputation_score)}</span>
                </div>

                <div className="col-span-3 md:col-span-4 flex justify-end md:justify-center items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-xl">{user.reputation_score || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
