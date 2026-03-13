import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, Globe, Key, Loader2, RefreshCw, Terminal, Zap, FileText, Download, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HealthCheck {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'error' | 'loading';
  message: string;
  category: 'database' | 'environment' | 'api' | 'security';
  resolution?: string;
  sql?: string;
  code?: string;
}

interface SystemHealthDashboardProps {
  onReportGenerated?: (report: any) => void;
  serverReports?: any[];
}

export const SystemHealthDashboard = ({ onReportGenerated, serverReports = [] }: SystemHealthDashboardProps) => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [showLogs, setShowLogs] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [isForcingReport, setIsForcingReport] = useState(false);

  useEffect(() => {
    // Load report history from server
    const fetchReportHistory = async () => {
      try {
        const response = await fetch(`/api/admin/reports?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setReportHistory(data);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico de relatórios:', error);
      }
    };
    
    fetchReportHistory();
  }, []);

  const saveReportToHistory = (report: any) => {
    const updated = [report, ...reportHistory].slice(0, 10);
    setReportHistory(updated);
  };

  const generateDailyPDF = async (reportData?: any) => {
    setIsGeneratingPDF(true);
    try {
      // 1. Fetch Data for Report (if not provided)
      let users = [];
      let products = [];
      
      if (!reportData) {
        const { data: usersData, error: uError } = await supabase.from('users').select('*');
        const { data: productsData, error: pError } = await supabase.from('products').select('*');
        
        if (uError || pError) {
          console.warn('Erro ao buscar dados do Supabase:', uError || pError);
        }
        
        users = usersData || [];
        products = productsData || [];
      } else {
        // Use data from automated report
        const data = typeof reportData.data === 'string' ? JSON.parse(reportData.data) : reportData.data;
        users = new Array(data.total_users || 0).fill({});
        products = new Array(data.total_products || 0).fill({});
        // Update reportData.data to be the parsed object for consistency in the rest of the function
        reportData.data = data;
      }
      
      // 2. Create PDF
      const doc = new jsPDF() as any;
      
      // Check if autoTable is available
      if (typeof autoTable !== 'function') {
        throw new Error('O plugin de tabelas PDF não foi carregado corretamente.');
      }

      const dateStr = reportData && reportData.report_date 
        ? new Date(reportData.report_date).toLocaleDateString('pt-BR') 
        : new Date().toLocaleDateString('pt-BR');
      const timeStr = reportData && reportData.created_at 
        ? new Date(reportData.created_at).toLocaleTimeString('pt-BR') 
        : new Date().toLocaleTimeString('pt-BR');

      // Header
      doc.setFillColor(79, 70, 229); // Indigo-600
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Relatório Diário AJUDAÍ+', 15, 25);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 15, 33);

      // System Health Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('1. Saúde da Infraestrutura', 15, 55);
      
      const healthData = checks.map(c => [
        c.category.toUpperCase(),
        c.name,
        c.status === 'ok' ? 'OK' : c.status === 'warning' ? 'AVISO' : 'ERRO',
        c.message
      ]);

      if (healthData.length > 0) {
        autoTable(doc, {
          startY: 60,
          head: [['Categoria', 'Verificação', 'Status', 'Detalhes']],
          body: healthData,
          headStyles: { fillColor: [79, 70, 229] },
        });
      }

      // User Statistics
      const finalY = (doc as any).lastAutoTable?.finalY || 60 + 15;
      doc.setFontSize(16);
      doc.text('2. Estatísticas de Usuários', 15, finalY + 15);
      
      const userStats = reportData ? [
        ['Total de Usuários', reportData.data.total_users],
        ['Novos Hoje', reportData.data.new_users_today],
        ['Usuários Ativos', reportData.data.active_users_today],
        ['Status da Plataforma', reportData.data.platform_status]
      ] : [
        ['Total de Usuários', users?.length || 0],
        ['Usuários Premium', users?.filter((u: any) => u.plan === 'premium').length || 0],
        ['Administradores', users?.filter((u: any) => u.role === 'admin').length || 0],
        ['Novos Hoje', users?.filter((u: any) => new Date(u.created_at).toDateString() === new Date().toDateString()).length || 0]
      ];

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Métrica', 'Valor']],
        body: userStats,
        headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
      });

      // Product Statistics
      const productY = (doc as any).lastAutoTable?.finalY || (finalY + 60);
      doc.setFontSize(16);
      doc.text('3. Atividade do Marketplace', 15, productY + 15);
      
      const productStats = reportData ? [
        ['Total de Produtos', reportData.data.total_products],
        ['Novos Hoje', reportData.data.new_products_today]
      ] : [
        ['Total de Produtos', products?.length || 0],
        ['Produtos Ativos', products?.filter((p: any) => !p.is_sold).length || 0],
        ['Vendas Hoje', 0]
      ];

      autoTable(doc, {
        startY: productY + 20,
        head: [['Métrica', 'Valor']],
        body: productStats,
        headStyles: { fillColor: [245, 158, 11] }, // Amber-500
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount} - Sistema AJUDAÍ+`, 105, 285, { align: 'center' });
      }

      // 3. Save
      const fileName = `relatorio-ajudai-${reportData ? reportData.report_date : new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar relatório PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const forceGenerateReport = async () => {
    setIsForcingReport(true);
    try {
      const response = await fetch('/api/system/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        }
      });
      if (response.ok) {
        alert('Relatório diário gerado com sucesso no servidor!');
        if (onReportGenerated) onReportGenerated({});
      }
    } catch (error) {
      console.error("Erro ao forçar relatório:", error);
    } finally {
      setIsForcingReport(false);
    }
  };

  const downloadServerReport = async (filename: string) => {
    try {
      const response = await fetch(`/api/system/admin/reports/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ajudai_token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
    }
  };

  const runChecks = async () => {
    setIsRefreshing(true);
    const newChecks: HealthCheck[] = [];

    // 1. Database Connection Check
    try {
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      newChecks.push({
        id: 'db-conn',
        name: 'Conexão com Banco de Dados',
        status: error ? 'error' : 'ok',
        message: error ? `Erro de conexão: ${error.message}` : 'Conexão estabelecida com sucesso.',
        category: 'database'
      });
    } catch (e: any) {
      newChecks.push({
        id: 'db-conn',
        name: 'Conexão com Banco de Dados',
        status: 'error',
        message: `Falha crítica: ${e.message}`,
        category: 'database'
      });
    }

    // 2. Schema Checks (Missing Columns)
    const schemaChecks = [
      { table: 'users', column: 'two_factor_enabled', type: 'BOOLEAN DEFAULT FALSE' },
      { table: 'users', column: 'reputation_score', type: 'INTEGER DEFAULT 0' },
      { table: 'users', column: 'plan', type: 'TEXT DEFAULT \'free\'' },
      { table: 'users', column: 'role', type: 'TEXT DEFAULT \'user\'' },
    ];

    for (const check of schemaChecks) {
      try {
        const { error } = await supabase.from(check.table).select(check.column).limit(1);
        if (error && error.message.includes('column') && error.message.includes('not found')) {
          newChecks.push({
            id: `schema-${check.table}-${check.column}`,
            name: `Coluna: ${check.table}.${check.column}`,
            status: 'error',
            message: `A coluna '${check.column}' está ausente na tabela '${check.table}'.`,
            category: 'database',
            resolution: `Execute o comando SQL para adicionar a coluna '${check.column}'.`,
            sql: `ALTER TABLE ${check.table} ADD COLUMN IF NOT EXISTS ${check.column} ${check.type};`
          });
        }
      } catch (e) {
        // Ignore other errors here
      }
    }

    // 3. Environment Variables Check
    const criticalEnvVars = [
      { name: 'VITE_SUPABASE_URL', label: 'Supabase URL' },
      { name: 'VITE_SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
      { name: 'STRIPE_SECRET_KEY', label: 'Stripe API Key' },
      { name: 'MERCADO_PAGO_ACCESS_TOKEN', label: 'Mercado Pago Token' },
      { name: 'GEMINI_API_KEY', label: 'Gemini API Key' },
    ];

    for (const env of criticalEnvVars) {
      const value = (import.meta as any).env[env.name];
      if (!value && env.name.startsWith('VITE_')) {
        newChecks.push({
          id: `env-${env.name}`,
          name: `Variável: ${env.label}`,
          status: 'error',
          message: `A variável de ambiente ${env.name} não foi encontrada no cliente.`,
          category: 'environment',
          resolution: `Adicione a linha abaixo ao seu arquivo .env local.`,
          code: `${env.name}=seu_valor_aqui`
        });
      }
    }

    // 4. API Health & Server Status
    try {
      const response = await fetch(`/api/system/health?t=${Date.now()}`);
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        newChecks.push({
          id: 'api-gateway',
          name: 'API Gateway (Server)',
          status: response.ok ? 'ok' : 'error',
          message: response.ok ? `Servidor online. Uptime: ${Math.floor(data.server.uptime / 60)} min.` : 'O servidor backend não está respondendo corretamente.',
          category: 'api'
        });

        // Environment checks from server perspective
        const envVars = [
          { key: 'mercadopago', label: 'Mercado Pago', env: 'MERCADO_PAGO_ACCESS_TOKEN' },
          { key: 'gemini', label: 'Gemini AI', env: 'GEMINI_API_KEY' },
          { key: 'n8n', label: 'n8n Webhook', env: 'N8N_WEBHOOK_URL' },
        ];

        for (const env of envVars) {
          const isConfigured = data.environment[env.key];
          newChecks.push({
            id: `server-env-${env.key}`,
            name: `Configuração: ${env.label}`,
            status: isConfigured ? 'ok' : 'warning',
            message: isConfigured ? `Serviço ${env.label} configurado corretamente no servidor.` : `O serviço ${env.label} não está configurado no servidor.`,
            category: 'environment',
            resolution: isConfigured ? undefined : `Adicione esta variável ao ambiente do servidor.`,
            code: `${env.env}=seu_valor_aqui`
          });
        }
      } else {
        const text = await response.text();
        newChecks.push({
          id: 'api-gateway',
          name: 'API Gateway (Server)',
          status: 'error',
          message: `Resposta inválida do servidor (não é JSON). Recebido: ${text.substring(0, 50)}...`,
          category: 'api',
          resolution: 'Verifique se o servidor backend está rodando corretamente e se a rota /api/system/health existe.',
          code: text
        });
      }

    } catch (e: any) {
      newChecks.push({
        id: 'api-gateway',
        name: 'API Gateway (Server)',
        status: 'error',
        message: `Erro ao conectar com o servidor: ${e.message}`,
        category: 'api'
      });
    }

    setChecks(newChecks);
    setLastCheck(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado com sucesso!');
  };

  const generateReport = () => {
    const report = checks.map(c => {
      const status = c.status === 'ok' ? '✅ OK' : c.status === 'warning' ? '⚠️ AVISO' : '❌ ERRO';
      return `[${c.category.toUpperCase()}] ${c.name}: ${status}\n- Mensagem: ${c.message}${c.resolution ? `\n- Resolução: ${c.resolution}` : ''}${c.sql ? `\n- SQL: ${c.sql}` : ''}${c.code ? `\n- Código: ${c.code}` : ''}`;
    }).join('\n\n---\n\n');

    const fullReport = `RELATÓRIO DE SAÚDE DO SISTEMA - ${lastCheck.toLocaleString('pt-BR')}\n\n${report}`;
    return fullReport;
  };

  const exportReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-saude-${lastCheck.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReportForAI = () => {
    const report = generateReport();
    const prompt = `Olá, sou o administrador do sistema. O diagnóstico inteligente detectou os seguintes problemas na minha infraestrutura. Por favor, analise e me ajude a corrigir:\n\n${report}`;
    copyToClipboard(prompt);
    alert('Relatório formatado para IA copiado! Você pode colar agora no chat do assistente.');
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'loading': return <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />;
    }
  };

  const errorCount = checks.filter(c => c.status === 'error').length;

  const [toolboxSnippets, setToolboxSnippets] = useState([
    {
      title: 'Arquivo .env Completo',
      description: 'Template básico para variáveis de ambiente.',
      code: `# Supabase\nVITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=\n\n# Pagamentos\nSTRIPE_SECRET_KEY=\nMERCADOPAGO_ACCESS_TOKEN=\n\n# IA\nGEMINI_API_KEY=\n\n# Automação\nN8N_WEBHOOK_URL=`
    },
    {
      title: 'Configuração do Servidor (CORS)',
      description: 'Snippet para permitir origens específicas no Express.',
      code: `app.use(cors({\n  origin: process.env.APP_URL,\n  credentials: true\n}));`
    },
    {
      title: 'Fix de Banco de Dados (Users)',
      description: 'Script SQL para garantir todas as colunas necessárias.',
      code: `ALTER TABLE users \nADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,\nADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0,\nADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',\nADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`
    },
    {
      title: 'Tabela de Relatórios Automáticos',
      description: 'Script SQL para criar a tabela de histórico de relatórios.',
      code: `CREATE TABLE IF NOT EXISTS system_reports (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,\n  report_date DATE NOT NULL,\n  data JSONB NOT NULL,\n  status TEXT DEFAULT 'completed'\n);`
    },
    {
      title: 'Configuração do Mascote (Ajudinha)',
      description: 'Snippet para resetar ou forçar exibição do assistente.',
      code: `// No console do navegador:\nlocalStorage.removeItem('ajudinha_dismissed');\nwindow.dispatchEvent(new Event('storage'));`
    }
  ]);

  const updateSnippet = (index: number, newCode: string) => {
    const updated = [...toolboxSnippets];
    updated[index].code = newCode;
    setToolboxSnippets(updated);
  };

  return (
    <div className="space-y-6">
      {/* Log Viewer Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col border-indigo-500/30">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Logs Completos do Sistema</h3>
              </div>
              <button 
                onClick={() => setShowLogs(false)}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
              <pre className="text-xs font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed">
                {generateReport()}
              </pre>
            </div>
            <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={copyReportForAI}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Copiar Relatório para IA
              </button>
              <button 
                onClick={exportReport}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Globe className="h-4 w-4" />
                Baixar Arquivo .txt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="h-6 w-6 text-indigo-400" />
            📌 Saúde da Plataforma
          </h2>
          <p className="text-zinc-400 text-sm">Monitoramento em tempo real e relatórios automatizados.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowToolbox(!showToolbox)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showToolbox ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="h-4 w-4" />
            Caixa de Ferramentas
          </button>
          <button
            onClick={runChecks}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Analisando...' : 'Recarregar'}
          </button>
        </div>
      </div>

      {/* Toolbox Section */}
      {showToolbox && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {toolboxSnippets.map((snippet, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-2xl border-indigo-500/20 flex flex-col">
              <h4 className="text-white font-bold text-sm mb-1">{snippet.title}</h4>
              <p className="text-zinc-500 text-xs mb-3">{snippet.description}</p>
              <div className="relative group mt-auto">
                <textarea
                  value={snippet.code}
                  onChange={(e) => updateSnippet(idx, e.target.value)}
                  className="w-full bg-black/40 p-3 rounded-lg text-[10px] font-mono text-indigo-200 border border-white/5 h-32 focus:outline-none focus:border-indigo-500/50 resize-none"
                  spellCheck={false}
                />
                <button
                  onClick={() => copyToClipboard(snippet.code)}
                  className="absolute top-2 right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copiar Código"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm font-medium">Saúde Geral</span>
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {errorCount === 0 ? '100%' : `${Math.max(0, 100 - (errorCount * 15))}%`}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Baseado em {checks.length} verificações ativas.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm font-medium">Problemas Críticos</span>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">{errorCount}</div>
          <p className="text-xs text-zinc-500 mt-1">Requerem atenção imediata.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-indigo-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm font-medium">Última Análise</span>
            <RefreshCw className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {lastCheck.toLocaleTimeString('pt-BR')}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Análise realizada localmente.</p>
        </div>
      </div>

      {/* Detailed Checks */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">Relatório Detalhado</h3>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">OK: {checks.filter(c => c.status === 'ok').length}</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase">ERRO: {errorCount}</span>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {checks.map((check) => (
            <div key={check.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-1">{getStatusIcon(check.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{check.name}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        check.category === 'database' ? 'bg-blue-500/20 text-blue-400' :
                        check.category === 'environment' ? 'bg-purple-500/20 text-purple-400' :
                        check.category === 'api' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {check.category}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{check.message}</p>
                    
                    {(check.resolution || check.sql || check.code) && (
                      <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2">
                          <Terminal className="h-3 w-3" /> Sugestão de Resolução:
                        </p>
                        <p className="text-xs text-zinc-300 mb-3">{check.resolution}</p>
                        
                        {(check.sql || check.code) && (
                          <div className="relative group">
                            <pre className="bg-black/40 p-3 rounded-lg text-[10px] font-mono text-indigo-200 overflow-x-auto border border-white/5">
                              {check.sql || check.code}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(check.sql || check.code!)}
                              className="absolute top-2 right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copiar Código"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <h3 className="text-lg font-bold text-white">Insight da IA de Infraestrutura</h3>
              <div className="flex gap-2">
                <button 
                  onClick={forceGenerateReport}
                  disabled={isForcingReport}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  title="Forçar geração do relatório diário agora"
                >
                  {isForcingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Gerar Agora (Server)
                </button>
                <button 
                  onClick={generateDailyPDF}
                  disabled={isGeneratingPDF}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGeneratingPDF ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  Download PDF Instantâneo
                </button>
              </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {errorCount > 0 
                ? `Detectei ${errorCount} inconsistências que podem afetar a experiência do usuário. Recomendo utilizar a "Caixa de Ferramentas" acima para copiar os snippets de configuração necessários e restaurar a integridade total do sistema.`
                : "Seu sistema está operando em condições ideais. Todas as tabelas críticas, colunas e conexões externas estão validadas e respondendo dentro dos parâmetros esperados."}
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <button 
                onClick={() => setShowLogs(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Ver Logs Completos <ChevronRight className="h-3 w-3" />
              </button>
              <button 
                onClick={exportReport}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Exportar Relatório <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      {(reportHistory.length > 0 || serverReports.length > 0) && (
        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            Histórico de Relatórios Diários
          </h3>
          <div className="space-y-3">
            {/* Server Reports (Automated) */}
            {serverReports.map((report, idx) => (
              <div key={`server-${idx}`} className="flex items-center justify-between p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Globe className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Relatório Automático: {report.date}</p>
                    <p className="text-[10px] text-zinc-500">Armazenado no Servidor</p>
                  </div>
                </div>
                <button 
                  onClick={() => downloadServerReport(report.name)}
                  className="p-2 text-indigo-400 hover:text-white transition-colors flex items-center gap-2"
                  title="Baixar do Servidor"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Baixar PDF</span>
                </button>
              </div>
            ))}

            {/* Local Reports (Manual) */}
            {reportHistory.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-500/10 rounded-lg">
                    <FileText className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Relatório Manual: {report.report_date ? new Date(report.report_date).toLocaleDateString('pt-BR') : 'Data Indisponível'}</p>
                    <p className="text-[10px] text-zinc-500">Gerado em {new Date(report.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => generateDailyPDF(report)}
                  className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Baixar PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

