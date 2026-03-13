import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import SmeeClient from "smee-client";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import cron from "node-cron";
import PDFDocument from "pdfkit";
import multer from "multer";

import { Server as SocketIOServer } from "socket.io";
import http from "http";

// ... (rest of imports)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate critical environment variables
const criticalEnvVars = [
  'MERCADO_PAGO_ACCESS_TOKEN',
  'APP_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const varName of criticalEnvVars) {
  if (!process.env[varName]) {
    console.warn(`[Security] WARNING: Environment variable ${varName} is missing. Please add it to the Secrets menu.`);
  }
}

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  frameguard: {
    action: 'deny', // Default to deny, but we'll override for the preview
  },
}));

// Allow framing for the AI Studio preview
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Configure multer for video uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Apenas MP4, WebM e OGG são permitidos.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Log de todas as requisições para depuração
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  next();
});

// Supabase Admin
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[CRITICAL] Supabase não configurado corretamente!");
} else {
  supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey
  );
}

// Ensure 'pedidos' table exists - REMOVED to prevent startup crash
// Please create table 'pedidos' manually if it doesn't exist.

// Mercado Pago
let mpClient: MercadoPagoConfig | null = null;
const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

if (mpToken) {
  console.log("[Mercado Pago] Token configurado.");
  mpClient = new MercadoPagoConfig({ accessToken: mpToken });
} else {
  console.warn("[Mercado Pago] MERCADO_PAGO_ACCESS_TOKEN ausente.");
}

// Gemini
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// n8n Webhook Helper
async function triggerWebhook(event: string, data: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[Webhook] Ignorado: N8N_WEBHOOK_URL não configurado para o evento ${event}.`);
    return;
  }

  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.warn(`[Webhook] Erro: fetch não está disponível no ambiente Node.js para o evento ${event}.`);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        source: 'ajudai-platform',
        timestamp: new Date().toISOString(),
        data
      })
    });
    console.log(`[Webhook] Evento ${event} enviado para n8n. Status: ${response.status}`);
  } catch (error) {
    console.error(`[Webhook] Erro ao enviar evento ${event}:`, error);
  }
}

const PLANS = {
  'pro_monthly': { name: 'Plano PRO (Mensal)', price: 29 },
  'strategic_monthly': { name: 'Plano Estratégico (Mensal)', price: 99 },
  'credits_5': { name: 'Pacote Básico (+5 Créditos)', price: 15 },
  'credits_15': { name: 'Pacote Intermediário (+15 Créditos)', price: 29 },
  'credits_60': { name: 'Pacote Avançado (+60 Créditos)', price: 99 },
  'highlight_7d': { name: 'Destaque de Produto (7 dias)', price: 10 },
};

// Middleware de Autenticação
const authenticateToken = async (req: any, res: any, next: any) => {
  console.log("[Auth] Token check...");
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn("[Auth] Token ausente.");
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (!supabaseAdmin) {
    console.error("[Auth] CRITICAL: Supabase não configurado.");
    return res.status(500).json({ error: 'Erro de configuração do servidor' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        throw error || new Error('Usuário não encontrado');
    }
    // Map user to the structure expected by the routes
    req.user = { sub: user.id, email: user.email, user_metadata: user.user_metadata };
    next();
  } catch (error) {
    console.error("[Auth] Token inválido ou expirado:", error);
    return res.status(403).json({ error: 'Sessão expirada ou inválida' });
  }
};

// --- ROTAS DE API (DEFINIDAS DIRETAMENTE NO APP PARA EVITAR 404) ---

// Helper to check if requester is admin
async function checkIsAdmin(req: any) {
  if (!req.user || !req.user.sub) return false;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', req.user.sub)
      .single();
      
    if (error || !profile) return false;
    return profile.role === 'admin' || profile.email === 'marcelodasilvareis30@gmail.com';
  } catch (err) {
    console.error("[AdminCheck] Erro:", err);
    return false;
  }
}

// --- PEDIDOS (OFFICIAL ORDERS FLOW) ---

app.post("/api/pedidos/new", authenticateToken, async (req: any, res: any) => {
  console.log("[API] POST /api/pedidos/new called");
  console.log("[API] Criando pedido - Body:", req.body);
  console.log("[API] Criando pedido - User:", req.user);
  try {
    const { tipo_servico, descricao, valor, tipo, localizacao } = req.body;
    if (!req.user || !req.user.sub) {
      console.error("[API] Erro: Usuário não autenticado ou sub ausente");
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    const cliente_id = req.user.sub;
    console.log("[API] Cliente ID:", cliente_id);

    if (!supabaseAdmin) {
      console.error("[API] Erro: supabaseAdmin não inicializado");
      return res.status(500).json({ error: "Erro de configuração do servidor" });
    }

    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        cliente_id,
        tipo_servico,
        descricao,
        valor,
        tipo,
        localizacao,
        status: 'aguardando_aceite'
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Erro ao inserir pedido no Supabase:", error);
      throw error;
    }

    console.log("[API] Pedido criado com sucesso:", data);

    // Trigger n8n Webhook
    // await triggerWebhook('pedido:created', { pedidoId: data.id, cliente_id, tipo_servico });

    res.json(data);
  } catch (error: any) {
    console.error("[API] Erro ao criar pedido:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pedidos/available", authenticateToken, async (req: any, res: any) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .select('*, cliente:users!cliente_id(name, avatar_url)')
      .eq('status', 'aguardando_aceite')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pedidos/my", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.sub;
    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .select('*, cliente:users!cliente_id(name, avatar_url), prestador:users!prestador_id(name, avatar_url, phone)')
      .or(`cliente_id.eq.${userId},prestador_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pedidos/:id/accept", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { valor_final, prazo } = req.body;
    const prestador_id = req.user.sub;

    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({
        prestador_id,
        valor: valor_final,
        prazo,
        status: 'aguardando_pagamento'
      })
      .eq('id', id)
      .eq('status', 'aguardando_aceite')
      .select()
      .single();

    if (error) throw error;

    // Trigger n8n Webhook
    await triggerWebhook('pedido:accepted', { pedidoId: id, prestador_id, valor_final });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pedidos/:id/create-payment", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    if (!mpClient) {
      return res.status(500).json({ error: "Mercado Pago não configurado." });
    }

    const { data: pedido, error: pError } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (pError || !pedido) throw new Error("Pedido não encontrado.");

    const preference = new Preference(mpClient);
    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    
    const response = await preference.create({
      body: {
        items: [
          {
            id: `pedido_${pedido.id}`,
            title: `Pedido #${pedido.id.slice(0, 8)}: ${pedido.tipo_servico}`,
            quantity: 1,
            unit_price: Number(pedido.valor),
            currency_id: "BRL",
          }
        ],
        external_reference: userId,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        metadata: {
          user_id: userId,
          pedido_id: pedido.id,
          type: 'pedido_payment'
        },
        back_urls: {
          success: `${appUrl}/dashboard?tab=pedidos&status=success`,
          failure: `${appUrl}/dashboard?tab=pedidos&status=failure`,
          pending: `${appUrl}/dashboard?tab=pedidos&status=pending`
        },
        auto_return: "approved",
      }
    });

    // Update pedido with payment link
    await supabaseAdmin.from('pedidos').update({ link_pagamento: response.init_point }).eq('id', id);

    res.json({ init_point: response.init_point });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pedidos/:id/complete", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const prestador_id = req.user.sub;

    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({ status: 'concluido' })
      .eq('id', id)
      .eq('prestador_id', prestador_id)
      .eq('status', 'em_andamento')
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pedidos/:id/confirm", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const cliente_id = req.user.sub;

    const { data, error } = await supabaseAdmin
      .from('pedidos')
      .update({ status: 'liberado' })
      .eq('id', id)
      .eq('cliente_id', cliente_id)
      .eq('status', 'concluido')
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mercadopago: !!mpClient,
    gemini: !!ai,
    appUrl: process.env.APP_URL,
    timestamp: new Date().toISOString()
  });
});

// --- VIDEOS ---
app.get("/api/videos", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*, author:users!user_id(name, avatar_url, plan)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to JSON if table doesn't exist yet
      console.error("Error reading videos from Supabase:", error);
      const videosPath = path.join(__dirname, 'data', 'videos.json');
      const fileData = await fs.readFile(videosPath, 'utf8');
      return res.json(JSON.parse(fileData));
    }

    // Map the Supabase data to the format expected by the frontend
    const formattedVideos = data.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail_url || `https://picsum.photos/seed/${v.id}/800/450?blur=2`,
      author: {
        id: v.user_id,
        name: v.author?.name || "Usuário",
        role: "Criador de Conteúdo",
        verified: v.author?.plan === 'pro' || v.author?.plan === 'strategic',
        avatar: v.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.user_id}`
      },
      price: Number(v.price) || 0,
      isPremium: v.is_premium || false,
      duration: v.duration || "Novo",
      category: v.category,
      rating: Number(v.rating) || 5.0,
      sales: v.sales || 0,
      videoUrl: v.video_url,
      userId: v.user_id
    }));

    res.json(formattedVideos);
  } catch (error) {
    console.error("Error reading videos:", error);
    try {
      const videosPath = path.join(__dirname, 'data', 'videos.json');
      const fileData = await fs.readFile(videosPath, 'utf8');
      res.json(JSON.parse(fileData));
    } catch (e) {
      res.json([]);
    }
  }
});

app.post("/api/videos/upload", authenticateToken, (req: any, res: any, next: any) => {
  upload.single('video')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const { title, description, category } = req.body;
    const userId = req.user.sub;
    const userEmail = req.user.email;
    const userName = req.user.user_metadata?.full_name || userEmail?.split('@')[0] || "Usuário";
    const avatarUrl = req.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

    const videoUrl = `/uploads/${req.file.filename}`;
    const thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/800/450?blur=2`;

    // Try to save to Supabase
    const { data: dbVideo, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        price: 0,
        is_premium: false,
        duration: "Novo",
        rating: 5.0,
        sales: 0
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving video to Supabase, falling back to JSON:", dbError);
      
      // Fallback to JSON
      const newVideo = {
        id: Date.now(),
        title,
        description,
        thumbnail: thumbnailUrl,
        author: { 
          name: userName, 
          role: "Criador de Conteúdo", 
          verified: false, 
          avatar: avatarUrl 
        },
        price: 0,
        isPremium: false,
        duration: "Novo",
        category,
        rating: 5.0,
        sales: 0,
        videoUrl,
        userId: userId
      };

      const dataDir = path.join(__dirname, 'data');
      if (!fsSync.existsSync(dataDir)) {
        fsSync.mkdirSync(dataDir, { recursive: true });
      }
      const videosPath = path.join(dataDir, 'videos.json');
      let videos = [];
      try {
        const data = await fs.readFile(videosPath, 'utf8');
        videos = JSON.parse(data);
      } catch (e) {
        // File might not exist yet
      }

      videos.unshift(newVideo);
      await fs.writeFile(videosPath, JSON.stringify(videos, null, 2));

      return res.json(newVideo);
    }

    // If Supabase succeeded, return the formatted video
    const formattedVideo = {
      id: dbVideo.id,
      title: dbVideo.title,
      description: dbVideo.description,
      thumbnail: dbVideo.thumbnail_url,
      author: { 
        name: userName, 
        role: "Criador de Conteúdo", 
        verified: false, 
        avatar: avatarUrl 
      },
      price: Number(dbVideo.price),
      isPremium: dbVideo.is_premium,
      duration: dbVideo.duration,
      category: dbVideo.category,
      rating: Number(dbVideo.rating),
      sales: dbVideo.sales,
      videoUrl: dbVideo.video_url,
      userId: dbVideo.user_id
    };

    res.json(formattedVideo);
  } catch (error: any) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/system/health", (req, res) => {
  console.log("[API] Health check requested");
  res.json({ 
    status: "ok", 
    service: "AJUDAI API",
    timestamp: Date.now()
  });
});

// --- AUTOMATED REPORTS ---

// Endpoint to fetch reports history
app.get("/api/admin/reports", async (req, res) => {
  try {
    // In a real app, we'd fetch from a table. For now, we'll return the history from localStorage-like mock or just a list.
    // Since we are in a server, we can use a file or just return what we have in memory for this demo.
    // Let's try to fetch from Supabase if the table exists.
    const { data, error } = await supabaseAdmin
      .from('system_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      // If table doesn't exist, return empty for now
      return res.json([]);
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Function to generate the daily report data
async function generateDailyReportData() {
  console.log("[Cron] Iniciando geração de relatório diário...");
  try {
    // Fetch stats
    const { data: users } = await supabaseAdmin.from('users').select('*');
    const { data: products } = await supabaseAdmin.from('products').select('*');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reportData = {
      total_users: users?.length || 0,
      new_users_today: users?.filter(u => new Date(u.created_at) >= today).length || 0,
      active_users_today: users?.length || 0, // Mocked for now
      total_products: products?.length || 0,
      new_products_today: products?.filter(p => new Date(p.created_at) >= today).length || 0,
      platform_status: "Operacional",
      timestamp: new Date().toISOString()
    };

    // Save to Supabase
    const { error } = await supabaseAdmin.from('system_reports').insert({
      report_date: new Date().toISOString().split('T')[0],
      data: reportData,
      status: 'completed'
    });

    if (error) {
      console.error("[Cron] Erro ao salvar relatório no Supabase:", error.message);
      // If table doesn't exist, we might want to log it
    } else {
      console.log("[Cron] Relatório diário gerado e salvo com sucesso.");
    }
  } catch (error: any) {
    console.error("[Cron] Falha crítica na geração do relatório:", error.message);
  }
}

// Schedule: 23:59 every day
// For testing purposes in this environment, we could run it more often, but let's stick to the requirement.
// cron.schedule('59 23 * * *', () => {
//   generateDailyReportData();
// });

// Also run once on startup for testing/demo if needed (optional)
// generateDailyReportData();

app.post("/api/integrations/business-site", authenticateToken, async (req: any, res: any) => {
  try {
    const { siteUrl, businessName } = req.body;
    const userId = req.user.sub;

    if (!siteUrl) return res.status(400).json({ error: 'URL do site é obrigatória' });

    // Store in Supabase (assuming a business_integrations table exists or using metadata)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ 
        business_site: siteUrl,
        business_name: businessName,
        business_status: 'pending_validation'
      })
      .eq('id', userId);

    if (dbError) throw dbError;

    // Trigger n8n Webhook for manual validation
    await triggerWebhook('business:integration_requested', {
      userId,
      email: req.user.email,
      siteUrl,
      businessName
    });

    res.json({ success: true, message: 'Solicitação de integração enviada! Nossa equipe validará seu site em breve. 🤝' });
  } catch (error: any) {
    console.error('Erro na integração de negócio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/users", authenticateToken, async (req: any, res: any) => {
  try {
    if (!await checkIsAdmin(req)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.options("/api/create-mercadopago-preference", cors());
app.post("/api/create-mercadopago-preference", authenticateToken, async (req, res) => {
  console.log(`[API] ${req.method} /api/create-mercadopago-preference called`);
  console.log("[API] Criando preferência MP. Body:", JSON.stringify(req.body));
  console.log("[API] Memória:", process.memoryUsage());
  const { planId, userId, productId } = req.body;

  // Verificação de segurança: garantir que todas as variáveis necessárias existem
  const requiredVars = ['MERCADO_PAGO_ACCESS_TOKEN', 'APP_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`[API] ERRO CRÍTICO: Variável de ambiente ${varName} não está configurada na Vercel.`);
      return res.status(500).json({ error: `Configuração incompleta: ${varName} faltando.` });
    }
  }

  if (!mpClient) {
    console.error("[API] Erro: mpClient não inicializado.");
    return res.status(500).json({ error: "Mercado Pago não configurado no servidor." });
  }
  
  let itemTitle = '';
  let itemPrice = 0;
  
  try {
    if (planId === 'marketplace_product') {
      if (!productId) {
        return res.status(400).json({ error: "ID do produto é obrigatório para compras no marketplace." });
      }
      
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('title, price')
        .eq('id', productId)
        .single();
        
      if (error || !product) {
        console.error("[API] Erro ao buscar produto:", error);
        return res.status(404).json({ error: "Produto não encontrado." });
      }
      
      itemTitle = product.title;
      itemPrice = Number(product.price);
    } else {
      const plan = PLANS[planId as keyof typeof PLANS];
      if (!plan) {
        console.error("[API] Plano inválido:", planId);
        return res.status(400).json({ error: "Plano ou pacote inválido." });
      }
      itemTitle = plan.name;
      itemPrice = Number(plan.price);
    }

    const preference = new Preference(mpClient);
    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    
    console.log("[API] Criando preferência com:", { itemTitle, itemPrice, appUrl });

    if (!appUrl) {
        console.error("[API] Erro: APP_URL não configurado.");
        return res.status(500).json({ error: "Configuração do servidor incompleta (APP_URL)." });
    }

    console.log("[API] Chamando preference.create com body:", JSON.stringify({
        items: [{ id: planId, title: itemTitle, quantity: 1, unit_price: itemPrice, currency_id: "BRL" }],
        external_reference: userId,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
    }));

    const response = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: itemTitle,
            quantity: 1,
            unit_price: itemPrice,
            currency_id: "BRL",
          }
        ],
        external_reference: userId,
        metadata: {
          user_id: userId,
          plan_id: planId,
          product_id: productId || null
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: planId === 'marketplace_product' ? `${appUrl}/marketplace?mp_status=success` : `${appUrl}/dashboard?mp_status=success`,
          failure: planId === 'marketplace_product' ? `${appUrl}/marketplace?mp_status=failure` : `${appUrl}/pricing?mp_status=failure`,
          pending: planId === 'marketplace_product' ? `${appUrl}/marketplace?mp_status=pending` : `${appUrl}/dashboard?mp_status=pending`,
        },
        auto_return: "approved",
      }
    });

    console.log("[API] Preferência criada com sucesso. ID:", response.id);
    res.json({ id: response.id, url: response.init_point || response.sandbox_init_point });
  } catch (error: any) {
    console.error("[API] Erro crítico ao criar preferência MP:", error);
    // Log the full error object if available
    if (error.response) {
        console.error("[API] Detalhes do erro MP:", JSON.stringify(error.response.data));
    }
    res.status(500).json({ error: "Erro ao processar com Mercado Pago", details: error.message });
  }
});

app.post("/api/admin/add-user", authenticateToken, async (req: any, res: any) => {
  try {
    const { email, name, plan, role } = req.body;
    
    if (!await checkIsAdmin(req)) {
      return res.status(403).json({ error: 'Acesso negado: Requer privilégios de administrador' });
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    
    if (authError) {
      // If user already exists, we might want to just update their profile
      if (authError.message.includes('already registered')) {
         // Find user by email
         const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
         const existingUser = users.find((u: any) => u.email === email);
         if (existingUser) {
            const { error: updateError } = await supabaseAdmin.from('users').update({
              plan: plan || 'free',
              role: role || 'user'
            }).eq('id', existingUser.id);
            
            if (updateError) throw updateError;
            return res.json({ success: true, message: 'Usuário já existia, plano/cargo atualizado.' });
         }
      }
      throw authError;
    }

    // The trigger will create the profile, but we can update it with the requested plan/role
    // On Serverless (Vercel), we should wait instead of using setTimeout
    if (authData?.user?.id) {
      // Wait a bit for the trigger to finish creating the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await supabaseAdmin.from('users').update({
        name: name || email.split('@')[0],
        plan: plan || 'free',
        role: role || 'user'
      }).eq('id', authData.user.id);
    }

    // Trigger n8n Webhook
    await triggerWebhook('user:created', { email, name, plan, role });

    res.json({ success: true, message: 'Convite enviado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao adicionar usuário:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

app.post("/api/admin/update-user-role", authenticateToken, async (req: any, res: any) => {
  try {
    const { userId, role } = req.body;
    
    if (!await checkIsAdmin(req)) {
      return res.status(403).json({ error: 'Acesso negado: Requer privilégios de administrador' });
    }

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (dbError) {
      throw dbError;
    }

    // Trigger n8n Webhook
    await triggerWebhook('user:role_updated', { userId, role });

    res.json({ success: true, message: 'Cargo atualizado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

app.post("/api/admin/update-user-plan", authenticateToken, async (req: any, res: any) => {
  try {
    const { userId, plan } = req.body;
    
    if (!await checkIsAdmin(req)) {
      return res.status(403).json({ error: 'Acesso negado: Requer privilégios de administrador' });
    }

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ plan })
      .eq('id', userId);

    if (dbError) {
      throw dbError;
    }

    // Trigger n8n Webhook
    await triggerWebhook('user:plan_updated', { userId, plan });

    res.json({ success: true, message: 'Plano atualizado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

app.post("/api/admin/trigger-webhook", authenticateToken, async (req: any, res: any) => {
  try {
    const { event, data } = req.body;
    // We allow any authenticated user to trigger certain events, 
    // but we'll log who did it.
    await triggerWebhook(event, { 
      ...data, 
      triggeredBy: {
        id: req.user.sub,
        email: req.user.email
      }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/public/trigger-webhook", async (req: any, res: any) => {
  try {
    const { event, data } = req.body;
    // Basic validation
    if (!event || !data) return res.status(400).json({ error: 'Missing event or data' });
    
    await triggerWebhook(`public:${event}`, data);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/delete-user/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const userIdToDelete = req.params.id;
    
    if (!await checkIsAdmin(req)) {
      return res.status(403).json({ error: 'Acesso negado: Requer privilégios de administrador' });
    }

    // Delete user from auth (this will cascade to public.users if set up, but we'll delete manually just in case)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    
    if (authError) {
      console.error('Erro ao deletar usuário do Auth:', authError);
      // We continue to try deleting from public.users even if auth fails, 
      // as it might be a ghost user.
    }

    // Delete from public.users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userIdToDelete);

    if (dbError) {
      throw dbError;
    }

    // Trigger n8n Webhook
    await triggerWebhook('user:deleted', { userId: userIdToDelete });

    res.json({ success: true, message: 'Usuário excluído com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

app.post("/api/create-mercadopago-pix", authenticateToken, async (req, res) => {
  console.log("[API] Gerando PIX MP. Body:", JSON.stringify(req.body));
  console.log("[API] Memória:", process.memoryUsage());
  const { planId, userId, productId, email } = req.body;

  if (!mpClient) {
    console.error("[API] Erro: mpClient não inicializado.");
    return res.status(500).json({ error: "Mercado Pago não configurado no servidor." });
  }
  
  let itemTitle = '';
  let itemPrice = 0;
  
  try {
    if (planId === 'marketplace_product') {
      if (!productId) {
        return res.status(400).json({ error: "ID do produto é obrigatório para compras no marketplace." });
      }
      
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('title, price')
        .eq('id', productId)
        .single();
        
      if (error || !product) {
        console.error("[API] Erro ao buscar produto para PIX:", error);
        return res.status(404).json({ error: "Produto não encontrado." });
      }
      
      itemTitle = product.title;
      itemPrice = Number(product.price);
    } else {
      const plan = PLANS[planId as keyof typeof PLANS];
      if (!plan) {
        console.error("[API] Plano inválido para PIX:", planId);
        return res.status(400).json({ error: "Plano ou pacote inválido." });
      }
      itemTitle = plan.name;
      itemPrice = Number(plan.price);
    }

    const payment = new Payment(mpClient);
    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    
    console.log("[API] Criando PIX com:", { itemTitle, itemPrice, appUrl });

    if (!appUrl) {
        console.error("[API] Erro: APP_URL não configurado.");
        return res.status(500).json({ error: "Configuração do servidor incompleta (APP_URL)." });
    }

    const response = await payment.create({
      body: {
        transaction_amount: itemPrice,
        description: itemTitle,
        payment_method_id: "pix",
        payer: {
          email: email || "usuario@ajudai.com",
        },
        external_reference: userId,
        metadata: {
          user_id: userId,
          plan_id: planId,
          product_id: productId || null
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      }
    });

    console.log("[API] PIX gerado com sucesso. ID:", response.id);
    
    if (response.point_of_interaction?.transaction_data) {
      // Trigger n8n Webhook
      await triggerWebhook('payment:initiated', {
        paymentId: response.id,
        planId,
        userId,
        email,
        amount: itemPrice,
        title: itemTitle
      });

      res.json({ 
        id: response.id, 
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        ticket_url: response.point_of_interaction.transaction_data.ticket_url
      });
    } else {
      console.error("[API] Dados do PIX não retornados:", response);
      throw new Error("Dados do PIX não retornados pelo Mercado Pago");
    }
  } catch (error: any) {
    console.error("[API] Erro crítico ao gerar PIX MP:", error);
    res.status(500).json({ error: "Erro ao gerar PIX com Mercado Pago", details: error.message });
  }
});

app.post("/api/improve-description", authenticateToken, async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini não configurado." });
  const { title, description } = req.body;
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Melhore esta descrição de um pedido de ajuda em uma plataforma de serviços. Torne-a mais profissional, clara e atraente para profissionais.\nTítulo: ${title}\nDescrição atual: ${description}\nRetorne APENAS a nova descrição melhorada, sem comentários adicionais.`,
    });
    res.json({ improvedDescription: result.text });
  } catch (error: any) {
    res.status(500).json({ error: "Erro ao melhorar descrição." });
  }
});

app.post("/api/webhooks/mercadopago", async (req, res) => {
  console.log("[Webhook] Notificação recebida");
  try {
    const { type, data } = req.body;
    if (type === "payment" && data?.id && mpClient) {
      const payment = new Payment(mpClient);
      const paymentInfo = await payment.get({ id: data.id });
      
      if (paymentInfo.status === "approved") {
        const userId = paymentInfo.external_reference;
        const planId = paymentInfo.additional_info?.items?.[0]?.id;
        
        // Trigger n8n Webhook
        await triggerWebhook('payment:confirmed', {
          paymentId: data.id,
          userId,
          planId,
          amount: paymentInfo.transaction_amount,
          status: paymentInfo.status
        });
        
        if (userId && planId) {
          if (planId.startsWith('credits_')) {
            const creditsToAdd = parseInt(planId.split('_')[1]);
            await supabaseAdmin.rpc('increment_credits', { user_id: userId, amount: creditsToAdd });
          } else if (planId === 'highlight_7d') {
            const until = new Date();
            until.setDate(until.getDate() + 7);
            const productId = paymentInfo.metadata?.product_id;
            if (productId) {
              await supabaseAdmin.from('products').update({ highlighted_until: until.toISOString() }).eq('id', productId);
            }
          } else if (planId === 'marketplace_product' || paymentInfo.metadata?.type === 'pedido_payment') {
            const productId = paymentInfo.metadata?.product_id;
            const pedidoId = paymentInfo.metadata?.pedido_id;

            if (pedidoId) {
              // Update pedido status to 'pago' and 'em_andamento'
              await supabaseAdmin.from('pedidos').update({ status: 'em_andamento' }).eq('id', pedidoId);
              
              // Notify parties
              const { data: pedido } = await supabaseAdmin.from('pedidos').select('cliente_id, prestador_id, tipo_servico').eq('id', pedidoId).single();
              if (pedido) {
                // Notify provider
                await supabaseAdmin.from('notifications').insert({
                  user_id: pedido.prestador_id,
                  title: 'Pagamento Confirmado!',
                  content: `O pagamento do pedido #${pedidoId.slice(0, 8)} foi confirmado. Você já pode iniciar o serviço.`,
                  type: 'system'
                });
                // Notify client
                await supabaseAdmin.from('notifications').insert({
                  user_id: pedido.cliente_id,
                  title: 'Pagamento Realizado',
                  content: `Seu pagamento para o pedido #${pedidoId.slice(0, 8)} foi processado com sucesso.`,
                  type: 'system'
                });
              }
            } else if (productId) {
              // Notify the seller that their product was purchased
              const { data: product } = await supabaseAdmin.from('products').select('seller_id, title').eq('id', productId).single();
              if (product) {
                await supabaseAdmin.from('notifications').insert({
                  user_id: product.seller_id,
                  title: 'Venda Realizada!',
                  content: `Seu produto "${product.title}" foi vendido via Mercado Pago.`,
                  type: 'system'
                });
              }
            }
          } else {
            await supabaseAdmin.from('users').update({ plan: planId.replace('_monthly', '') }).eq('id', userId);
          }
        }
      }
    }
  } catch (e) {
    console.error("[Webhook] Erro:", e);
  }
  res.status(200).send("OK");
});

// --- FALLBACK PARA API (EVITA 404 DO VITE) ---
// Movido para o final do arquivo, antes do frontend

// --- RELATÓRIOS AUTOMÁTICOS (CRON) ---

const REPORTS_DIR = path.resolve(__dirname, "reports");

async function ensureReportsDir() {
  try {
    await fs.access(REPORTS_DIR);
  } catch {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  }
}

async function generateDailyReport() {
  console.log("[Cron] Iniciando geração de relatório diário...");
  await ensureReportsDir();

  try {
    // 1. Coletar Dados
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: users } = await supabaseAdmin.from('users').select('*');
    const { data: helpRequests } = await supabaseAdmin.from('help_requests').select('*');
    const { data: products } = await supabaseAdmin.from('products').select('*');
    
    const newUsers = users?.filter(u => u.created_at.startsWith(yesterdayStr)) || [];
    const completedHelps = helpRequests?.filter(h => h.status === 'completed') || [];
    const pendingHelps = helpRequests?.filter(h => h.status === 'pending') || [];

    // 2. Criar PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `relatorio-${yesterdayStr}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    const stream = (await import("fs")).createWriteStream(filePath);

    doc.pipe(stream);

    // Identidade Visual AJUDAÍ+
    doc.fillColor("#4F46E5").fontSize(26).text("AJUDAÍ+", { align: "center" });
    doc.fillColor("#6B7280").fontSize(14).text("Relatório Diário de Operações", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#E5E7EB");
    doc.moveDown();

    doc.fillColor("#111827").fontSize(18).text(`Resumo do Dia: ${yesterdayStr}`);
    doc.moveDown();

    // Dados Gerais
    doc.fontSize(14).fillColor("#374151").text("📊 Dados Gerais do Sistema");
    doc.fontSize(12).fillColor("#4B5563");
    doc.text(`- Total de usuários: ${users?.length || 0}`);
    doc.text(`- Novos usuários (ontem): ${newUsers.length}`);
    doc.text(`- Total de pedidos de ajuda: ${helpRequests?.length || 0}`);
    doc.text(`- Ajudas concluídas: ${completedHelps.length}`);
    doc.text(`- Pedidos pendentes: ${pendingHelps.length}`);
    doc.text(`- Produtos no Marketplace: ${products?.length || 0}`);
    doc.moveDown();

    // Métricas de Engajamento
    doc.fontSize(14).fillColor("#374151").text("📈 Métricas de Engajamento");
    doc.fontSize(12).fillColor("#4B5563");
    doc.text(`- Taxa de conversão de ajuda: ${helpRequests?.length ? ((completedHelps.length / helpRequests.length) * 100).toFixed(1) : 0}%`);
    doc.text(`- Crescimento de base: ${users?.length ? ((newUsers.length / users.length) * 100).toFixed(1) : 0}%`);
    doc.moveDown();

    // Lista de Atividades (Resumo)
    doc.fontSize(14).fillColor("#374151").text("👤 Atividades Recentes");
    doc.fontSize(10).fillColor("#6B7280");
    const recentHelps = helpRequests?.slice(-5) || [];
    recentHelps.forEach((h, i) => {
      doc.text(`${i+1}. ${h.title} - Status: ${h.status}`);
    });

    doc.end();

    console.log(`[Cron] Relatório gerado: ${fileName}`);

    // 3. Salvar no Supabase para histórico de dados estruturados
    const reportData = {
      total_users: users?.length || 0,
      new_users_today: newUsers.length,
      active_users_today: users?.length || 0,
      total_products: products?.length || 0,
      new_products_today: products?.filter(p => p.created_at.startsWith(yesterdayStr)).length || 0,
      platform_status: "Operacional",
      timestamp: new Date().toISOString()
    };

    await supabaseAdmin.from('system_reports').insert({
      report_date: yesterdayStr,
      data: reportData,
      status: 'completed'
    });

    // 4. Registrar Notificação (Simulado via arquivo JSON para persistência simples)
    const notificationsPath = path.join(REPORTS_DIR, "notifications.json");
    let notifications = [];
    try {
      const content = await fs.readFile(notificationsPath, "utf-8");
      notifications = JSON.parse(content);
    } catch {}

    notifications.unshift({
      id: Date.now(),
      title: "Relatório Automático Gerado",
      message: `O relatório completo de ${yesterdayStr} já está disponível para download.`,
      type: "success",
      timestamp: new Date().toISOString(),
      fileName: fileName,
      read: false
    });

    await fs.writeFile(notificationsPath, JSON.stringify(notifications.slice(0, 20)));

  } catch (error) {
    console.error("[Cron] Erro ao gerar relatório:", error);
  }
}

// Agendar para 23:59 todos os dias
cron.schedule("59 23 * * *", () => {
  generateDailyReport();
});

// Endpoint para listar relatórios e notificações
app.get("/api/system/admin/reports", authenticateToken, async (req: any, res) => {
  if (req.user.email !== 'marcelodasilvareis30@gmail.com' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso negado." });
  }

  try {
    await ensureReportsDir();
    const files = await fs.readdir(REPORTS_DIR);
    const reports = files.filter(f => f.endsWith(".pdf")).map(f => ({
      name: f,
      date: f.replace("relatorio-", "").replace(".pdf", ""),
      url: `/api/system/admin/reports/download/${f}`
    }));

    const notificationsPath = path.join(REPORTS_DIR, "notifications.json");
    let notifications = [];
    try {
      const content = await fs.readFile(notificationsPath, "utf-8");
      notifications = JSON.parse(content);
    } catch {}

    res.json({ reports, notifications });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar relatórios." });
  }
});

app.get("/api/system/admin/reports/download/:filename", authenticateToken, async (req: any, res) => {
  if (req.user.email !== 'marcelodasilvareis30@gmail.com' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso negado." });
  }

  const { filename } = req.params;
  const filePath = path.join(REPORTS_DIR, filename);

  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch {
    res.status(404).json({ error: "Arquivo não encontrado." });
  }
});

// Endpoint para forçar geração (para testes/demo)
app.post("/api/system/admin/reports/generate", authenticateToken, async (req: any, res) => {
  if (req.user.email !== 'marcelodasilvareis30@gmail.com' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso negado." });
  }
  await generateDailyReport();
  res.json({ message: "Relatório gerado com sucesso." });
});

// Logo Generation Route
app.get("/api/admin/generate-logo", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).send("GEMINI_API_KEY missing");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: 'A simple, modern logo for a web application named "AJUDAÍ+". The logo should incorporate a helping hand or connection symbol. Clean background, minimalist, tech startup vibe, vibrant colors like indigo and emerald.' }],
      },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      const publicDir = path.join(process.cwd(), 'public');
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, 'logo.png'), buffer);
      return res.send("Logo generated and saved to public/logo.png");
    }
    res.status(500).send("No image generated");
  } catch (error: any) {
    res.status(500).send("Error: " + error.message);
  }
});

// --- WHATSAPP BUSINESS API ---

// Helper to send WhatsApp messages
async function sendWhatsAppMessage(to: string, text: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.error("[WhatsApp] Erro: WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurado.");
    return;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[WhatsApp] Erro ao enviar mensagem:", data);
    } else {
      console.log(`[WhatsApp] Mensagem enviada para ${to}`);
    }
  } catch (error) {
    console.error("[WhatsApp] Erro na requisição de envio:", error);
  }
}

// Verification endpoint for Meta
app.get("/api/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("[WhatsApp] Webhook verificado com sucesso!");
      res.status(200).send(challenge);
    } else {
      console.warn("[WhatsApp] Falha na verificação do Webhook.");
      res.sendStatus(403);
    }
  }
});

// Event handler for WhatsApp messages
app.post("/api/webhooks/whatsapp", async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Sender's phone number
      const msgBody = message.text?.body;

      if (msgBody && ai) {
        console.log(`[WhatsApp] Mensagem recebida de ${from}: ${msgBody}`);

        try {
          // Process with Gemini
          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: msgBody,
            config: {
              systemInstruction: "Você é o assistente virtual oficial do AJUDAÍ+, uma plataforma de serviços e ajuda mútua. Seu objetivo é ajudar usuários a encontrar serviços, tirar dúvidas sobre a plataforma e fornecer suporte rápido. Seja educado, prestativo e use emojis para tornar a conversa amigável. Se o usuário perguntar sobre preços, mencione que temos planos a partir de R$ 29/mês. Se ele quiser um serviço, diga que ele pode postar um pedido no site.",
            }
          });

          const aiResponse = result.text;
          await sendWhatsAppMessage(from, aiResponse);
        } catch (error) {
          console.error("[WhatsApp] Erro ao processar com Gemini:", error);
          await sendWhatsAppMessage(from, "Desculpe, estou tendo dificuldades técnicas no momento. Por favor, tente novamente mais tarde.");
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// --- FRONTEND (VITE / STATIC) ---

// --- FALLBACK PARA API (EVITA 404 DO VITE) ---
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `Rota de API não encontrada: ${req.method} ${req.path}` });
});

async function startServer() {
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // WebSocket logic for collaboration
  io.on("connection", (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`[Socket.io] User ${socket.id} joined room ${roomId}`);
    });

    // Document Editing
    socket.on("document-change", (data) => {
      // data: { roomId, content }
      socket.to(data.roomId).emit("document-update", data.content);
    });

    // Whiteboard
    socket.on("whiteboard-draw", (data) => {
      // data: { roomId, line }
      socket.to(data.roomId).emit("whiteboard-update", data.line);
    });

    socket.on("whiteboard-clear", (roomId) => {
      socket.to(roomId).emit("whiteboard-cleared");
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Rodando em http://localhost:${PORT}`);
    console.log(`[Server] APP_URL: ${process.env.APP_URL}`);
    
    if (process.env.NODE_ENV !== "production") {
      const smee = new SmeeClient({
        source: `https://smee.io/${Math.random().toString(36).substring(2, 15)}`,
        target: `http://localhost:${PORT}/api/webhooks/mercadopago`,
        logger: console
      });
      smee.start();
    }
  });
}

startServer();

export default app;
