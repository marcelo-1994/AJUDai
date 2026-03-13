import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Star, Award, Medal, CheckCircle2, Clock, MessageSquare, Trophy, Edit2, Save, X, Upload, Loader2, ShieldCheck, Activity, ScanFace } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FaceIDModal } from '../components/FaceIDModal';

export const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(!!localStorage.getItem('ajudai_face_auth'));
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [welcomeAnimationEnabled, setWelcomeAnimationEnabled] = useState(localStorage.getItem('welcome_animation_disabled') !== 'true');
  const [showCreatorButton, setShowCreatorButton] = useState(localStorage.getItem('hideCreatorButton') !== 'true');
  const [mascotEnabled, setMascotEnabled] = useState(localStorage.getItem('ajudinha_dismissed') !== 'true');
  const [mascotVoiceEnabled, setMascotVoiceEnabled] = useState(localStorage.getItem('ajudinha_voice_enabled') === 'true');
  const [mascotFloatingEnabled, setMascotFloatingEnabled] = useState(localStorage.getItem('ajudinha_floating_enabled') === 'true');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile.two_factor_enabled || false);
  const [custom2FACode, setCustom2FACode] = useState(localStorage.getItem(`2fa_custom_code_${user?.id}`) || '');
  const [idleDisabled, setIdleDisabled] = useState(localStorage.getItem('idle_disabled') === 'true');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStorage = () => {
      setIdleDisabled(localStorage.getItem('idle_disabled') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [stats, setStats] = useState({
    responsesCount: 0,
    completedRequests: 0,
    isTop10: false,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch responses count
        const { count: responsesCount } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch completed requests count
        const { count: completedRequests } = await supabase
          .from('help_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // Check if user is in top 10
        const { data: topUsers } = await supabase
          .from('users')
          .select('id')
          .order('reputation_score', { ascending: false })
          .limit(10);

        const isTop10 = topUsers?.some(u => u.id === user.id) || false;

        setStats({
          responsesCount: responsesCount || 0,
          completedRequests: completedRequests || 0,
          isTop10,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || !profile) {
    return <div className="text-center py-12 text-zinc-400">Carregando perfil...</div>;
  }

  const handleEditClick = () => {
    setEditName(profile.name || '');
    setEditBio(profile.bio || '');
    setEditPhone(profile.phone || '');
    setEditAvatarUrl(profile.avatar_url || '');
    setIsEditing(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setEditAvatarUrl(data.publicUrl);
    } catch (error: any) {
      alert('Erro ao fazer upload da imagem. Verifique se o bucket "avatars" existe no Supabase e é público. Erro: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('users')
      .update({
        name: editName,
        bio: editBio,
        phone: editPhone,
        avatar_url: editAvatarUrl,
      })
      .eq('id', user.id);

    setSaving(false);
    
    if (error) {
      alert('Erro ao salvar o perfil: ' + error.message);
    } else {
      // Trigger n8n Webhook
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetch('/api/admin/trigger-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            event: 'profile:updated',
            data: { name: editName, bio: editBio, avatar_url: editAvatarUrl }
          })
        }).catch(err => console.error('Error triggering webhook:', err));
      }
      
      setIsEditing(false);
      // Reload to update the context profile
      window.location.reload();
    }
  };

  const getLevel = (score: number) => {
    return Math.floor(Math.sqrt((score || 0) / 10)) + 1;
  };

  const level = getLevel(profile.reputation_score);
  const nextLevelScore = Math.pow(level, 2) * 10;
  const progress = Math.min(100, ((profile.reputation_score || 0) / nextLevelScore) * 100);

  const hasPrimeiraAjuda = stats.responsesCount > 0 || stats.completedRequests > 0;
  const has5Estrelas = (profile.reputation_score || 0) >= 50;
  const hasComunicador = stats.responsesCount >= 10;
  const hasTop10 = (profile.reputation_score || 0) >= 100;

  const handleFaceIDSuccess = () => {
    setShowFaceModal(false);
    setFaceIdEnabled(true);
    alert('Face ID configurado com sucesso! Agora você pode entrar na sua conta usando reconhecimento facial.');
  };

  const handleRemoveFaceID = () => {
    if (confirm('Tem certeza que deseja remover o acesso por Face ID deste dispositivo?')) {
      localStorage.removeItem('ajudai_face_auth');
      setFaceIdEnabled(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FaceIDModal 
        isOpen={showFaceModal} 
        onClose={() => setShowFaceModal(false)} 
        onSuccess={handleFaceIDSuccess}
        mode="register"
        userEmail={user.email}
        userToken={localStorage.getItem('supabase.auth.token') || ''} // Fallback if needed
      />
      <div className="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
          <div className="relative">
            {isEditing ? (
              <div 
                className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-black shadow-xl overflow-hidden cursor-pointer relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                ) : (
                  <span className="text-zinc-500 text-xs text-center px-2">Sem Imagem</span>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Alterar Foto</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-black shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold text-4xl border-4 border-black shadow-xl">
                {profile.name?.charAt(0) || 'U'}
              </div>
            )}
            {!isEditing && (
              <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-white/10">
                <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                  L{level}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            {isEditing ? (
              <div className="space-y-3 mb-4 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 text-left">Nome</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 text-left">Celular / WhatsApp</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="(94) 99123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1 text-left">URL da Foto (Opcional)</label>
                  <input
                    type="text"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 text-left">Você pode colar um link ou clicar na foto acima para enviar do seu dispositivo.</p>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                  {profile.name}
                  {profile.plan === 'pro' && <span className="text-xs uppercase tracking-wider bg-indigo-500 text-white px-2 py-1 rounded-full font-bold">PRO</span>}
                  {profile.plan === 'strategic' && <span className="text-xs uppercase tracking-wider bg-purple-500 text-white px-2 py-1 rounded-full font-bold">VIP</span>}
                </h1>
                <p className="text-zinc-400 mb-4">{profile.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{profile.reputation_score || 0}</span>
                    <span className="text-zinc-400 text-sm">Reputação</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                >
                  {saving ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="w-full border-white/10 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleEditClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10" onClick={signOut}>
                  Sair da Conta
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" /> Progresso do Nível
            </h2>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-zinc-400">Nível {level}</span>
              <span className="text-zinc-400">Nível {level + 1}</span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">
              Faltam {nextLevelScore - (profile.reputation_score || 0)} pontos para o próximo nível
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-400" /> Suas Conquistas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`flex flex-col items-center text-center p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.completedRequests > 0 ? 'hover:bg-white/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer' : 'opacity-50 grayscale'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stats.completedRequests > 0 ? 'bg-[#0f3d2e]' : 'bg-zinc-800'}`}>
                  <CheckCircle2 className={`h-8 w-8 ${stats.completedRequests > 0 ? 'text-[#10b981]' : 'text-zinc-500'}`} />
                </div>
                <span className="text-base font-bold text-white mb-1">Primeira Ajuda</span>
                <span className="text-xs text-zinc-500">{stats.completedRequests > 0 ? `Concluiu ${stats.completedRequests} pedido(s)` : 'Nenhum pedido concluído'}</span>
              </div>
              <div className={`flex flex-col items-center text-center p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${profile.reputation_score >= 50 ? 'hover:bg-white/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] cursor-pointer' : 'opacity-50 grayscale'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${profile.reputation_score >= 50 ? 'bg-[#3d2e0f]' : 'bg-zinc-800'}`}>
                  <Star className={`h-8 w-8 ${profile.reputation_score >= 50 ? 'text-[#f59e0b]' : 'text-zinc-500'}`} />
                </div>
                <span className="text-base font-bold text-white mb-1">5 Estrelas</span>
                <span className="text-xs text-zinc-500">{profile.reputation_score >= 50 ? 'Recebeu avaliação máxima' : 'Alcance 50 de reputação'}</span>
              </div>
              <div className={`flex flex-col items-center text-center p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.responsesCount >= 10 ? 'hover:bg-white/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer' : 'opacity-50 grayscale'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stats.responsesCount >= 10 ? 'bg-indigo-900/40' : 'bg-zinc-800'}`}>
                  <MessageSquare className={`h-8 w-8 ${stats.responsesCount >= 10 ? 'text-indigo-400' : 'text-zinc-500'}`} />
                </div>
                <span className="text-base font-bold text-white mb-1">Comunicador</span>
                <span className="text-xs text-zinc-500">{stats.responsesCount >= 10 ? `${stats.responsesCount} respostas dadas` : `${stats.responsesCount}/10 respostas`}</span>
              </div>
              <div className={`flex flex-col items-center text-center p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 transition-all ${stats.isTop10 ? 'hover:bg-white/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer' : 'opacity-50 grayscale'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stats.isTop10 ? 'bg-yellow-900/40' : 'bg-zinc-800'}`}>
                  <Trophy className={`h-8 w-8 ${stats.isTop10 ? 'text-yellow-400' : 'text-zinc-500'}`} />
                </div>
                <span className="text-base font-bold text-white mb-1">Top 10</span>
                <span className="text-xs text-zinc-500">{stats.isTop10 ? 'Você está no Top 10!' : 'Alcance o Top 10 do mês'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Sobre Mim</h2>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none text-sm"
                placeholder="Conte um pouco sobre você, suas habilidades e o que gosta de fazer..."
              />
            ) : profile.bio ? (
              <p className="text-zinc-400 text-sm leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-zinc-500 text-sm italic">Nenhuma biografia adicionada.</p>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Membro desde</span>
                <span className="text-white text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Plano Atual</span>
                <span className="text-white text-sm font-medium uppercase">{profile.plan}</span>
              </div>
              {(!profile.plan || profile.plan === 'free') && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Créditos Adicionais</span>
                  <span className="text-emerald-400 text-sm font-bold">{profile.credits || 0}</span>
                </div>
              )}
            </div>
          </div>

          {profile.role === 'admin' && (
            <div className="glass-panel p-6 rounded-3xl border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Diagnóstico do Sistema
                </h2>
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase">Admin</span>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                O sistema de monitoramento inteligente detectou que a infraestrutura está operando. Para uma análise detalhada e correções automáticas, acesse o painel completo.
              </p>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Abrir Painel de Saúde Completo
              </Button>
            </div>
          )}

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Segurança</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Verificação em Duas Etapas</span>
                  <span className="text-zinc-400 text-xs">Proteja sua conta com um código adicional</span>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !twoFactorEnabled;
                    setTwoFactorEnabled(newValue);
                    
                    const { error } = await supabase
                      .from('users')
                      .update({ two_factor_enabled: newValue })
                      .eq('id', user.id);
                      
                    if (error) {
                      console.error('Erro ao atualizar segurança:', error);
                      if (error.message.includes('column') && error.message.includes('not found')) {
                        alert('⚠️ Erro de Banco de Dados: A coluna "two_factor_enabled" não existe na tabela "users".\n\nPara corrigir, execute este comando no SQL Editor do seu Supabase:\n\nALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;');
                      } else {
                        alert('Erro ao atualizar segurança: ' + error.message);
                      }
                      setTwoFactorEnabled(!newValue);
                    } else {
                      alert(newValue ? 'Verificação em duas etapas ativada!' : 'Verificação em duas etapas desativada.');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {twoFactorEnabled && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="block text-xs text-zinc-400 mb-2">Seu Código de Segurança (6 dígitos)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Ex: 123456"
                      value={custom2FACode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCustom2FACode(val);
                        if (val) {
                          localStorage.setItem(`2fa_custom_code_${user.id}`, val);
                        } else {
                          localStorage.removeItem(`2fa_custom_code_${user.id}`);
                        }
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Este código será solicitado ao fazer login. (Como este é um protótipo, o código não é enviado por SMS/Email, você deve usar o código definido aqui).</p>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-white text-sm font-medium block">Verificação Facial (Face ID)</span>
                  <span className="text-zinc-400 text-xs">
                    {faceIdEnabled ? 'Ativado neste dispositivo' : 'Entre sem senha usando seu rosto'}
                  </span>
                </div>
                {faceIdEnabled ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveFaceID}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Remover
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFaceModal(true)}
                    className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    Configurar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4">Configurações</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Pausa Estratégica</span>
                  <span className="text-zinc-400 text-xs">Configurar jogo e tempo de pausa</span>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="bg-zinc-800 text-white text-xs rounded px-2 py-1"
                    value={localStorage.getItem('idle_game_type') || 'chess'}
                    onChange={(e) => {
                      localStorage.setItem('idle_game_type', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  >
                    <option value="chess">Xadrez</option>
                    <option value="cards">Cartas</option>
                    <option value="tictactoe">Jogo da Velha</option>
                    <option value="dominoes">Dominó</option>
                  </select>
                  <select 
                    className="bg-zinc-800 text-white text-xs rounded px-2 py-1"
                    value={localStorage.getItem('idle_pause_interval') || '20'}
                    onChange={(e) => {
                      localStorage.setItem('idle_pause_interval', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  >
                    <option value="1">1 min</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="60">1 hora</option>
                  </select>
                  <button
                    onClick={() => {
                      const newValue = !idleDisabled;
                      setIdleDisabled(newValue);
                      localStorage.setItem('idle_disabled', newValue.toString());
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold ${idleDisabled ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'}`}
                  >
                    {idleDisabled ? 'Desativado' : 'Ativado'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Animação de Boas-vindas</span>
                  <span className="text-zinc-400 text-xs">Mostrar animação ao iniciar a sessão</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !welcomeAnimationEnabled;
                    setWelcomeAnimationEnabled(newValue);
                    if (newValue) {
                      localStorage.removeItem('welcome_animation_disabled');
                    } else {
                      localStorage.setItem('welcome_animation_disabled', 'true');
                    }
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    welcomeAnimationEnabled ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      welcomeAnimationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Botão Criador</span>
                  <span className="text-zinc-400 text-xs">Mostrar botão flutuante para criar sistema com IA</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !showCreatorButton;
                    setShowCreatorButton(newValue);
                    if (newValue) {
                      localStorage.removeItem('hideCreatorButton');
                    } else {
                      localStorage.setItem('hideCreatorButton', 'true');
                    }
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showCreatorButton ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCreatorButton ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Mascote Ajudinha</span>
                  <span className="text-zinc-400 text-xs">Mostrar o assistente virtual Ajudinha</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !mascotEnabled;
                    setMascotEnabled(newValue);
                    if (newValue) {
                      localStorage.removeItem('ajudinha_dismissed');
                    } else {
                      localStorage.setItem('ajudinha_dismissed', 'true');
                    }
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mascotEnabled ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mascotEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Acessibilidade de Voz</span>
                  <span className="text-zinc-400 text-xs">O Ajudinha falará as mensagens (TTS)</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !mascotVoiceEnabled;
                    setMascotVoiceEnabled(newValue);
                    if (newValue) {
                      localStorage.setItem('ajudinha_voice_enabled', 'true');
                    } else {
                      localStorage.removeItem('ajudinha_voice_enabled');
                    }
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mascotVoiceEnabled ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mascotVoiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm font-medium block">Modo Flutuante (PiP)</span>
                  <span className="text-zinc-400 text-xs">O Ajudinha ficará visível mesmo fora do navegador (Chrome 116+)</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !mascotFloatingEnabled;
                    setMascotFloatingEnabled(newValue);
                    if (newValue) {
                      localStorage.setItem('ajudinha_floating_enabled', 'true');
                    } else {
                      localStorage.removeItem('ajudinha_floating_enabled');
                    }
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mascotFloatingEnabled ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mascotFloatingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
