import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, DollarSign, FileText, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export default function CreatePedido() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo_servico: '',
    descricao: '',
    tipo: 'online',
    valor: '',
    localizacao: '',
    telefone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      // Append contact info to description if provided
      let finalDescription = formData.descricao;
      if (formData.telefone || formData.email) {
        finalDescription += '\n\n--- Contato ---\n';
        if (formData.telefone) finalDescription += `Telefone/WhatsApp: ${formData.telefone}\n`;
        if (formData.email) finalDescription += `E-mail: ${formData.email}\n`;
      }

      const { data, error } = await supabase
        .from('pedidos')
        .insert([
          {
            cliente_id: user.id,
            tipo_servico: formData.tipo_servico,
            descricao: finalDescription,
            tipo: formData.tipo,
            valor: formData.valor ? parseFloat(formData.valor) : null,
            localizacao: formData.tipo === 'presencial' ? formData.localizacao : null,
            status: 'aguardando_aceite'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || 'Erro ao criar pedido no banco de dados.');
      }

      setPedidoId(data.id);
      setSuccess(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="p-6 glass-panel rounded-3xl border-emerald-500/30 bg-emerald-500/5">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pedido Criado!</h2>
          <p className="text-zinc-400 mb-6">Seu pedido foi publicado e profissionais já podem visualizá-lo.</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate(`/pedidos/${pedidoId}`)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
            >
              Ver Detalhes do Pedido
            </Button>
            
            <Button 
              onClick={() => {
                const url = `${window.location.origin}/pedidos/${pedidoId}`;
                const text = encodeURIComponent(`Confira este pedido de ajuda no AJUDAÍ+: ${formData.tipo_servico}\n${url}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Compartilhar no WhatsApp
            </Button>
            
            <Button 
              onClick={() => navigate('/dashboard?tab=pedidos')}
              className="bg-white/5 hover:bg-white/10 text-white w-full"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Novo Pedido de Ajuda</h1>
        <p className="text-zinc-400">Detalhe o que você precisa e receba propostas de profissionais qualificados.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">O que você precisa?</label>
            <input
              required
              type="text"
              placeholder="Ex: Design de Logo, Conserto de Ar Condicionado..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.tipo_servico}
              onChange={e => setFormData({ ...formData, tipo_servico: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição Detalhada</label>
            <textarea
              required
              rows={4}
              placeholder="Descreva os detalhes do serviço, prazos e expectativas..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              value={formData.descricao}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Telefone / WhatsApp (Opcional)</label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.telefone}
                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail de Contato (Opcional)</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo de Atendimento</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'online' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.tipo === 'online' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'presencial' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.tipo === 'presencial' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Presencial
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Valor Sugerido (Opcional)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
            </div>
          </div>

          {formData.tipo === 'presencial' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  required
                  type="text"
                  placeholder="Cidade, Bairro ou Endereço"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.localizacao}
                  onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Publicar Pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
}
