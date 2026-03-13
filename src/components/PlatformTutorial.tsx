import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Lightbulb, ArrowRight, Minus, BookOpen, Briefcase, Users, ShoppingBag, PlayCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const PlatformTutorial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user) {
      const tutorialDismissed = localStorage.getItem('tutorial_dismissed');
      if (!tutorialDismissed) {
        // Delay showing the tutorial slightly
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('tutorial_dismissed', 'true');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Update step based on route if they navigate manually while tutorial is open
  useEffect(() => {
    if (!isMinimized && isVisible && user) {
      if (location.pathname === '/pedidos/novo' && step === 0) setStep(1);
      else if (location.pathname === '/explore-projects' && step === 0) setStep(2);
      else if (location.pathname === '/educa' && step === 0) setStep(3);
      else if (location.pathname === '/marketplace' && step === 0) setStep(4);
      else if (location.pathname === '/play' && step === 0) setStep(5);
    }
  }, [location.pathname, step, isMinimized, isVisible, user]);

  if (!user || !isVisible) return null;

  const tutorialSteps = [
    {
      title: "Bem-vindo ao AJUDAÍ!",
      content: "O que você deseja fazer? Posso te guiar pela plataforma para você aproveitar ao máximo.",
      options: [
        { label: "Preciso de ajuda com um projeto", icon: <Briefcase className="w-4 h-4" />, action: () => { navigate('/pedidos/novo'); setStep(1); } },
        { label: "Quero oferecer meus serviços", icon: <Users className="w-4 h-4" />, action: () => { navigate('/explore-projects'); setStep(2); } },
        { label: "Quero aprender (Cursos)", icon: <BookOpen className="w-4 h-4" />, action: () => { navigate('/educa'); setStep(3); } },
        { label: "Comprar ferramentas", icon: <ShoppingBag className="w-4 h-4" />, action: () => { navigate('/marketplace'); setStep(4); } },
        { label: "Assistir Masterclasses", icon: <PlayCircle className="w-4 h-4" />, action: () => { navigate('/play'); setStep(5); } },
        { label: "Apenas explorar sozinho", icon: null, action: () => { handleMinimize(); } }
      ]
    },
    {
      title: "Criando um Pedido",
      content: "Aqui você pode descrever o que precisa. Seja claro e detalhista para atrair os melhores profissionais! Preencha o formulário e clique em 'Publicar Pedido'.",
      options: [
        { label: "Entendi, obrigado!", icon: null, action: () => handleMinimize() },
        { label: "Voltar às opções", icon: null, action: () => setStep(0) }
      ]
    },
    {
      title: "Explorando Projetos",
      content: "Nesta tela você vê pedidos de outras pessoas. Se você sabe como resolver, clique em 'Ajudar' e faça sua proposta para o cliente!",
      options: [
        { label: "Entendi, obrigado!", icon: null, action: () => handleMinimize() },
        { label: "Voltar às opções", icon: null, action: () => setStep(0) }
      ]
    },
    {
      title: "AJUDAÍ Educa",
      content: "Aqui você encontra cursos e trilhas de aprendizado para evoluir suas habilidades. Escolha um curso e comece a estudar!",
      options: [
        { label: "Entendi, obrigado!", icon: null, action: () => handleMinimize() },
        { label: "Voltar às opções", icon: null, action: () => setStep(0) }
      ]
    },
    {
      title: "Marketplace",
      content: "Descubra ferramentas, templates e recursos criados pela comunidade. Você pode comprar ou até vender suas próprias criações aqui.",
      options: [
        { label: "Entendi, obrigado!", icon: null, action: () => handleMinimize() },
        { label: "Voltar às opções", icon: null, action: () => setStep(0) }
      ]
    },
    {
      title: "AJUDAÍ Play",
      content: "Assista a masterclasses exclusivas com especialistas. Conteúdo premium para acelerar sua carreira e seus projetos.",
      options: [
        { label: "Entendi, obrigado!", icon: null, action: () => handleMinimize() },
        { label: "Voltar às opções", icon: null, action: () => setStep(0) }
      ]
    }
  ];

  const currentStep = tutorialSteps[step] || tutorialSteps[0];

  return (
    <div className={`fixed z-[100] transition-all duration-500 ${isMinimized ? 'bottom-6 left-6' : 'bottom-6 left-6 md:bottom-10 md:left-10'}`}>
      {isMinimized ? (
        <button 
          onClick={handleMinimize}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center transition-transform hover:scale-110 border border-indigo-400/30"
          title="Abrir Tutorial"
        >
          <Lightbulb className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-zinc-900 border border-indigo-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-6 w-[320px] md:w-[380px] relative overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-bold text-white">{currentStep.title}</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={handleMinimize} className="text-zinc-500 hover:text-white transition-colors" title="Minimizar">
                <Minus className="w-5 h-5" />
              </button>
              <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors" title="Fechar Tutorial">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            {currentStep.content}
          </p>
          
          <div className="space-y-2">
            {currentStep.options.map((opt, idx) => (
              <Button 
                key={idx}
                onClick={opt.action}
                variant={idx === currentStep.options.length - 1 && step === 0 ? "outline" : "default"}
                className={`w-full justify-start text-sm ${
                  idx === currentStep.options.length - 1 && step === 0 
                    ? 'border-white/10 text-zinc-400 hover:text-white mt-4' 
                    : 'bg-white/5 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500'
                }`}
              >
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                <span className="flex-1 text-left">{opt.label}</span>
                {idx !== currentStep.options.length - 1 || step !== 0 ? <ArrowRight className="w-4 h-4 ml-2 opacity-50" /> : null}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
