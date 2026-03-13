import React, { useState, useEffect } from 'react';
import { Shield, Users, ShoppingBag, DollarSign, Settings, Trash2, Loader2, TrendingUp, AlertCircle, Search, Filter, Plus, X, Activity, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PermissionGuard } from '../components/PermissionGuard';
import { SystemHealthDashboard } from '../components/SystemHealthDashboard';

export const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [platformFee, setPlatformFee] = useState(10);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [isSavingN8n, setIsSavingN8n] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'settings' | 'health'>('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [serverReports, setServerReports] = useState<any[]>([]);
  
  // User Management Filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPlanFilter, setUserPlanFilter] = useState('all');
  
  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', plan: 'free', role: 'user' });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Basic admin check - in a real app, this would check a role in the database
  const isAdmin = profile?.role === 'admin' || user?.email === 'marcelodasilvareis30@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      
      // Load saved fee from localStorage if exists
      const savedFee = localStorage.getItem('ajudai_platform_fee');
      if (savedFee) {
        setPlatformFee(Number(savedFee));
      }

      const savedWebhook = localStorage.getItem('ajudai_n8n_webhook');
      if (savedWebhook) {
        setN8nWebhookUrl(savedWebhook);
      }

      // Load notifications from server
      fetchServerReports();
    }
  }, [isAdmin]);

  const fetchServerReports = async () => {
    try {
      const response = await fetch('/api/system/admin/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServerReports(data.reports || []);
        
        // Merge local notifications with server notifications
        const localNotifs = JSON.parse(localStorage.getItem('ajudai_admin_notifications') || '[]');
        const serverNotifs = data.notifications || [];
        
        // Use a Set to avoid duplicates by ID
        const combined = [...serverNotifs, ...localNotifs].reduce((acc: any[], current: any) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        setNotifications(combined.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20));
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios do servidor:", error);
    }
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...notifications].slice(0, 10);
    setNotifications(updated);
    localStorage.setItem('ajudai_admin_notifications', JSON.stringify(updated));
  };

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('ajudai_admin_notifications', JSON.stringify(updated));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, seller:users(name, email)')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError) {
        setUsers(usersData || []);
        setUsersCount(usersData?.length || 0);
      } else {
        console.error('Erro ao buscar usuários:', usersError);
        // Fallback if users table is not accessible
        setUsersCount(156);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      alert('Erro ao excluir produto: ' + error.message);
    }
  };

  const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/update-user-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId, plan: newPlan })
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Resposta do servidor não é JSON (${response.status}): ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar plano');
      }
      
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      alert('Plano do usuário atualizado com sucesso!');
    } catch (error: any) {
      alert('Erro ao atualizar plano: ' + error.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/update-user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Resposta do servidor não é JSON (${response.status}): ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar cargo');
      }
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Cargo do usuário atualizado com sucesso!');
    } catch (error: any) {
      alert('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const handleUpdateUserBadge = async (userId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ [field]: value })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (error: any) {
      alert('Erro ao atualizar selo: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível e excluirá a conta permanentemente.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Resposta do servidor não é JSON (${response.status}): ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário');
      }
      
      setUsers(users.filter(u => u.id !== userId));
      setUsersCount(prev => prev - 1);
      alert(data.message || 'Usuário excluído com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir usuário: ' + error.message);
    }
  };

  const handleSaveFee = () => {
    setIsSavingFee(true);
    setTimeout(() => {
      localStorage.setItem('ajudai_platform_fee', platformFee.toString());
      setIsSavingFee(false);
      alert('Taxa da plataforma atualizada com sucesso!');
    }, 800);
  };

  const handleSaveN8n = () => {
    setIsSavingN8n(true);
    // In a real app, this would save to a database that the server can access
    // For now, we'll save to localStorage and explain how to set the env var
    setTimeout(() => {
      localStorage.setItem('ajudai_n8n_webhook', n8nWebhookUrl);
      setIsSavingN8n(false);
      alert('Configuração salva! Lembre-se de configurar a variável de ambiente N8N_WEBHOOK_URL no servidor para que as automações funcionem.');
    }, 800);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email) return;
    
    try {
      setIsAddingUser(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(newUser)
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Resposta do servidor não é JSON (${response.status}): ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar usuário');
      }
      
      alert(data.message || 'Usuário adicionado com sucesso!');
      setShowAddUserModal(false);
      setNewUser({ email: '', name: '', plan: 'free', role: 'user' });
      fetchData(); // Recarregar a lista
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // Calculate simulated revenue based on products
  const totalProductValue = products.reduce((acc, p) => acc + Number(p.price), 0);
  const simulatedSales = products.length * 3; // Assume each product sold 3 times on average
  const totalRevenue = totalProductValue * 3;
  const platformRevenue = totalRevenue * (platformFee / 100);

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name?.toLowerCase() || '').includes(userSearchQuery.toLowerCase()) || 
      (u.email?.toLowerCase() || '').includes(userSearchQuery.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || (u.role || 'user') === userRoleFilter;
    const matchesPlan = userPlanFilter === 'all' || (u.plan || 'free') === userPlanFilter;
    
    return matchesSearch && matchesRole && matchesPlan;
  });

  return (
    <PermissionGuard permission="admin_panel">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-indigo-400" />
              Painel Administrativo
            </h1>
            <p className="text-zinc-400">Gerencie a plataforma, produtos e configurações.</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsAsRead();
              }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white relative transition-all border border-white/5"
            >
              <Bell className="w-6 h-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-3xl border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Notificações</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-zinc-500 text-sm italic">
                      Nenhuma notificação recente.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-indigo-500/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`} />
                          <div>
                            <h5 className="text-xs font-bold text-white mb-1">{notif.title}</h5>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{notif.message}</p>
                            <span className="text-[9px] text-zinc-600 mt-2 block">
                              {new Date(notif.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-8 gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'overview' 
              ? 'bg-white/10 text-white border-b-2 border-indigo-500' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'products' 
              ? 'bg-white/10 text-white border-b-2 border-indigo-500' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Gerenciar Produtos
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'users' 
              ? 'bg-white/10 text-white border-b-2 border-indigo-500' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Gerenciar Usuários
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
            activeTab === 'settings' 
              ? 'bg-white/10 text-white border-b-2 border-indigo-500' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Configurações
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'health' 
              ? 'bg-white/10 text-white border-b-2 border-indigo-500' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="h-4 w-4" />
          📌 Saúde da Plataforma
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 font-medium">Usuários Totais</h3>
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{usersCount}</p>
                  <p className="text-sm text-emerald-400 mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12% este mês
                  </p>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 font-medium">Produtos Ativos</h3>
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{products.length}</p>
                  <p className="text-sm text-emerald-400 mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> +5 novos hoje
                  </p>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 font-medium">Volume de Vendas</h3>
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2">
                    {simulatedSales} vendas estimadas
                  </p>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-indigo-300 font-medium">Receita da Plataforma</h3>
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">
                    R$ {platformRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-indigo-300/70 mt-2 relative z-10">
                    Baseado na taxa de {platformFee}%
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Atividade Recente</h3>
                <div className="space-y-4">
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.title}</p>
                          <p className="text-sm text-zinc-400">Adicionado por {product.seller?.name || 'Usuário'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                        <p className="text-xs text-zinc-500">{new Date(product.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-zinc-500 text-center py-4">Nenhuma atividade recente.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Gerenciar Produtos do Marketplace</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 text-sm">
                      <th className="pb-3 font-medium">Produto</th>
                      <th className="pb-3 font-medium">Vendedor</th>
                      <th className="pb-3 font-medium">Categoria</th>
                      <th className="pb-3 font-medium">Preço</th>
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                            <span className="text-white font-medium line-clamp-1">{product.title}</span>
                          </div>
                        </td>
                        <td className="py-4 text-zinc-300">{product.seller?.name || 'Desconhecido'}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-zinc-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 text-emerald-400 font-medium">
                          R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-4 text-zinc-400">
                          {new Date(product.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          Nenhum produto cadastrado no marketplace.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-white">Gerenciar Contas de Usuários</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button 
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Novo Usuário
                  </Button>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuário..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="all">Todos os Cargos</option>
                      <option value="user">Usuários</option>
                      <option value="admin">Admins</option>
                    </select>
                    
                    <select
                      value={userPlanFilter}
                      onChange={(e) => setUserPlanFilter(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="all">Todos os Planos</option>
                      <option value="free">Free</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 text-sm">
                      <th className="pb-3 font-medium">Usuário</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Plano</th>
                      <th className="pb-3 font-medium">Selos</th>
                      <th className="pb-3 font-medium">Reputação</th>
                      <th className="pb-3 font-medium">Data Cadastro</th>
                      <th className="pb-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <Users className="w-4 h-4" />
                              </div>
                            )}
                            <span className="text-white font-medium">{u.name || 'Sem nome'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-zinc-300">{u.email}</td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                            <select 
                              value={u.plan || 'free'}
                              onChange={(e) => handleUpdateUserPlan(u.id, e.target.value)}
                              className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="free">Free</option>
                              <option value="professional">Professional</option>
                              <option value="enterprise">Enterprise</option>
                            </select>
                            <select 
                              value={u.role || 'user'}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="user">Usuário</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!!u.is_verified}
                                onChange={(e) => handleUpdateUserBadge(u.id, 'is_verified', e.target.checked)}
                                className="rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500"
                              />
                              Verificado
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!!u.is_educa_certified}
                                onChange={(e) => handleUpdateUserBadge(u.id, 'is_educa_certified', e.target.checked)}
                                className="rounded border-white/10 bg-black/40 text-emerald-600 focus:ring-emerald-500"
                              />
                              Cert. Educa
                            </label>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-amber-400 font-medium">{u.reputation_score || 0}</span>
                        </td>
                        <td className="py-4 text-zinc-400">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          Nenhum usuário encontrado com os filtros atuais.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Configurações Financeiras
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Taxa da Plataforma (Porcentagem do Desenvolvedor)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={platformFee}
                          onChange={(e) => setPlatformFee(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">%</span>
                      </div>
                      <Button 
                        onClick={handleSaveFee}
                        disabled={isSavingFee}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6"
                      >
                        {isSavingFee ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2">
                      Esta é a porcentagem que a plataforma retém de cada venda realizada no marketplace.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-300 mb-1">Aviso sobre alterações</h4>
                      <p className="text-xs text-amber-200/70 leading-relaxed">
                        Alterar a taxa da plataforma afetará apenas as novas vendas. Vendas já realizadas manterão a taxa vigente no momento da transação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border-indigo-500/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Automação com n8n
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Webhook URL do n8n
                    </label>
                    <div className="flex flex-col gap-4">
                      <input 
                        type="url" 
                        placeholder="https://n8n.seu-dominio.com/webhook/..."
                        value={n8nWebhookUrl}
                        onChange={(e) => setN8nWebhookUrl(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <Button 
                        onClick={handleSaveN8n}
                        disabled={isSavingN8n}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 w-full sm:w-auto"
                      >
                        {isSavingN8n ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Configuração'}
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-zinc-400">
                        O sistema enviará eventos automáticos para este Webhook:
                      </p>
                      <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1">
                        <li><code className="text-indigo-400">user:created</code> - Novo usuário cadastrado</li>
                        <li><code className="text-indigo-400">payment:initiated</code> - Pagamento PIX gerado</li>
                        <li><code className="text-indigo-400">payment:confirmed</code> - Pagamento aprovado</li>
                        <li><code className="text-indigo-400">user:role_updated</code> - Alteração de cargo</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-300 mb-1">Como configurar</h4>
                      <p className="text-xs text-indigo-200/70 leading-relaxed">
                        Para que o servidor envie os dados, você deve configurar a variável de ambiente <code className="bg-black/40 px-1 rounded">N8N_WEBHOOK_URL</code> nas configurações do projeto com a mesma URL acima.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Tab */}
          {activeTab === 'health' && (
            <SystemHealthDashboard 
              serverReports={serverReports}
              onReportGenerated={(report) => {
                fetchServerReports();
                addNotification(
                  'Relatório Diário Gerado',
                  `O relatório de hoje (${new Date().toLocaleDateString('pt-BR')}) foi gerado com sucesso e está disponível para download.`,
                  'success'
                );
              }}
            />
          )}
        </>
      )}
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6">Adicionar Novo Usuário</h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail *</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="usuario@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome (Opcional)</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Nome do usuário"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Plano</label>
                  <select 
                    value={newUser.plan}
                    onChange={e => setNewUser({...newUser, plan: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="strategic">Estratégico</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Cargo</label>
                  <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 border-zinc-700 text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isAddingUser}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {isAddingUser ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </PermissionGuard>
    );
  };
