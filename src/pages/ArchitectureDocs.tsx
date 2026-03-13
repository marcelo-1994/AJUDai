import React from 'react';
import { motion } from 'motion/react';
import { Layers, Database, Shield, CreditCard, TrendingUp, Map, Code, Server, Globe, Cpu } from 'lucide-react';

export const ArchitectureDocs = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Arquitetura <span className="text-gradient">AJUDAÍ+</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
          Visão técnica e estratégica para transformar o AJUDAÍ+ em um ecossistema digital escalável e modular.
        </p>
      </div>

      <div className="grid gap-12">
        {/* 1. Estrutura Técnica */}
        <section className="glass-panel p-8 rounded-[2.5rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Code className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">1. Estrutura Técnica (Stack 2026)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Front-end</h4>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> React 19 + Vite (Monorepo com Turborepo)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Tailwind CSS 4.0 (Design System Unificado)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Framer Motion (Interações Imersivas)</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Back-end & Infra</h4>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Node.js (Express) + API Gateway (Kong ou AWS)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Supabase (PostgreSQL + Realtime + Auth)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Redis (Cache e Rate Limiting)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" /> Esquema de Banco Relacional
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[10px] font-mono uppercase tracking-wider">
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">users (SSO Core)</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">modules (Registry)</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">subscriptions (Unified)</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">permissions (RBAC)</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">project_connections</div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-400">audit_logs</div>
            </div>
          </div>
        </section>

        {/* 2. Sistema de Permissões (RBAC) */}
        <section className="glass-panel p-8 rounded-[2.5rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">2. Controle de Acesso Granular (RBAC)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-amber-400 font-bold uppercase tracking-widest text-xs">Níveis de Acesso</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white font-bold block mb-1">Free</span>
                  <p className="text-zinc-400 text-xs">Acesso ao core: pedidos básicos e respostas limitadas.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-indigo-400 font-bold block mb-1">Pro</span>
                  <p className="text-zinc-400 text-xs">Acesso ao AJUDAÍ Pro e Academy. Pedidos ilimitados.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-purple-400 font-bold block mb-1">Enterprise</span>
                  <p className="text-zinc-400 text-xs">Acesso total, incluindo AJUDAÍ Labs e ferramentas de IA.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Permissões Granulares</h4>
              <div className="grid grid-cols-2 gap-2">
                {['view_requests', 'create_requests', 'respond_requests', 'access_pro_modules', 'access_labs', 'access_academy', 'admin_panel', 'manage_users'].map(p => (
                  <div key={p} className="px-3 py-2 rounded-lg bg-black/30 border border-white/5 text-[10px] font-mono text-zinc-500">
                    {p}
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
                O sistema utiliza um middleware de proteção (`PermissionGuard`) que valida em tempo real se o JWT do usuário contém as claims necessárias para cada ação.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Fluxo de Integração */}
        <section className="glass-panel p-8 rounded-[2.5rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">3. Fluxo de Integração de Módulos</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">1</div>
              <div>
                <h5 className="text-white font-bold mb-1">Registro no HUB</h5>
                <p className="text-zinc-400 text-sm">O novo projeto é registrado na tabela `modules` com seu endpoint e metadados.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">2</div>
              <div>
                <h5 className="text-white font-bold mb-1">Handshake de Autenticação</h5>
                <p className="text-zinc-400 text-sm">O módulo utiliza o JWT do AJUDAÍ+ para validar a sessão do usuário via SSO.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">3</div>
              <div>
                <h5 className="text-white font-bold mb-1">Verificação de Permissões</h5>
                <p className="text-zinc-400 text-sm">O API Gateway consulta se o usuário possui o plano necessário para aquele módulo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Modelo de Monetização */}
        <section className="glass-panel p-8 rounded-[2.5rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">4. Modelo de Monetização</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h5 className="text-white font-bold mb-2">SaaS Core</h5>
              <p className="text-zinc-400 text-xs">Assinatura mensal/anual que dá acesso ao HUB e módulos básicos.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h5 className="text-white font-bold mb-2">Add-ons Individuais</h5>
              <p className="text-zinc-400 text-xs">Compra única ou recorrente para módulos específicos (ex: AJUDAÍ Labs).</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h5 className="text-white font-bold mb-2">Marketplace Fee</h5>
              <p className="text-zinc-400 text-xs">Porcentagem sobre transações realizadas dentro de módulos parceiros.</p>
            </div>
          </div>
        </section>

        {/* 4. Roadmap de Implementação */}
        <section className="glass-panel p-8 rounded-[2.5rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Map className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">5. Roadmap de Implementação</h2>
          </div>
          
          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            
            {/* Phase 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-zinc-900 text-zinc-500 group-[.is-active]:bg-indigo-500 group-[.is-active]:text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white/5 border border-white/10">
                <h5 className="text-white font-bold mb-1">MVP Simples (Atual)</h5>
                <p className="text-zinc-400 text-xs">Consolidação do Core: Login, Cadastro, Pedidos e Perfil. Início do HUB visual.</p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-zinc-900 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white/5 border border-white/10">
                <h5 className="text-white font-bold mb-1">Plataforma Consolidada</h5>
                <p className="text-zinc-400 text-xs">Implementação do SSO real, API Gateway e os primeiros 2 módulos oficiais (Pro e Edu).</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-zinc-900 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white/5 border border-white/10">
                <h5 className="text-white font-bold mb-1">Ecossistema Digital</h5>
                <p className="text-zinc-400 text-xs">Abertura para parceiros externos (SDK), monetização avançada e IA integrada (Labs).</p>
              </div>
            </div>

          </div>
        </section>
      </div>

      <div className="mt-24 text-center">
        <p className="text-zinc-500 text-sm mb-8">Pronto para escalar o AJUDAÍ+?</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'https://picsum.photos/seed/pdf/1200/1600'; // Placeholder for PDF
              link.download = 'AJUDAI_Estrategia_2026.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              alert('O PDF da Estratégia AJUDAÍ+ 2026 está sendo gerado e será baixado em instantes.');
            }}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm cursor-pointer hover:bg-indigo-500 transition-colors"
          >
            Baixar PDF da Estratégia
          </button>
          <a 
            href="https://wa.me/5594991233751?text=Olá! Gostaria de falar com o arquiteto sobre o ecossistema AJUDAÍ+."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm cursor-pointer hover:bg-white/10 transition-colors inline-block"
          >
            Falar com Arquiteto
          </a>
        </div>
      </div>
    </div>
  );
};
