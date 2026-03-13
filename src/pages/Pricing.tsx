import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Zap, Star, Shield, Coins, AlertCircle, QrCode, X, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const Pricing = () => {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<'plans' | 'credits'>('plans');
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentError, setPaymentError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ qr_code: string, qr_code_base64?: string, planId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('mp_status');
    if (status === 'failure') {
      setPaymentError(true);
      searchParams.delete('mp_status');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handlePurchase = async (planId: string, itemName: string, price: string) => {
    try {
      setLoading(planId);
      setErrorMessage(null);
      
      // Usar a sessão atual do Supabase de forma direta
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Erro de sessão:', sessionError);
        navigate('/login?redirect=/pricing');
        return;
      }

      console.log('V3: Enviando requisição de pagamento para:', planId);
      const response = await fetch('/api/create-mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: planId,
          userId: session.user.id
        }),
      });

      console.log('Resposta do servidor:', response.status);

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const errorText = data?.error || data?.message || text.substring(0, 100).replace(/<[^>]*>?/gm, '') || response.statusText;
        throw new Error(`Erro no servidor (${response.status}): ${errorText}`);
      }

      if (data.url) {
        console.log('Redirecionando para Mercado Pago:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não retornada pelo servidor');
      }
    } catch (error: any) {
      console.error('Erro detalhado no pagamento:', error);
      
      let msg = 'Erro ao processar pagamento. Tente novamente.';
      
      if (typeof error === 'string') {
        msg = error;
      } else if (error?.message) {
        msg = error.message;
      }

      if (msg.includes('e is not a function')) {
        msg = 'Erro de autenticação. Por favor, saia e entre novamente na sua conta.';
      } else {
        msg = `ERRO NO PAGAMENTO: ${msg}`;
      }
      
      setErrorMessage(msg);
    } finally {
      setLoading(null);
    }
  };

  const handlePixPurchase = async (planId: string) => {
    try {
      setLoading(planId + '_pix');
      setErrorMessage(null);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        navigate('/login?redirect=/pricing');
        return;
      }

      const response = await fetch('/api/create-mercadopago-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: planId,
          userId: session.user.id,
          email: session.user.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar PIX.');
      }

      setPixData({
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64,
        planId: planId
      });
    } catch (error: any) {
      console.error('Erro no PIX:', error);
      setErrorMessage(error.message || 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const confirmPixPayment = async () => {
    if (!pixData) return;
    
    try {
      setLoading('confirming_pix');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let planName = '';
      if (pixData.planId === 'pro_monthly') {
        planName = 'Plano Pro';
      } else if (pixData.planId === 'strategic_monthly') {
        planName = 'Plano Estratégico';
      } else if (pixData.planId === 'credits_5') {
        planName = 'Pacote 5 Créditos';
      } else if (pixData.planId === 'credits_15') {
        planName = 'Pacote 15 Créditos';
      } else if (pixData.planId === 'credits_60') {
        planName = 'Pacote 60 Créditos';
      }

      const message = `Olá! Acabei de realizar o pagamento via PIX para o *${planName}*.\n\nMeu email de cadastro é: ${session.user.email}\n\nSegue o comprovante em anexo.`;
      const whatsappUrl = `https://wa.me/5594991233751?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      setPixData(null);
    } catch (error: any) {
      console.error('Erro ao redirecionar para o WhatsApp:', error);
      setErrorMessage('Erro ao processar. Por favor, envie o comprovante diretamente para o WhatsApp: 94991233751');
    } finally {
      setLoading(null);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      {(paymentError || errorMessage) && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Pagamento não concluído</h3>
            <p className="text-sm opacity-90">{errorMessage || 'Houve um problema ao processar seu pagamento ou ele foi cancelado. Por favor, tente novamente ou entre em contato com o suporte do Ajudaí.'}</p>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">Escolha como quer usar</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
          Você atingiu o limite gratuito de 3 pedidos. Escolha um plano mensal ilimitado ou compre pacotes de créditos avulsos.
        </p>
        
        <div className="inline-flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('plans')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'plans' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Planos Mensais
          </button>
          <button
            onClick={() => setViewMode('credits')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'credits' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" /> Pacotes de Créditos
          </button>
        </div>
      </div>

      {viewMode === 'plans' ? (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Free Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Gratuito</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">Para quem quer começar a ajudar a comunidade.</p>
            <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">R$ 0<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300">Até 3 pedidos de ajuda no total</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300">Responder até 5 pedidos</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300">Perfil básico</span>
              </li>
            </ul>
            
            <Button disabled className="w-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              Plano Atual
            </Button>
          </div>

          {/* PRO Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              MAIS POPULAR
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/30">
              <Star className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Plano PRO</h3>
            <p className="text-zinc-400 mb-6">Para profissionais que querem se destacar.</p>
            <div className="text-4xl font-bold text-white mb-8">R$ 29<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 font-bold text-white">Pedidos ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Perfil destacado nas buscas</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Selo de Profissional Verificado</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Pode oferecer serviços pagos</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Acesso ao AJUDAÍ Academy</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                disabled={profile?.plan === 'pro' || loading === 'pro_monthly'}
                onClick={() => handlePurchase('pro_monthly', 'Plano PRO (Mensal)', 'R$ 29,00')}
                className={`w-full ${profile?.plan === 'pro' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}
              >
                {profile?.plan === 'pro' ? 'Plano Atual' : loading === 'pro_monthly' ? 'Processando...' : 'Cartão/Boleto'}
              </Button>
              <Button 
                disabled={profile?.plan === 'pro' || loading === 'pro_monthly_pix'}
                onClick={() => handlePixPurchase('pro_monthly')}
                variant="outline"
                className={`w-full ${profile?.plan === 'pro' ? 'hidden' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
              >
                {loading === 'pro_monthly_pix' ? 'Gerando PIX...' : <><QrCode className="w-4 h-4 mr-2" /> Pagar com PIX</>}
              </Button>
            </div>
          </div>

          {/* Strategic Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Plano Estratégico</h3>
            <p className="text-zinc-400 mb-6">Para agências e mentores de alto nível.</p>
            <div className="text-4xl font-bold text-white mb-8">R$ 99<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Tudo do plano PRO</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Criar comunidade privada</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Vender mentorias exclusivas</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Analytics avançado do perfil</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 font-bold text-white">Acesso ao AJUDAÍ Labs (IA)</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                disabled={profile?.plan === 'strategic' || loading === 'strategic_monthly'}
                onClick={() => handlePurchase('strategic_monthly', 'Plano Estratégico (Mensal)', 'R$ 99,00')}
                className={`w-full ${profile?.plan === 'strategic' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
              >
                {profile?.plan === 'strategic' ? 'Plano Atual' : loading === 'strategic_monthly' ? 'Processando...' : 'Cartão/Boleto'}
              </Button>
              <Button 
                disabled={profile?.plan === 'strategic' || loading === 'strategic_monthly_pix'}
                onClick={() => handlePixPurchase('strategic_monthly')}
                variant="outline"
                className={`w-full ${profile?.plan === 'strategic' ? 'hidden' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
              >
                {loading === 'strategic_monthly_pix' ? 'Gerando PIX...' : <><QrCode className="w-4 h-4 mr-2" /> Pagar com PIX</>}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Pacote 1 */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative border-emerald-500/20">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pacote Básico</h3>
            <p className="text-zinc-400 mb-6">Ideal para quem precisa de ajuda pontual.</p>
            <div className="text-4xl font-bold text-white mb-8">R$ 15<span className="text-lg text-zinc-500 font-normal">/único</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 font-bold text-white">+5 Créditos (Pedidos)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Créditos não expiram</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handlePurchase('credits_5', 'Pacote Básico (+5 Créditos)', 'R$ 15,00')}
                disabled={loading === 'credits_5'}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {loading === 'credits_5' ? 'Processando...' : 'Cartão/Boleto'}
              </Button>
              <Button 
                disabled={loading === 'credits_5_pix'}
                onClick={() => handlePixPurchase('credits_5')}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                {loading === 'credits_5_pix' ? 'Gerando PIX...' : <><QrCode className="w-4 h-4 mr-2" /> Pagar com PIX</>}
              </Button>
            </div>
          </div>

          {/* Pacote 2 */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              MELHOR CUSTO-BENEFÍCIO
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
              <Coins className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pacote Intermediário</h3>
            <p className="text-zinc-400 mb-6">Para quem usa a plataforma com frequência.</p>
            <div className="text-4xl font-bold text-white mb-8">R$ 29<span className="text-lg text-zinc-500 font-normal">/único</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 font-bold text-white">+15 Créditos (Pedidos)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Créditos não expiram</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Prioridade no suporte</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handlePurchase('credits_15', 'Pacote Intermediário (+15 Créditos)', 'R$ 29,00')}
                disabled={loading === 'credits_15'}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              >
                {loading === 'credits_15' ? 'Processando...' : 'Cartão/Boleto'}
              </Button>
              <Button 
                disabled={loading === 'credits_15_pix'}
                onClick={() => handlePixPurchase('credits_15')}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                {loading === 'credits_15_pix' ? 'Gerando PIX...' : <><QrCode className="w-4 h-4 mr-2" /> Pagar com PIX</>}
              </Button>
            </div>
          </div>

          {/* Pacote 3 */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col relative border-emerald-500/20">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pacote Avançado</h3>
            <p className="text-zinc-400 mb-6">Para agências e alto volume de pedidos.</p>
            <div className="text-4xl font-bold text-white mb-8">R$ 99<span className="text-lg text-zinc-500 font-normal">/único</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 font-bold text-white">+60 Créditos (Pedidos)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Créditos não expiram</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Suporte VIP</span>
              </li>
            </ul>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handlePurchase('credits_60', 'Pacote Avançado (+60 Créditos)', 'R$ 99,00')}
                disabled={loading === 'credits_60'}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                {loading === 'credits_60' ? 'Processando...' : 'Cartão/Boleto'}
              </Button>
              <Button 
                disabled={loading === 'credits_60_pix'}
                onClick={() => handlePixPurchase('credits_60')}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                {loading === 'credits_60_pix' ? 'Gerando PIX...' : <><QrCode className="w-4 h-4 mr-2" /> Pagar com PIX</>}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-12 text-center text-zinc-500 text-sm">
        <p>Os pagamentos são processados de forma segura via Mercado Pago.</p>
        <p>Após a confirmação, seus créditos ou plano serão ativados na sua conta.</p>
      </div>
      {/* PIX Modal */}
      {pixData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setPixData(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pagamento via PIX</h2>
              <p className="text-zinc-400">Escaneie o QR Code ou copie a chave abaixo.</p>
            </div>

            <div className="space-y-6">
              {pixData.qr_code_base64 && (
                <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
                  <img 
                    src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                    alt="QR Code PIX" 
                    className="w-full h-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Chave PIX (Copia e Cola):</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={pixData.qr_code}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-center text-xl font-mono text-white focus:outline-none"
                  />
                  <Button onClick={copyPixCode} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-200 text-center">
                Após realizar a transferência, clique no botão abaixo para nos enviar o comprovante pelo WhatsApp. Seu plano será ativado logo após a verificação.
              </div>

              <Button 
                onClick={confirmPixPayment}
                disabled={loading === 'confirming_pix'}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3"
              >
                {loading === 'confirming_pix' ? 'Redirecionando...' : 'Enviar Comprovante no WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
