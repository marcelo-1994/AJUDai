import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, Heart, Share2, Search, TrendingUp, Cpu, Users, Zap, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  likes: number;
  comments: BlogComment[];
}

interface BlogComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'O Futuro da Ajuda Mútua na Era da IA',
    excerpt: 'Como a inteligência artificial está transformando a forma como nos conectamos e oferecemos suporte uns aos outros.',
    content: 'A inteligência artificial não é apenas sobre automação, mas sobre amplificação humana. No AJUDAÍ+, estamos explorando como algoritmos podem prever necessidades e conectar as pessoas certas no momento exato...',
    author: 'IA AJUDAÍ+',
    date: '03 Mar 2026',
    category: 'Tecnologia',
    image: 'https://picsum.photos/seed/tech-help/800/400',
    likes: 124,
    comments: [
      { id: 'c1', author: 'Marcelo', content: 'Incrível como a tecnologia pode ser usada para o bem social!', date: 'Há 2 horas' }
    ]
  },
  {
    id: '2',
    title: 'Estratégias para uma Comunidade Digital Saudável',
    excerpt: 'Dicas práticas para promover interações positivas e crescimento mútuo em plataformas de ajuda.',
    content: 'Uma comunidade forte é construída sobre confiança e reciprocidade. Neste artigo, discutimos a importância da reputação digital e como pequenos atos de ajuda geram grandes impactos...',
    author: 'Estrategista AJUDAÍ+',
    date: '01 Mar 2026',
    category: 'Estratégia',
    image: 'https://picsum.photos/seed/community/800/400',
    likes: 89,
    comments: []
  },
  {
    id: '3',
    title: 'Blockchain e Transparência em Projetos Sociais',
    excerpt: 'Entenda como o registro imutável pode trazer mais confiança para doações e voluntariado.',
    content: 'A transparência é o pilar de qualquer projeto de ajuda. O uso de blockchain permite que cada contribuição seja rastreada, garantindo que os recursos cheguem onde são realmente necessários...',
    author: 'IA AJUDAÍ+',
    date: '28 Fev 2026',
    category: 'Tecnologia',
    image: 'https://picsum.photos/seed/blockchain/800/400',
    likes: 56,
    comments: []
  }
];

export const Blog = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState('');

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    // In a real app, this would be a database call
    alert('Comentário enviado com sucesso! (Simulação)');
    setNewComment('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6"
        >
          <BookOpen className="h-4 w-4" /> Blog AJUDAÍ+ Knowledge
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight">
          Área do <span className="text-gradient">Conhecimento</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          Tecnologia, estratégia e insights sobre ajuda mútua, gerados pela nossa inteligência artificial para impulsionar a comunidade.
        </p>
      </div>

      {/* Search & Knowledge Strategy */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar artigos, tecnologias, estratégias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel overflow-hidden rounded-[2.5rem] border-white/5 dark:border-white/10 group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="md:flex">
                  <div className="md:w-1/3 relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center gap-3 mb-4 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 group-hover:text-indigo-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-zinc-500">
                        <span className="flex items-center gap-1 hover:text-pink-500 transition-colors"><Heart className="h-4 w-4" /> {post.likes}</span>
                        <span className="flex items-center gap-1 hover:text-indigo-500 transition-colors"><MessageSquare className="h-4 w-4" /> {post.comments.length}</span>
                      </div>
                      <span className="text-indigo-500 font-bold text-sm flex items-center gap-1">
                        Ler mais <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Sidebar: Strategy & Knowledge Area */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" /> Estratégia de Crescimento
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-indigo-300 mb-1">Network Effect</h4>
                <p className="text-xs text-zinc-400">Quanto mais pessoas ajudam, mais valor a rede gera para todos.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-emerald-300 mb-1">Reputação Ativa</h4>
                <p className="text-xs text-zinc-400">Sua ajuda se transforma em créditos e visibilidade no ecossistema.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-bold text-purple-300 mb-1">IA Generativa</h4>
                <p className="text-xs text-zinc-400">Insights automáticos para otimizar conexões e resolver problemas.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> Tópicos em Alta
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Web3', 'Social Impact', 'AI Agents', 'Open Source', 'UX Design', 'SaaS Architecture'].map(topic => (
                <span key={topic} className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-indigo-500 hover:text-white transition-all cursor-pointer">
                  #{topic}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 text-center">
            <Cpu className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">IA Knowledge Base</h3>
            <p className="text-sm text-zinc-400 mb-6">Acesse nossa base de dados alimentada por IA para tirar dúvidas técnicas.</p>
            <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-bold">
              Abrir Knowledge Base
            </Button>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/10 shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all z-10"
            >
              <Zap className="h-6 w-6 rotate-45" />
            </button>

            <img 
              src={selectedPost.image} 
              alt={selectedPost.title} 
              className="w-full h-64 object-cover"
              referrerPolicy="no-referrer"
            />

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                  {selectedPost.category}
                </span>
                <span className="text-zinc-500 text-sm">{selectedPost.date}</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-8 leading-tight">
                {selectedPost.title}
              </h2>

              <div className="prose prose-zinc dark:prose-invert max-w-none mb-12">
                <p className="text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedPost.content}
                </p>
                <p className="text-zinc-500 mt-4 italic">
                  Este conteúdo foi gerado e revisado pela Inteligência Artificial do AJUDAÍ+ para garantir a melhor estratégia de conhecimento para nossos usuários.
                </p>
              </div>

              {/* Interaction Section */}
              <div className="border-t border-zinc-200 dark:border-white/10 pt-12">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-indigo-500" /> Comentários e Interação
                </h3>

                <div className="space-y-6 mb-8">
                  {selectedPost.comments.map(comment => (
                    <div key={comment.id} className="p-6 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-zinc-900 dark:text-white">{comment.author}</span>
                        <span className="text-xs text-zinc-500">{comment.date}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {selectedPost.comments.length === 0 && (
                    <p className="text-zinc-500 text-center py-8">Seja o primeiro a comentar e ajude a comunidade a crescer!</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Escreva seu comentário ou dúvida estratégica..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <Button 
                    onClick={() => handleAddComment(selectedPost.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-2xl font-bold"
                  >
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
