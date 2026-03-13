import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, CheckCircle2, Star, Users, Heart, Share2, Smartphone, MessageCircle } from 'lucide-react';
import { ActionTargetButton } from '../components/ActionTargetButton';

export const Home = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('ajudai_affiliate_ref', ref);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-24">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-20 pb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">
          Ajuda mútua que <span className="text-indigo-600 dark:text-indigo-400">transforma</span> vidas.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Conecte-se com profissionais e pessoas dispostas a ajudar. Peça suporte, ofereça seus serviços e construa uma reputação sólida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto text-lg h-14 px-8">
              Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/requests">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
              Explorar Pedidos
            </Button>
          </Link>
        </div>
      </section>

      {/* Action Target Button */}
      <ActionTargetButton />

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <div className="glass-panel flex flex-col items-center text-center p-8 rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
            <Users className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Comunidade Ativa</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Milhares de pessoas prontas para ajudar ou precisando do seu conhecimento.
          </p>
        </div>
        <div className="glass-panel flex flex-col items-center text-center p-8 rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Pedidos Resolvidos</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Acompanhe o status e garanta que sua necessidade seja atendida com qualidade.
          </p>
        </div>
        <div className="glass-panel flex flex-col items-center text-center p-8 rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-500/30">
            <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Reputação e Níveis</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Ganhe pontos, suba no ranking e destaque-se como um profissional de excelência.
          </p>
        </div>
      </section>

      {/* Tutorial: Como Funciona */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">Como Funciona?</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
            Três passos simples para você começar a transformar vidas e resolver seus problemas na plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-black border-2 border-indigo-500 flex items-center justify-center text-3xl font-bold text-zinc-900 dark:text-white mb-6 shadow-[0_0_30px_rgba(79,70,229,0.2)] dark:shadow-[0_0_30px_rgba(79,70,229,0.3)]">
              1
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Crie sua Conta</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Cadastre-se gratuitamente em menos de 1 minuto. Preencha seu perfil para gerar confiança na comunidade.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-black border-2 border-purple-500 flex items-center justify-center text-3xl font-bold text-zinc-900 dark:text-white mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] dark:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              2
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Peça ou Ofereça</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Crie um pedido detalhando o que você precisa, ou navegue pelos pedidos abertos para oferecer sua ajuda.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-black border-2 border-emerald-500 flex items-center justify-center text-3xl font-bold text-zinc-900 dark:text-white mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              3
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Conecte e Resolva</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Converse, resolva o problema e avalie a experiência. Ganhe pontos de reputação a cada ajuda finalizada!
            </p>
          </div>
        </div>
      </section>

      {/* Marketing & Support Developer */}
      <section className="max-w-4xl mx-auto px-4 w-full">
        <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden text-center border-indigo-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 z-0 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20">
              <Heart className="h-10 w-10 text-white fill-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Precisa de Suporte?</h2>
            <p className="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              O AJUDAÍ foi desenvolvido para conectar pessoas. Se você tiver dúvidas, sugestões ou precisar de ajuda com a plataforma, entre em contato com nosso suporte!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://wa.me/5594991233751?text=Olá!%20Preciso%20de%20suporte%20no%20AJUDAÍ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <MessageCircle className="mr-2 h-5 w-5" /> Suporte no WhatsApp
                </Button>
              </a>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  navigator.clipboard.writeText('https://ais-pre-mjiio57dtibbs5nub44st7-23870596290.us-west2.run.app');
                  alert('Link copiado para a área de transferência!');
                }}
              >
                <Share2 className="mr-2 h-5 w-5" /> Compartilhar Link
              </Button>
            </div>
            <p className="mt-6 text-sm text-zinc-500">
              Contato Direto: (94) 99123-3751
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-12 text-center text-white max-w-5xl mx-auto w-full mb-12 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para fazer a diferença?</h2>
        <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
          Junte-se ao AJUDAÍ hoje mesmo. É grátis para começar e você pode evoluir para planos profissionais quando quiser.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100 text-lg h-14 px-10">
            Criar Conta Gratuita
          </Button>
        </Link>
      </section>

      {/* Inspiration Note */}
      <section className="text-center pb-12 opacity-50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
          Inspirado em plataformas de sucesso como GetNinjas e outros ecossistemas de serviços e ajuda mútua.
          <br />
          Desenvolvido para fortalecer a economia colaborativa.
        </p>
      </section>
    </div>
  );
};
