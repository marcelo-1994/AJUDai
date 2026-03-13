import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { ShieldCheck, Lock, Smartphone, Loader2, AlertCircle } from 'lucide-react';

export const TwoFactorGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuard, setShowGuard] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (profile.two_factor_enabled) {
        const sessionVerified = sessionStorage.getItem(`2fa_verified_${user.id}`);
        if (!sessionVerified) {
          setShowGuard(true);
          setIsVerified(false);
        } else {
          setIsVerified(true);
          setShowGuard(false);
        }
      } else {
        setIsVerified(true);
        setShowGuard(false);
      }
    } else if (!user) {
      setIsVerified(true);
      setShowGuard(false);
    }
  }, [user, profile]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Por favor, insira o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate verification (in a real app, this would call an API)
    setTimeout(() => {
      const customCode = user ? localStorage.getItem(`2fa_custom_code_${user.id}`) : null;
      const validCodes = ['123456', '000000'];
      if (customCode) {
        validCodes.push(customCode);
      }

      if (validCodes.includes(fullCode)) { // Mock codes for demo
        if (user) {
          sessionStorage.setItem(`2fa_verified_${user.id}`, 'true');
          setIsVerified(true);
          setShowGuard(false);
        }
      } else {
        setError('Código inválido. Tente novamente.');
      }
      setLoading(false);
    }, 1500);
  };

  if (!user || !profile?.two_factor_enabled || isVerified || !showGuard) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-[2.5rem] border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] text-center">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
          <ShieldCheck className="h-10 w-10 text-indigo-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Verificação de Segurança</h2>
        <p className="text-zinc-400 mb-8">
          Sua conta está protegida. Insira o código enviado para o seu dispositivo para continuar.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-between gap-2 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={verifyCode}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Verificar Código'
            )}
          </Button>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                const customCode = user ? localStorage.getItem(`2fa_custom_code_${user.id}`) : null;
                if (customCode) {
                  setError(`Lembrete: Você configurou um código personalizado no seu perfil.`);
                } else {
                  setError('Código reenviado. Verifique seu dispositivo ou use o código padrão 123456.');
                }
              }}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
            >
              Não recebeu o código? Reenviar
            </button>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              Dica: Use 123456 ou o código configurado no seu perfil
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-6 text-zinc-500">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="text-xs">Criptografado</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-xs">Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
