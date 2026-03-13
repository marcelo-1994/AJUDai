import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, ScanFace } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FaceIDModal } from '../components/FaceIDModal';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberFace, setRememberFace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setError('A conexão com o banco de dados não foi configurada. Se você acabou de adicionar as chaves VITE_SUPABASE_URL no painel, por favor recarregue a página (F5) para aplicá-las.');
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid API key') {
        setError('A chave do Supabase (VITE_SUPABASE_ANON_KEY) está incorreta. Verifique se você copiou a chave "anon public" inteira, sem espaços extras, no painel de Secrets do AI Studio. Depois, aperte F5.');
      } else {
        setError(error.message);
      }
    } else {
      // If rememberFace is checked, save for Face ID
      if (rememberFace) {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          localStorage.setItem('ajudai_face_auth', JSON.stringify({
            email,
            token: session.data.session.access_token,
            timestamp: Date.now()
          }));
        }
      }

      // Trigger n8n Webhook
      fetch('/api/public/trigger-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'login:success',
          data: { email }
        })
      }).catch(err => console.error('Error triggering webhook:', err));
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      if (error.message.includes('provider is not enabled')) {
        setError(`O login com ${provider} ainda não foi ativado no painel do Supabase. Você precisa ir em Authentication > Providers no Supabase e ativar o ${provider}.`);
      } else {
        setError(error.message);
      }
    }
  };

  const handleFaceIDSuccess = async (email: string, token: string) => {
    setShowFaceModal(false);
    setLoading(true);
    
    // In a real app, you'd verify the token or use a refresh token
    // For this facilitation, we'll try to restore the session or re-auth
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // We might not have it, but setSession can work with just access_token if valid
    });

    if (error) {
      setError("Sessão expirada. Por favor, entre com sua senha uma vez para reativar o Face ID.");
      localStorage.removeItem('ajudai_face_auth');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <FaceIDModal 
        isOpen={showFaceModal} 
        onClose={() => setShowFaceModal(false)} 
        onSuccess={handleFaceIDSuccess} 
      />
      <h2 className="text-3xl font-bold text-center mb-8">Bem-vindo de volta</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">Senha</label>
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="rememberFace" 
            checked={rememberFace}
            onChange={(e) => setRememberFace(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="rememberFace" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
            Ativar Reconhecimento Facial (Face ID)
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowFaceModal(true)}
            className="w-full border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5"
          >
            <ScanFace className="h-4 w-4 mr-2" /> Entrar com Face ID
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <span className="border-b border-zinc-200 dark:border-zinc-800 w-1/5 lg:w-1/4"></span>
        <span className="text-xs text-center text-zinc-500 uppercase">ou continue com</span>
        <span className="border-b border-zinc-200 dark:border-zinc-800 w-1/5 lg:w-1/4"></span>
      </div>

      <div className="mt-6 flex gap-4">
        <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('google')}>
          Gmail
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('facebook')}>
          Facebook
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Não tem uma conta? <Link to="/register" className="text-indigo-600 hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
};
