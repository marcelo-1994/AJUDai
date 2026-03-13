import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Briefcase, User } from 'lucide-react';
import PedidosList from '../components/PedidosList';
import { Button } from '../components/ui/Button';

export default function Pedidos() {
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Central de Pedidos</h1>
          <p className="text-zinc-400">Encontre oportunidades ou gerencie seus pedidos em andamento.</p>
        </div>
        <Link to="/pedidos/novo">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Pedido
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 mb-8 w-fit">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'available' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Pedidos Disponíveis
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'my' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="h-4 w-4" />
          Meus Pedidos
        </button>
      </div>

      {/* Search & Filter (Mocked for now) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por tipo de serviço ou descrição..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* List */}
      <PedidosList type={activeTab} />
    </div>
  );
}
