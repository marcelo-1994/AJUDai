import React, { useState, useEffect } from 'react';
import { Link2, Webhook, Github, MessageCircle, CheckCircle, ExternalLink, RefreshCw, Loader2, CreditCard, Linkedin, Twitter, Instagram, Facebook, Youtube, Twitch, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const initialIntegrations = [
  {
    id: 'business_site',
    name: 'Negócio Online / Site',
    description: 'Conecte seu site ou empresa ao ecossistema AJUDAÍ+ e faça parte da nossa comunidade de serviço mútuo.',
    icon: <Globe className="h-8 w-8 text-sky-400" />,
    status: 'disconnected',
    color: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Receba notificações de novos pedidos e mensagens diretamente no seu WhatsApp.',
    icon: <MessageCircle className="h-8 w-8 text-emerald-500" />,
    status: 'connected',
    color: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Receba pagamentos via PIX, boleto e cartão de crédito com as melhores taxas do mercado.',
    icon: <CreditCard className="h-8 w-8 text-[#009EE3]" />,
    status: 'disconnected',
    color: 'bg-[#009EE3]/10 border-[#009EE3]/20',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sincronize seus repositórios e mostre seus projetos no seu perfil.',
    icon: <Github className="h-8 w-8 text-zinc-300" />,
    status: 'disconnected',
    color: 'bg-zinc-500/10 border-zinc-500/20',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Conecte-se ao servidor da comunidade e receba alertas de vagas.',
    icon: <Webhook className="h-8 w-8 text-[#5865F2]" />,
    status: 'disconnected',
    color: 'bg-[#5865F2]/10 border-[#5865F2]/20',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Compartilhe seu perfil e projetos profissionais diretamente na sua rede.',
    icon: <Linkedin className="h-8 w-8 text-[#0A66C2]" />,
    status: 'disconnected',
    color: 'bg-[#0A66C2]/10 border-[#0A66C2]/20',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    description: 'Divulgue suas atualizações e interaja com a comunidade tech.',
    icon: <Twitter className="h-8 w-8 text-[#1DA1F2]" />,
    status: 'disconnected',
    color: 'bg-[#1DA1F2]/10 border-[#1DA1F2]/20',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Conecte seu perfil para compartilhar seu portfólio visual.',
    icon: <Instagram className="h-8 w-8 text-[#E1306C]" />,
    status: 'disconnected',
    color: 'bg-[#E1306C]/10 border-[#E1306C]/20',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Alcance mais pessoas compartilhando seus serviços na rede.',
    icon: <Facebook className="h-8 w-8 text-[#1877F2]" />,
    status: 'disconnected',
    color: 'bg-[#1877F2]/10 border-[#1877F2]/20',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Vincule seu canal para mostrar tutoriais e demonstrações.',
    icon: <Youtube className="h-8 w-8 text-[#FF0000]" />,
    status: 'disconnected',
    color: 'bg-[#FF0000]/10 border-[#FF0000]/20',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Mostre suas transmissões ao vivo de codificação e desenvolvimento.',
    icon: <Twitch className="h-8 w-8 text-[#9146FF]" />,
    status: 'disconnected',
    color: 'bg-[#9146FF]/10 border-[#9146FF]/20',
  }
];

export const Integrations = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [businessData, setBusinessData] = useState({ siteUrl: '', businessName: '' });

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          
          setIntegrations(prev => prev.map(integration => {
            if (integration.id === 'mercadopago' && data.mercadopago) {
              return { ...integration, status: 'connected' };
            }
            return integration;
          }));
        }
        
        // Check user profile for business site status
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('business_site, business_status')
            .eq('id', user.id)
            .single();
            
          if (profile?.business_site) {
            setIntegrations(prev => prev.map(integration => 
              integration.id === 'business_site' 
                ? { ...integration, status: profile.business_status === 'active' ? 'connected' : 'pending' } 
                : integration
            ));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar integrações:', error);
      }
    };

    checkIntegrations();
  }, [user]);

  const handleConnect = async (id: string) => {
    if (id === 'business_site') {
      setIsBusinessModalOpen(true);
      return;
    }

    setLoadingId(id);
    
    // Simulando uma chamada de API ou redirecionamento OAuth
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { ...integration, status: 'connected' } 
            : integration
        )
      );
      setLoadingId(null);
      
      if (id === 'stripe') {
        window.open('https://dashboard.stripe.com/register', '_blank');
      } else if (id === 'mercadopago') {
        window.open('https://www.mercadopago.com.br/developers/panel/credentials', '_blank');
      } else if (id === 'github') {
        window.open('https://github.com/login', '_blank');
      } else if (id === 'discord') {
        window.open('https://discord.com/login', '_blank');
      } else if (id === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ais-pre-mjiio57dtibbs5nub44st7-23870596290.us-west2.run.app')}`, '_blank');
      } else if (id === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent('https://ais-pre-mjiio57dtibbs5nub44st7-23870596290.us-west2.run.app')}&text=Confira%20este%20projeto%20incr%C3%ADvel!`, '_blank');
      } else if (id === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://ais-pre-mjiio57dtibbs5nub44st7-23870596290.us-west2.run.app')}`, '_blank');
      } else if (id === 'instagram') {
        window.open('https://www.instagram.com/', '_blank');
      } else if (id === 'youtube') {
        window.open('https://studio.youtube.com/', '_blank');
      } else if (id === 'twitch') {
        window.open('https://dashboard.twitch.tv/', '_blank');
      }
    }, 1500);
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Você precisa estar logado para conectar seu negócio.');
    
    setLoadingId('business_site');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/integrations/business-site', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(businessData)
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setIsBusinessModalOpen(false);
        setIntegrations(prev => prev.map(integration => 
          integration.id === 'business_site' ? { ...integration, status: 'pending' } : integration
        ));
      } else {
        alert(data.error || 'Erro ao solicitar integração.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDisconnect = (id: string) => {
    if (window.confirm('Tem certeza que deseja desconectar esta integração?')) {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { ...integration, status: 'disconnected' } 
            : integration
        )
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
          <Link2 className="h-8 w-8 text-indigo-400" />
          Integrações
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Conecte o AJUDAÍ com suas ferramentas favoritas para automatizar seu fluxo de trabalho, receber notificações e gerenciar pagamentos.
        </p>
      </div>

      {/* Business Support Highlight */}
      <div className="mb-12 glass-panel p-8 rounded-[2rem] border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Globe className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Globe className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Apoiamos seu Negócio Online 🤝</h2>
          </div>
          <p className="text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Todo negócio ou empresa que possui um site online pode fazer parte do ecossistema AJUDAÍ+. 
            Nossa missão é fortalecer a comunidade de serviço mútuo, integrando sua plataforma para que possamos crescer juntos.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleConnect('business_site')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/20"
            >
              Conectar meu Negócio
            </Button>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className={`glass-panel p-6 rounded-3xl border ${integration.color} transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] flex flex-col`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 shadow-inner shrink-0">
                  {integration.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{integration.name}</h3>
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" /> Conectado
                      </span>
                    ) : integration.status === 'pending' ? (
                      <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Em Validação
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                        Não conectado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
              {integration.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white px-0">
                Ver Documentação <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              
              {integration.status === 'connected' ? (
                <Button 
                  onClick={() => handleDisconnect(integration.id)}
                  variant="outline" 
                  size="sm" 
                  className="border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                >
                  Desconectar
                </Button>
              ) : (
                <Button 
                  onClick={() => handleConnect(integration.id)}
                  disabled={loadingId === integration.id}
                  size="sm" 
                  className="bg-white/10 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500 min-w-[110px]"
                >
                  {loadingId === integration.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Conectar <RefreshCw className="h-3 w-3 ml-2" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Business Integration Modal */}
      <AnimatePresence>
        {isBusinessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-panel p-8 rounded-[2rem] border-indigo-500/30 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsBusinessModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Globe className="h-6 w-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Conectar Negócio</h2>
              </div>

              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Nome da Empresa</label>
                  <input
                    type="text"
                    required
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    placeholder="Ex: Minha Loja Online"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">URL do Site</label>
                  <input
                    type="url"
                    required
                    value={businessData.siteUrl}
                    onChange={(e) => setBusinessData({ ...businessData, siteUrl: e.target.value })}
                    placeholder="https://meusite.com.br"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Ao solicitar a integração, nossa equipe analisará seu site para garantir que ele atenda aos padrões da comunidade AJUDAÍ+. Você receberá uma notificação quando for aprovado.
                </p>
                <Button 
                  type="submit"
                  disabled={loadingId === 'business_site'}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold"
                >
                  {loadingId === 'business_site' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Solicitação'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
