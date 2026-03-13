-- Supabase Schema for AJUDAÍ

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'strategic')),
  reputation_score INTEGER DEFAULT 0,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Help Requests Table
CREATE TABLE help_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Responses Table
CREATE TABLE responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Subscriptions Table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON users FOR UPDATE USING (auth.uid() = id);

-- Help Requests
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Help requests are viewable by everyone." ON help_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create help requests." ON help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own help requests." ON help_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own help requests." ON help_requests FOR DELETE USING (auth.uid() = user_id);

-- Responses
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responses are viewable by everyone." ON responses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create responses." ON responses FOR INSERT WITH CHECK (auth.uid() = responder_id);
CREATE POLICY "Users can update their own responses." ON responses FOR UPDATE USING (auth.uid() = responder_id);
CREATE POLICY "Request owners can update responses to accept them." ON responses FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM help_requests 
    WHERE help_requests.id = responses.request_id 
    AND help_requests.user_id = auth.uid()
  )
);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews." ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions." ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 6. Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. User Categories of Interest
CREATE TABLE user_categories (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  PRIMARY KEY (user_id, category)
);

-- 8. Badges
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- 9. User Badges
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- 11. Pedidos (Official Orders Flow)
CREATE TABLE pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prestador_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tipo_servico TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2),
  tipo TEXT CHECK (tipo IN ('online', 'presencial')),
  localizacao TEXT,
  status TEXT DEFAULT 'aguardando_aceite' CHECK (status IN (
    'aguardando_aceite', 
    'aguardando_pagamento', 
    'pago', 
    'em_andamento', 
    'concluido', 
    'liberado', 
    'cancelado'
  )),
  link_pagamento TEXT,
  comissao_plataforma DECIMAL(10, 2) DEFAULT 0,
  prazo TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pedidos are viewable by involved parties." ON pedidos FOR SELECT USING (auth.uid() = cliente_id OR auth.uid() = prestador_id OR prestador_id IS NULL);
CREATE POLICY "Clients can create pedidos." ON pedidos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Involved parties can update pedidos." ON pedidos FOR UPDATE USING (auth.uid() = cliente_id OR auth.uid() = prestador_id);

-- Indexes for Pedidos
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_prestador ON pedidos(prestador_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_plan ON users(plan);

-- RLS for Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications." ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS for User Categories
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own categories." ON user_categories FOR ALL USING (auth.uid() = user_id);

-- RLS for Badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone." ON badges FOR SELECT USING (true);

-- RLS for User Badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are viewable by everyone." ON user_badges FOR SELECT USING (true);

-- Triggers for Notifications
-- 1. Notify request owner when a new response is added
CREATE OR REPLACE FUNCTION notify_new_response()
RETURNS TRIGGER AS $$
DECLARE
  req_owner_id UUID;
  req_title TEXT;
BEGIN
  SELECT user_id, title INTO req_owner_id, req_title FROM help_requests WHERE id = NEW.request_id;
  
  IF req_owner_id != NEW.responder_id THEN
    INSERT INTO notifications (user_id, type, message, link)
    VALUES (req_owner_id, 'new_response', 'Você recebeu uma nova resposta no pedido: ' || req_title, '/requests/' || NEW.request_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_response_created
AFTER INSERT ON responses
FOR EACH ROW EXECUTE FUNCTION notify_new_response();

-- 2. Notify responder when their response is accepted
CREATE OR REPLACE FUNCTION notify_response_accepted()
RETURNS TRIGGER AS $$
DECLARE
  req_title TEXT;
BEGIN
  IF NEW.accepted = true AND OLD.accepted = false THEN
    SELECT title INTO req_title FROM help_requests WHERE id = NEW.request_id;
    
    INSERT INTO notifications (user_id, type, message, link)
    VALUES (NEW.responder_id, 'response_accepted', 'Sua resposta foi aceita no pedido: ' || req_title, '/requests/' || NEW.request_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_response_accepted
AFTER UPDATE ON responses
FOR EACH ROW EXECUTE FUNCTION notify_response_accepted();

-- Triggers for Reputation Score
CREATE OR REPLACE FUNCTION update_reputation_on_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating = 5 THEN
    UPDATE users SET reputation_score = reputation_score + 10 WHERE id = NEW.reviewed_id;
  ELSIF NEW.rating = 4 THEN
    UPDATE users SET reputation_score = reputation_score + 5 WHERE id = NEW.reviewed_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reputation_on_review();

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Community Channels
CREATE TABLE community_channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Community Messages
CREATE TABLE community_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id TEXT REFERENCES community_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Community Channels
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community channels are viewable by everyone." ON community_channels FOR SELECT USING (true);

-- RLS for Community Messages
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community messages are viewable by everyone." ON community_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create community messages." ON community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default channels
INSERT INTO community_channels (id, name, description) VALUES
  ('geral', 'geral', 'Canal para discussões gerais da comunidade'),
  ('ajuda', 'ajuda-mutua', 'Canal para pedir e oferecer ajuda'),
  ('vagas', 'vagas-e-freelas', 'Canal para compartilhar vagas e oportunidades'),
  ('projetos', 'projetos-colab', 'Canal para encontrar parceiros para projetos')
ON CONFLICT (id) DO NOTHING;

-- 12. Videos Table (AJUDAÍ Play)
CREATE TABLE videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  duration TEXT,
  rating DECIMAL(3, 1) DEFAULT 5.0,
  sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos are viewable by everyone." ON videos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create videos." ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos." ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos." ON videos FOR DELETE USING (auth.uid() = user_id);

-- 13. Events Table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own events." ON events FOR ALL USING (auth.uid() = user_id);

-- 14. Notes Table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#ffffff',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes." ON notes FOR ALL USING (auth.uid() = user_id);

-- 15. Checklists Table
CREATE TABLE checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own checklists." ON checklists FOR ALL USING (auth.uid() = user_id);

-- 16. Checklist Items Table
CREATE TABLE checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own checklist items." ON checklist_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM checklists 
    WHERE checklists.id = checklist_items.checklist_id 
    AND checklists.user_id = auth.uid()
  )
);
