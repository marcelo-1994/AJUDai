import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Settings, Send, CheckCircle2, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { motion } from 'motion/react';

export default function AIAssistant() {
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const handleTestBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber || !testMessage) return;

    setStatus('loading');
    try {
      // We simulate a webhook call to test the bot logic
      const response = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                messages: [{
                  from: testNumber.replace(/\D/g, ''),
                  text: { body: testMessage }
                }]
              }
            }]
          }]
        })
      });

      if (response.ok) {
        setStatus('success');
        setTestMessage('');
      } else {
        throw new Error('Falha ao processar mensagem de teste');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <MessageSquare className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Assistente de IA WhatsApp</h1>
            <p className="text-zinc-400">Configure e gerencie seu bot oficial do AJUDAÍ+</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Configuration Steps */}
          <div className="md:col-span-2 space-y-6">
            <section className="glass-panel p-8 rounded-3xl border-white/5">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Configuração do Webhook
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">URL do Webhook (Callback URL)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={webhookUrl}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm"
                    />
                    <button 
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      <Copy className="h-5 w-5 text-zinc-400" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">Configure esta URL no painel do Meta for Developers.</p>
                </div>

                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Variáveis de Ambiente Necessárias
                  </h3>
                  <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                    <li><code className="text-indigo-400">WHATSAPP_VERIFY_TOKEN</code>: O token que você definiu no Meta.</li>
                    <li><code className="text-indigo-400">WHATSAPP_ACCESS_TOKEN</code>: Token de acesso permanente do sistema.</li>
                    <li><code className="text-indigo-400">WHATSAPP_PHONE_NUMBER_ID</code>: ID do número de telefone da API.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="glass-panel p-8 rounded-3xl border-white/5">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-emerald-400" />
                Guia Rápido
              </h2>
              <div className="space-y-4">
                {[
                  { step: 1, text: 'Crie um App no Meta for Developers (Tipo: Business).' },
                  { step: 2, text: 'Adicione o produto "WhatsApp" ao seu App.' },
                  { step: 3, text: 'Configure o Webhook usando a URL acima.' },
                  { step: 4, text: 'Assine os campos "messages" no painel de Webhooks.' },
                  { step: 5, text: 'Adicione as chaves no ambiente do AJUDAÍ+.' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {item.step}
                    </span>
                    <p className="text-sm text-zinc-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Test Bot */}
          <div className="space-y-6">
            <section className="glass-panel p-8 rounded-3xl border-white/5 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-400" />
                Testar Assistente
              </h2>
              
              <form onSubmit={handleTestBot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Seu Número (com DDI)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 5511999999999"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Mensagem de Teste</label>
                  <textarea 
                    rows={3}
                    placeholder="Olá, como o AJUDAÍ+ funciona?"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? 'Processando...' : 'Enviar Teste'}
                  <Send className="h-4 w-4" />
                </button>

                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Mensagem enviada! Verifique seu WhatsApp.
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-5 w-5" />
                    {errorMsg}
                  </motion.div>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
