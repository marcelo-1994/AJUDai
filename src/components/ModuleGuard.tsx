import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Zap, ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';
import { Permission } from '../lib/permissions';

interface ModuleGuardProps {
  children: React.ReactNode;
  moduleId: string;
  requiredPermission?: Permission;
  requiredPlan?: 'free' | 'pro' | 'enterprise';
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ 
  children, 
  moduleId, 
  requiredPermission,
  requiredPlan = 'free' 
}) => {
  const { profile } = useAuth();

  // Mock module check logic
  const isModuleEnabled = true; // Assume enabled for now
  
  const hasAccess = () => {
    if (!profile) return false;
    
    // Check by permission if provided
    if (requiredPermission) {
      return profile.permissions.includes(requiredPermission);
    }
    
    // Fallback to plan check
    const userPlan = profile.plan || 'free';
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'pro' && (userPlan === 'pro' || userPlan === 'enterprise' || profile.role === 'admin')) return true;
    if (requiredPlan === 'enterprise' && (userPlan === 'enterprise' || profile.role === 'admin')) return true;
    
    return false;
  };

  if (!isModuleEnabled) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border-amber-500/20">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Módulo em Manutenção</h2>
        <p className="text-zinc-400 max-w-md">
          O módulo <span className="text-white font-bold">{moduleId}</span> está temporariamente desativado para atualizações.
        </p>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-[3rem] border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-8 border border-indigo-500/30 relative z-10">
          <Zap className="h-10 w-10 text-indigo-400 fill-indigo-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Acesso Restrito</h2>
        <p className="text-zinc-400 max-w-md mb-8 relative z-10 leading-relaxed">
          O módulo <span className="text-white font-bold">{moduleId}</span> é exclusivo para assinantes do plano <span className="text-indigo-400 font-bold uppercase tracking-widest">{requiredPlan}</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link to="/pricing">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-500/20">
              Fazer Upgrade Agora
            </Button>
          </Link>
          <Link to="/explore-projects">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 h-12 rounded-2xl px-8">
              Voltar para o HUB
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
