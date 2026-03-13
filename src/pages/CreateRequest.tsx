import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { PermissionGuard } from '../components/PermissionGuard';

export const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [improving, setImproving] = useState(false);

  const handleImproveWithAI = async () => {
    if (!title && !description) {
      setError('Por favor, preencha o título ou a descrição antes de usar a IA.');
      return;
    }

    try {
      setImproving(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar logado.');
      }

      const response = await fetch('/api/improve-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ title, description }),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error('Erro inesperado ao processar resposta do servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao melhorar a descrição com IA.');
      }

      setDescription(data.improvedDescription);
    } catch (err: any) {
      console.error('Error improving with AI:', err);
      setError('Erro ao usar a IA. Tente novamente.');
    } finally {
      setImproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const { error: insertError } = await supabase.from('help_requests').insert([
        {
          title,
          description,
          category,
          location,
          phone,
          user_id: user.id,
          status: 'open'
        }
      ]);

      if (insertError) throw insertError;
      
      // Trigger n8n Webhook
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetch('/api/admin/trigger-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            event: 'request:created',
            data: { title, category, location }
          })
        }).catch(err => console.error('Error triggering webhook:', err));
      }
      
      navigate('/requests');
    } catch (err: any) {
      console.error('Error creating request:', err);
      setError('Erro ao criar pedido. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </button>
      
      <div className="glass-panel p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Novo Pedido de Ajuda</h1>
        <p className="text-zinc-400 mb-8">Descreva o que você precisa para que a comunidade possa te ajudar.</p>
        
        <PermissionGuard permission="create_requests">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Título</label>
              <input
                required
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
              <textarea
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Criar Pedido'}
            </Button>
          </form>
        </PermissionGuard>
      </div>
    </div>
  );
};
