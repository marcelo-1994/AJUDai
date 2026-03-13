import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, FileText } from 'lucide-react';

export const Contract = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const acceptContract = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: profile.id,
          name: profile.name,
          email: profile.email,
          contract_accepted: true 
        });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      // Refresh or redirect
      window.location.reload(); // Simple way to re-check the guard
    } catch (error: any) {
      console.error('Error accepting contract:', error);
      alert(`Erro ao aceitar contrato: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-indigo-600" />
        <h2 className="text-2xl font-bold">Termos de Uso e Contrato</h2>
      </div>
      
      <div className="prose dark:prose-invert max-h-[400px] overflow-y-auto mb-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm">
        <h3>1. Introdução</h3>
        <p>Este contrato estabelece os termos e condições para o uso da plataforma AJUDAÍ+...</p>
        <h3>2. Direitos Reservados</h3>
        <p>Todos os direitos sobre o conteúdo, software e marca AJUDAÍ+ são reservados...</p>
        <h3>3. Obrigações do Usuário</h3>
        <p>O usuário se compromete a utilizar a plataforma de forma ética e legal...</p>
        <p>...</p>
        <p>Este contrato é detalhado e vinculante.</p>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-800 dark:text-indigo-200">
        <p className="font-bold mb-2">Precisa de ajuda?</p>
        <p>Se tiver dúvidas sobre o contrato, nossa equipe de suporte está pronta para ajudar. Clique no botão abaixo para conversar com um assistente.</p>
        <a 
          href="https://wa.me/5594991233751" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-medium"
        >
          Falar com Assistente
        </a>
      </div>

      <Button onClick={acceptContract} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Li e aceito os termos do contrato'}
      </Button>
    </div>
  );
};
