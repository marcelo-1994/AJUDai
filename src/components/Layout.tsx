import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { 
  HeartHandshake, Menu, UserCircle, X, Sun, Moon, Rocket, Gamepad2, 
  GraduationCap, PlayCircle, Briefcase, ShoppingBag, Users, MessageSquare, 
  Trophy, BookOpen, Share2, LayoutDashboard, Settings, Search, ShieldCheck,
  LogOut, Clock
} from 'lucide-react';
import { Notifications } from './Notifications';
import { GlobalSearch } from './GlobalSearch';
import { WelcomeAnimation } from './WelcomeAnimation';
import { Mascot } from './Mascot';
import { useTheme } from '../contexts/ThemeContext';
import { ExitIntentModal } from './ExitIntentModal';

export const Layout = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const MobileNavLink = ({ to, icon: Icon, children, colorClass = "text-zinc-300", onClick }: any) => (
    <Link 
      to={to} 
      onClick={() => {
        setIsMobileMenuOpen(false);
        if (onClick) onClick();
      }} 
      className={`flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/10 active:scale-95 transition-all ${colorClass}`}
    >
      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
        <Icon className="h-5 w-5 opacity-90" />
      </div>
      <span className="font-medium">{children}</span>
    </Link>
  );

  const MobileSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6 last:mb-0">
      <div className="px-4 mb-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      <div className="flex flex-col gap-1 bg-white/[0.02] rounded-2xl p-1 border border-white/[0.05]">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-50 font-sans relative overflow-hidden transition-colors duration-300">
      <WelcomeAnimation />
      <Mascot />
      <ExitIntentModal />
      <div className="atmosphere-bg"></div>
      
      <header className="sticky top-0 z-50 w-full glass-header">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-2 font-bold text-xl tracking-tight z-50 relative">
            <HeartHandshake className="h-6 w-6 text-indigo-400" />
            <span className="text-gradient">AJUDAÍ+</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/explore-projects" className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-bold">
              <Rocket className="h-4 w-4" /> Explorar
            </Link>
            <Link to="/pedidos" className="text-zinc-300 hover:text-white transition-colors font-bold">Serviços</Link>
            <Link to="/entertainment" className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-bold">
              <PlayCircle className="h-4 w-4" /> Entretenimento
            </Link>
            <Link to="/marketplace" className="text-zinc-300 hover:text-white transition-colors">Marketplace</Link>
            <Link to="/community" className="text-zinc-300 hover:text-white transition-colors">Comunidade</Link>
            <Link to="/ranking" className="text-zinc-300 hover:text-white transition-colors">Ranking</Link>
            <Link to="/pricing" className="text-zinc-300 hover:text-white transition-colors">Planos</Link>
            {user && (
              <Link to="/invite" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-bold">
                🎁 Indique
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <GlobalSearch />
            {user ? (
              <>
                <Notifications />
                <Link to="/dashboard" className="hidden md:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                {(profile?.role === 'admin' || user?.email === 'marcelodasilvareis30@gmail.com') && (
                  <Link to="/admin" className="hidden md:block text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="hidden md:flex items-center gap-2 z-50 relative">
                  <span className="text-sm text-zinc-400 mr-2 hidden lg:block">
                    {getGreeting()}, <span className="text-white font-medium">{profile?.name?.split(' ')[0] || 'Usuário'}</span>
                  </span>
                  <Link to="/profile">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    ) : (
                      <UserCircle className="h-8 w-8 text-zinc-400" />
                    )}
                  </Link>
                  <Link to="/ai-assistant" className="hidden lg:flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-2">
                    🤖 IA
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut} className="text-zinc-300 hover:text-white hover:bg-white/10">Sair</Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Entrar</Link>
                <Link to="/register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.5)]">Cadastrar</Button>
                </Link>
              </div>
            )}
            <button 
              className="md:hidden text-zinc-300 hover:text-white relative z-50 p-2 -mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden flex flex-col pt-20 px-4 pb-10 overflow-y-auto">
          <div className="mb-6">
            <GlobalSearch isMobile />
          </div>

          <nav className="flex flex-col text-sm font-medium">
            <div className="flex items-center justify-between py-4 px-5 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Modo de Exibição</span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Aparência do Sistema</span>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/40 active:scale-95 transition-all"
              >
                {theme === 'light' ? (
                  <><Moon className="h-4 w-4" /> Escuro</>
                ) : (
                  <><Sun className="h-4 w-4" /> Claro</>
                )}
              </button>
            </div>

            <MobileSection title="Navegação">
              <MobileNavLink to="/explore-projects" icon={Rocket} colorClass="text-indigo-400 font-bold">Explorar Projetos</MobileNavLink>
              <MobileNavLink to="/search" icon={Search}>Busca Avançada</MobileNavLink>
              <MobileNavLink to="/timeline" icon={Clock}>Linha do Tempo</MobileNavLink>
            </MobileSection>

            <MobileSection title="Negócios & Mercado">
              <MobileNavLink to="/pedidos" icon={Briefcase}>Serviços AJUDAÍ</MobileNavLink>
              <MobileNavLink to="/marketplace" icon={ShoppingBag}>Marketplace</MobileNavLink>
              <MobileNavLink to="/professionals" icon={Users}>Profissionais</MobileNavLink>
            </MobileSection>

            <MobileSection title="Entretenimento & Educa">
              <MobileNavLink to="/entertainment" icon={PlayCircle} colorClass="text-rose-400 font-bold">Central de Entretenimento</MobileNavLink>
              <MobileNavLink to="/educa" icon={GraduationCap}>AJUDAÍ Educa</MobileNavLink>
              <MobileNavLink to="/strategic-pause" icon={Gamepad2}>Pausa Estratégica</MobileNavLink>
            </MobileSection>

            <MobileSection title="Comunidade & Social">
              <MobileNavLink to="/community" icon={MessageSquare}>Comunidade (Chat)</MobileNavLink>
              <MobileNavLink to="/ranking" icon={Trophy}>Ranking Geral</MobileNavLink>
              <MobileNavLink to="/blog" icon={BookOpen}>Blog & Notícias</MobileNavLink>
              <MobileNavLink to="/affiliates" icon={Share2}>Programa de Afiliados</MobileNavLink>
            </MobileSection>

            {user && (
              <>
                <MobileSection title="Minha Área">
                  <MobileNavLink to="/dashboard" icon={LayoutDashboard}>Painel de Controle</MobileNavLink>
                  <MobileNavLink to="/profile" icon={UserCircle}>Meu Perfil</MobileNavLink>
                  <MobileNavLink to="/integrations" icon={Settings}>Integrações</MobileNavLink>
                  <MobileNavLink to="/ai-assistant" icon={MessageSquare} colorClass="text-emerald-400 font-bold">🤖 Assistente IA (WhatsApp)</MobileNavLink>
                  <MobileNavLink to="/invite" icon={Share2} colorClass="text-emerald-400 font-bold">🎁 Indique e Ganhe</MobileNavLink>
                  
                  {(profile?.role === 'admin' || user?.email === 'marcelodasilvareis30@gmail.com') && (
                    <MobileNavLink to="/admin" icon={ShieldCheck} colorClass="text-indigo-400">Painel Administrativo</MobileNavLink>
                  )}
                </MobileSection>

                <div className="mt-8 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      fetch('/api/public/trigger-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          event: 'logout:success',
                          data: { email: user?.email }
                        })
                      }).catch(err => console.error('Error triggering webhook:', err));
                      
                      setIsMobileMenuOpen(false);
                      signOut();
                    }} 
                    className="flex items-center gap-4 py-4 px-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 transition-all w-full text-left font-bold active:scale-95 shadow-lg"
                  >
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex flex-col gap-3 mt-8 pt-8 border-t border-white/10">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-4 rounded-2xl bg-white/5 text-white font-bold border border-white/10 active:scale-95 transition-all">
                  Entrar
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-4 rounded-2xl bg-indigo-600 text-white font-bold border border-indigo-500/50 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  Cadastrar Agora
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-8 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-6 text-zinc-400 text-sm">
            <Link to="/" className="hover:text-white transition-colors font-semibold text-indigo-400">Manifesto</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/architecture" className="hover:text-white transition-colors text-emerald-400 font-bold">Arquitetura</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Planos</Link>
            <Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <a href="https://wa.me/5594991233751" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Suporte</a>
          </div>
          <div className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} AJUDAÍ+. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
