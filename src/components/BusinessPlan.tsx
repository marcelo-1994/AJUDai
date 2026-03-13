import React, { useState, useEffect } from 'react';
import { HelpCircle, X, TrendingUp, Users, DollarSign, Heart, Target, ShieldCheck, Zap, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';

export const BusinessPlan = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Randomly show the button
  useEffect(() => {
    const showRandomly = () => {
      setIsVisible(true);
      // Hide after some time if not hovered/clicked? Or just keep it visible once it appears.
      // Let's make it appear after a random delay between 5s and 15s
    };

    const timer = setTimeout(showRandomly, Math.random() * 10000 + 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center hover:bg-indigo-500 transition-colors group"
            title="Plano de Negócios"
          >
            <HelpCircle className="w-7 h-7" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              Ver Plano de Negócios
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Plano de Negócios</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">Ecossistema AJUDAÍ+</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Visão Geral */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <Heart className="w-6 h-6 text-emerald-500" />
                      <h3>1. Propósito & Visão</h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      O AJUDAÍ é uma plataforma de serviço mútuo que conecta pessoas que precisam de ajuda com profissionais e voluntários locais. Nossa visão é criar a maior rede de confiança e colaboração do mundo, monetizando a conveniência e a expertise.
                    </p>
                  </div>

                  {/* Modelo de Receita */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <DollarSign className="w-6 h-6 text-indigo-500" />
                      <h3>2. Fontes de Receita</h3>
                    </div>
                    <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>Taxa de Intermediação (Take Rate):</strong> 10% a 15% sobre serviços pagos contratados via plataforma.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>AJUDAÍ Play (Pay-per-view):</strong> Retenção de 10% sobre a venda de masterclasses e conteúdos em vídeo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>Assinatura Premium (Profissionais):</strong> Mensalidade para maior destaque nas buscas, selo de verificação e analytics avançado.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Estratégia de Crescimento */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <TrendingUp className="w-6 h-6 text-purple-500" />
                      <h3>3. Aquisição & Retenção</h3>
                    </div>
                    <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span><strong>Sistema de Afiliados:</strong> Usuários ganham créditos ao convidar novos clientes e profissionais.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span><strong>Conteúdo Viral (Play):</strong> Vídeos curtos gratuitos funcionam como isca para atrair tráfego orgânico.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span><strong>Gamificação:</strong> Sistema de reputação, níveis e badges para incentivar o engajamento contínuo.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Vantagem Competitiva */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <ShieldCheck className="w-6 h-6 text-sky-500" />
                      <h3>4. Diferenciais (Moat)</h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Diferente de marketplaces tradicionais, o AJUDAÍ combina <strong>serviços locais</strong> com <strong>consumo de conteúdo (Play)</strong> e <strong>ferramentas de gestão (Integrações)</strong>. Criamos um efeito de rede onde o profissional não apenas vende seu tempo, mas também escala seu conhecimento.
                    </p>
                  </div>

                  {/* Excelência Técnica */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <h3>5. Excelência Técnica</h3>
                    </div>
                    <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        <span><strong>Performance Extrema:</strong> Implementação de Code Splitting (Lazy Loading) e Memoização avançada para carregamento instantâneo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        <span><strong>Segurança Robusta:</strong> Fluxo de 2FA customizável e proteção de dados via Supabase RLS (Row Level Security).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        <span><strong>Escalabilidade:</strong> Arquitetura orientada a componentes e serviços desacoplados para suportar milhões de usuários.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Roadmap de Engenharia */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <Rocket className="w-6 h-6 text-indigo-500" />
                      <h3>6. Roadmap de Engenharia</h3>
                    </div>
                    <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>IA Preditiva:</strong> Algoritmo para sugerir profissionais antes mesmo do cliente terminar a descrição do pedido.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span><strong>Mobile Nativo:</strong> Desenvolvimento de apps iOS/Android usando React Native para notificações push em tempo real.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <Button onClick={() => setIsOpen(false)} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-8">
                    Entendido
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
