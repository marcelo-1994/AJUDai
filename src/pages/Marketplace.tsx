import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Search, Filter, Plus, X, Loader2, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Marketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Design');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const platformFee = 10; // 10% developer fee

  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, seller:users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      let finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400';
      
      // If we had Supabase Storage configured, we would upload the file here.
      // For now, if they selected a file, we'll use the base64 preview as the image URL
      // Note: In a real production app, storing base64 in the database is not recommended due to size limits.
      if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      const { error } = await supabase.from('products').insert([
        {
          title,
          description,
          price: parseFloat(price),
          category,
          image_url: finalImageUrl,
          seller_id: user.id
        }
      ]);

      if (error) throw error;
      
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
            event: 'product:created',
            data: { title, price, category }
          })
        }).catch(err => console.error('Error triggering webhook:', err));
      }
      
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao adicionar produto: ' + error.message + '\n\nCertifique-se de ter criado a tabela "products" no Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuy = async (product: any) => {
    if (!user) {
      alert('Você precisa estar logado para comprar um produto.');
      return;
    }

    try {
      setPaymentError(null);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Erro de sessão:', sessionError);
        setPaymentError('Você precisa estar logado para comprar um produto.');
        return;
      }

      const response = await fetch('/api/create-mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: 'marketplace_product',
          userId: user.id,
          productId: product.id
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const errorText = data?.error || data?.message || text.substring(0, 100).replace(/<[^>]*>?/gm, '') || response.statusText;
        throw new Error(`Erro no servidor (${response.status}): ${errorText}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao comprar produto:', error);
      const msg = typeof error === 'string' ? error : (error?.message || 'Erro desconhecido');
      
      let displayMsg = msg;
      if (msg === 'e is not a function') {
        displayMsg = 'Erro de autenticação. Por favor, saia e entre novamente na sua conta.';
      }
      
      setPaymentError('Erro ao processar pagamento: ' + displayMsg + '. Por favor, tente novamente ou entre em contato com o suporte.');
    }
  };

  const handleHighlight = (product: any) => {
    setSelectedProduct(product);
    setShowHighlightModal(true);
  };

  const confirmHighlight = async () => {
    if (!user || !selectedProduct) return;
    
    try {
      setSubmitting(true);
      setPaymentError(null);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Erro de sessão:', sessionError);
        setPaymentError('Você precisa estar logado para destacar um produto.');
        return;
      }

      const response = await fetch('/api/create-mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: 'highlight_7d',
          userId: user.id,
          productId: selectedProduct.id
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const errorText = data?.error || data?.message || text.substring(0, 100).replace(/<[^>]*>?/gm, '') || response.statusText;
        throw new Error(`Erro no servidor (${response.status}): ${errorText}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao destacar produto:', error);
      const msg = typeof error === 'string' ? error : (error?.message || 'Erro desconhecido');
      
      let displayMsg = msg;
      if (msg === 'e is not a function') {
        displayMsg = 'Erro de autenticação. Por favor, saia e entre novamente na sua conta.';
      }
      
      setPaymentError('Erro ao processar pagamento: ' + displayMsg + '. Por favor, tente novamente ou entre em contato com o suporte.');
    } finally {
      setSubmitting(false);
      setShowHighlightModal(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {paymentError && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 max-w-2xl mx-auto">
          <Zap className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Pagamento não concluído</h3>
            <p className="text-sm opacity-90">{paymentError}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-indigo-400" />
            Marketplace
          </h1>
          <p className="text-zinc-400">Compre e venda produtos digitais, templates e mentorias.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {user && (
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white w-full md:w-auto shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              <Plus className="h-4 w-4 mr-2" /> Vender Produto
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos, templates, mentorias..." 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Filter className="h-5 w-5 mr-2" /> Filtros
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h3>
          <p className="text-zinc-400">Seja o primeiro a adicionar um produto no marketplace!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="glass-panel rounded-2xl overflow-hidden group hover:border-indigo-500/50 transition-colors flex flex-col">
              <div className="h-48 overflow-hidden relative shrink-0">
                <img 
                  src={product.image_url} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                  {product.category}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.title}</h3>
                <p className="text-sm text-zinc-400 mb-2">por {product.seller?.name || 'Usuário'}</p>
                <p className="text-sm text-zinc-300 mb-4 line-clamp-2 flex-1">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-medium text-sm">5.0</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400 block">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      Taxa da plataforma: {platformFee}%
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button 
                    onClick={() => handleBuy(product)}
                    className="flex-1 bg-white/5 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500 transition-colors"
                  >
                    Comprar
                  </Button>
                  {user && user.id === product.seller_id && (
                    <Button 
                      onClick={() => handleHighlight(product)}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3"
                      title="Destacar Produto (R$ 10,00)"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Vender Produto</h2>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Título do Produto</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: Template Landing Page"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none h-24"
                  placeholder="Descreva seu produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Preço (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="49.90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Categoria</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Design">Design</option>
                    <option value="Código">Código</option>
                    <option value="Mentoria">Mentoria</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Serviço">Serviço</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Foto do Produto</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(''); }}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-500/80 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-black/50 border border-white/10 border-dashed flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="product-image"
                      />
                      <label 
                        htmlFor="product-image"
                        className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors w-full mb-2"
                      >
                        Escolher Foto
                      </label>
                      <input 
                        type="url" 
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        disabled={!!imagePreview}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                        placeholder="Ou cole a URL da imagem..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
                  <Star className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-indigo-300 mb-1">Taxa do Desenvolvedor</h4>
                  <p className="text-xs text-indigo-200/70 leading-relaxed">
                    Uma taxa de {platformFee}% será aplicada sobre o valor das vendas para manutenção da plataforma AJUDAÍ.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-4"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publicar Produto'}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Highlight Modal */}
      {showHighlightModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 w-full max-w-md relative shadow-[0_0_50px_rgba(245,158,11,0.1)]">
            <button 
              onClick={() => setShowHighlightModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 mx-auto">
              <Zap className="h-8 w-8 text-amber-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Destacar Produto</h2>
            <p className="text-zinc-400 text-center mb-6">
              Aumente suas vendas destacando <strong className="text-white">"{selectedProduct.title}"</strong> no topo do Marketplace por 7 dias.
            </p>
            
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-300">Destaque por 7 dias</span>
                <span className="text-white font-bold">R$ 10,00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Aumento estimado de views</span>
                <span className="text-emerald-400 font-medium">+300%</span>
              </div>
            </div>
            
            <Button 
              onClick={confirmHighlight}
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Pagar com Mercado Pago'}
            </Button>
            <p className="text-xs text-zinc-500 text-center mt-4">
              O pagamento é processado de forma segura. O destaque será ativado após a confirmação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
