import React, { useState, useEffect } from 'react';
import { Sparkles, Search, PlusCircle, Star, CheckCircle, X } from 'lucide-react';
import { Button } from './ui/Button';
import { AjudaIcon } from './AjudaIcon';

const steps = [
  {
    title: "Bem-vindo ao AJUDAÍ+! 🚀",
    description: "Estamos muito felizes em ter você aqui. Vamos fazer um tour rápido para você entender como a plataforma funciona e como pode começar a ajudar (ou ser ajudado!).",
    icon: <AjudaIcon className="w-16 h-16 text-indigo-500" />
  },
  {
    title: "Explore Pedidos 🔍",
    description: "No seu painel, você verá uma lista de pessoas precisando de ajuda. Você pode filtrar por categoria e oferecer sua expertise para resolver problemas.",
    icon: <Search className="w-12 h-12 text-emerald-500" />
  },
  {
    title: "Peça Ajuda 📝",
    description: "Travou em algum problema? Clique em 'Novo Pedido' no menu. Descreva sua necessidade e, se quiser, ofereça um valor financeiro para atrair os melhores profissionais.",
    icon: <PlusCircle className="w-12 h-12 text-blue-500" />
  },
  {
    title: "Construa sua Reputação ⭐",
    description: "Sempre que você ajuda alguém e a pessoa aceita sua resposta, você ganha pontos! Suba de nível e destaque-se no ranking de profissionais da plataforma.",
    icon: <Star className="w-12 h-12 text-amber-500" />
  },
  {
    title: "Tudo Pronto! 🎉",
    description: "Agora é com você. Explore, conecte-se e faça a diferença na comunidade. Se precisar de algo, estamos por aqui!",
    icon: <CheckCircle className="w-12 h-12 text-green-500" />
  }
];

export const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('novapublica_tutorial_seen');
    if (!hasSeenTutorial) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('novapublica_tutorial_seen', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          title="Pular tutorial"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-full">
            {step.icon}
          </div>
          
          <h3 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">
            {step.title}
          </h3>
          
          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-8 min-h-[80px]">
            {step.description}
          </p>
          
          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-zinc-300 dark:bg-zinc-700'}`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrev}>
                  Voltar
                </Button>
              )}
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
