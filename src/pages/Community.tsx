import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Hash, Users, Send, Search, Image as ImageIcon, Smile, MoreVertical, Loader2, Star, Code, Palette, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const FEATURED_COMMUNITIES = [
  {
    id: 'dev-br',
    name: 'Desenvolvedores BR',
    description: 'Comunidade focada em programação, troca de conhecimento e vagas na área tech.',
    members: '12.4k',
    icon: <Code className="w-4 h-4" />
  },
  {
    id: 'design-ui',
    name: 'Design & UI/UX',
    description: 'Feedback de portfólio, tendências de design e networking para criativos.',
    members: '8.2k',
    icon: <Palette className="w-4 h-4" />
  },
  {
    id: 'empreendedores',
    name: 'Empreendedores',
    description: 'Dicas de negócios, marketing e networking para autônomos.',
    members: '15.1k',
    icon: <Briefcase className="w-4 h-4" />
  }
];

interface Channel {
  id: string;
  name: string;
  description: string;
  unread?: number;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  text: string;
  created_at: string;
  users?: {
    name: string;
    avatar_url: string;
  };
}

export const Community = () => {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel(`public:community_messages:channel_id=eq.${activeChannel.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_messages',
          filter: `channel_id=eq.${activeChannel.id}`
        }, payload => {
          // Fetch the user details for the new message
          const fetchUserDetails = async () => {
            const { data: userData } = await supabase
              .from('users')
              .select('name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();
              
            const newMsg = {
              ...payload.new,
              users: userData
            } as Message;
            
            setMessages(prev => [...prev, newMsg]);
          };
          
          fetchUserDetails();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setChannels(data);
        setActiveChannel(data[0]);
      } else {
        // Fallback if no channels exist in DB yet
        const fallbackChannels = [
          { id: 'geral', name: 'geral', description: 'Canal para discussões gerais da comunidade' },
          { id: 'ajuda', name: 'ajuda-mutua', description: 'Canal para pedir e oferecer ajuda' },
          { id: 'vagas', name: 'vagas-e-freelas', description: 'Canal para compartilhar vagas e oportunidades' },
          { id: 'projetos', name: 'projetos-colab', description: 'Canal para encontrar parceiros para projetos' }
        ];
        setChannels(fallbackChannels);
        setActiveChannel(fallbackChannels[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          users (
            name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile || !activeChannel) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([
          { 
            channel_id: activeChannel.id, 
            user_id: profile.id, 
            text: newMessage.trim() 
          }
        ]);
        
      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] min-h-[600px] flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 glass-panel rounded-3xl p-6 flex flex-col h-full shrink-0">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-400" />
          Comunidade
        </h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar canais..." 
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Canais</h3>
          <div className="space-y-1">
            {channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel?.id === channel.id 
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 opacity-70" />
                  {channel.name}
                </div>
                {channel.unread ? (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {channel.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Comunidades em Destaque
            </h3>
            <div className="space-y-2">
              {FEATURED_COMMUNITIES.map(community => (
                <div key={community.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      {community.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{community.name}</h4>
                      <p className="text-[10px] text-zinc-400">{community.members} membros</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{community.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-7 border-white/10 hover:bg-white/10">
                    Participar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-3xl flex flex-col h-full overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-zinc-400" />
            <div>
              <h3 className="font-bold text-white text-lg">{activeChannel?.name || 'Selecione um canal'}</h3>
              <p className="text-xs text-zinc-400">{activeChannel?.description || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Nenhuma mensagem neste canal ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-4 group">
                <img 
                  src={msg.users?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.users?.name || 'User')}&background=random`} 
                  alt={msg.users?.name || 'User'} 
                  className="w-10 h-10 rounded-full object-cover shrink-0" 
                />
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span 
                      className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/user/${msg.user_id}`}
                    >
                      {msg.users?.name || 'Usuário Desconhecido'}
                    </span>
                    <span className="text-xs text-zinc-500">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/5 shrink-0">
          <div className="flex items-end gap-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-colors">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white shrink-0">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={profile ? `Conversar em #${activeChannel?.name || 'canal'}...` : 'Faça login para enviar mensagens'}
              disabled={!profile || sending}
              className="w-full bg-transparent border-none text-white focus:outline-none resize-none py-2 px-2 text-sm max-h-32 min-h-[40px] disabled:opacity-50"
              rows={1}
            />
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              className={`shrink-0 rounded-xl ${newMessage.trim() && !sending ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white/5 text-zinc-500'}`}
              disabled={!newMessage.trim() || !profile || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
