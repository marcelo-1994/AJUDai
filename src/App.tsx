import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { supabase } from './lib/supabase';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Requests = lazy(() => import('./pages/Requests').then(m => ({ default: m.Requests })));
const RequestDetails = lazy(() => import('./pages/RequestDetails').then(m => ({ default: m.RequestDetails })));
const CreateRequest = lazy(() => import('./pages/CreateRequest').then(m => ({ default: m.CreateRequest })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Ranking = lazy(() => import('./pages/Ranking').then(m => ({ default: m.Ranking })));
const Professionals = lazy(() => import('./pages/Professionals').then(m => ({ default: m.Professionals })));
const Marketplace = lazy(() => import('./pages/Marketplace').then(m => ({ default: m.Marketplace })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const ExploreProjects = lazy(() => import('./pages/ExploreProjects').then(m => ({ default: m.ExploreProjects })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const ArchitectureDocs = lazy(() => import('./pages/ArchitectureDocs').then(m => ({ default: m.ArchitectureDocs })));
const Integrations = lazy(() => import('./pages/Integrations').then(m => ({ default: m.Integrations })));
const Timeline = lazy(() => import('./pages/Timeline').then(m => ({ default: m.Timeline })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Invite = lazy(() => import('./pages/Invite').then(m => ({ default: m.Invite })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword').then(m => ({ default: m.UpdatePassword })));
const Affiliates = lazy(() => import('./pages/Affiliates').then(m => ({ default: m.Affiliates })));
const Pedidos = lazy(() => import('./pages/Pedidos'));
const CreatePedido = lazy(() => import('./pages/CreatePedido'));
const PedidoDetails = lazy(() => import('./pages/PedidoDetails'));
const StrategicPause = lazy(() => import('./pages/StrategicPause'));
const Educa = lazy(() => import('./pages/Educa'));
const AjudaiPlay = lazy(() => import('./pages/AjudaiPlay').then(m => ({ default: m.AjudaiPlay })));
const EntertainmentHub = lazy(() => import('./pages/EntertainmentHub'));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const Workspace = lazy(() => import('./pages/Workspace'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const PersonalTools = lazy(() => import('./pages/PersonalTools').then(m => ({ default: m.PersonalTools })));
const Ads = lazy(() => import('./pages/Ads').then(m => ({ default: m.Ads })));

import { IdleOverlay } from './components/IdleOverlay';
import { TwoFactorGuard } from './components/TwoFactorGuard';
import { InstallPrompt } from './components/InstallPrompt';
import { BetaNotice } from './components/BetaNotice';
import { QuickAccess } from './components/QuickAccess';
import { CreatorButton } from './components/CreatorButton';
import { BusinessPlan } from './components/BusinessPlan';
import { ContractGuard } from './components/ContractGuard';
import { PlatformTutorial } from './components/PlatformTutorial';

const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-500">
    {/* Atmospheric Background */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-purple-500/20 rounded-full"></div>
        <div className="absolute inset-4 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold tracking-tighter text-white animate-pulse">AJUDAÍ+</h2>
        <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase mt-2">Carregando Experiência</p>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  return <ContractGuard>{children}</ContractGuard>;
};

const GlobalAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL has a recovery token
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/update-password');
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalAuthListener />
          <TwoFactorGuard>
            <IdleOverlay />
            <BetaNotice />
            <InstallPrompt />
            <QuickAccess />
            <CreatorButton />
            <BusinessPlan />
            <PlatformTutorial />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route element={<Layout />}>
                  <Route path="/explore" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="update-password" element={<UpdatePassword />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="requests/:id" element={<RequestDetails />} />
                  <Route path="explore-projects" element={<ExploreProjects />} />
                  <Route path="architecture" element={<ArchitectureDocs />} />
                  <Route path="search" element={<Search />} />
                  <Route path="timeline" element={<Timeline />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="ranking" element={<Ranking />} />
                  <Route path="professionals" element={<Professionals />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="pedidos" element={<Pedidos />} />
                  <Route path="pedidos/novo" element={<CreatePedido />} />
                  <Route path="pedidos/:id" element={<PedidoDetails />} />
                  <Route path="workspace/:id" element={<Workspace />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="affiliates" element={<Affiliates />} />
                  <Route path="strategic-pause" element={<StrategicPause />} />
                  <Route path="educa" element={<Educa />} />
                  <Route path="play" element={<AjudaiPlay />} />
                  <Route path="entertainment" element={<EntertainmentHub />} />
                  
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="create-request" element={
                    <ProtectedRoute>
                      <CreateRequest />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="user/:id" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="community" element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  } />
                  <Route path="integrations" element={
                    <ProtectedRoute>
                      <Integrations />
                    </ProtectedRoute>
                  } />
                  <Route path="admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="invite" element={
                    <ProtectedRoute>
                      <Invite />
                    </ProtectedRoute>
                  } />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="ai-assistant" element={
                    <ProtectedRoute>
                      <AIAssistant />
                    </ProtectedRoute>
                  } />
                  <Route path="personal-tools" element={
                    <ProtectedRoute>
                      <PersonalTools />
                    </ProtectedRoute>
                  } />
                  <Route path="ads" element={<Ads />} />
                </Route>
              </Routes>
            </Suspense>
          </TwoFactorGuard>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
