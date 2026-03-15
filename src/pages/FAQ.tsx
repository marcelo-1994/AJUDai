import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Como funciona o aplicativo?',
    answer: 'Nosso aplicativo conecta pessoas que precisam de serviços com profissionais qualificados. Você pode criar um pedido de ajuda ou anunciar seus serviços no marketplace.'
  },
  {
    question: 'Como faço para me tornar um profissional Pro?',
    answer: 'Para se tornar um profissional Pro e ter mais visibilidade, você pode assinar um dos nossos planos na página de Planos. O pagamento é processado de forma segura via Mercado Pago e seus benefícios são ativados automaticamente.'
  },
  {
    question: 'É seguro contratar serviços pelo app?',
    answer: 'Sim! Nós verificamos os perfis dos profissionais e permitimos que os usuários avaliem os serviços prestados, garantindo uma comunidade segura e confiável.'
  },
  {
    question: 'Como funciona o pagamento dos serviços?',
    answer: 'O pagamento dos serviços (pedidos de ajuda) é combinado diretamente entre você e o profissional. Já os planos e créditos da plataforma são pagos via Mercado Pago diretamente no aplicativo.'
  },
  {
    question: 'Como posso entrar em contato com o suporte?',
    answer: 'Você pode entrar em contato com nosso suporte clicando no botão flutuante no canto inferior direito e selecionando a opção "Suporte", ou enviando uma mensagem para o nosso WhatsApp: (94) 99123-3751.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Perguntas Frequentes</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encontre respostas para as dúvidas mais comuns sobre como usar nossa plataforma.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-2xl p-8 text-center mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ainda tem dúvidas?</h2>
        <p className="text-gray-600 mb-6">Nossa equipe de suporte está pronta para ajudar você.</p>
        <a
          href="https://wa.me/5594991233751"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Falar com Suporte
        </a>
      </div>
    </div>
  );
}
