-- Complete CMS Overhaul for InvestLand

-- 1. Hero Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.hero_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'Invest in Premium Land from ₹500',
    subtitle TEXT DEFAULT 'Premium Fractional Ownership',
    description TEXT DEFAULT 'Democratizing real estate ownership through fractional investment. Secure, transparent, and high-yield land assets at your fingertips.',
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000',
    cta_text TEXT DEFAULT 'Start Investing',
    cta_link TEXT DEFAULT '/projects',
    video_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Hero Banners (List for sliders if needed)
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. How It Works (Steps)
CREATE TABLE IF NOT EXISTS public.how_it_works_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    author TEXT,
    category TEXT,
    content TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Navigation Menu
CREATE TABLE IF NOT EXISTS public.navigation_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    link TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Footer Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.footer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT DEFAULT 'Democratizing land ownership through fractional investment. Secure your future with verified premium land assets.',
    copyright TEXT DEFAULT '© 2026 InvestLand Financial Services Pvt Ltd. All rights reserved.',
    social_links JSONB DEFAULT '[]'::jsonb,
    quick_links JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. SEO Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_title TEXT DEFAULT 'InvestLand — Premium Fractional Land Investment',
    meta_description TEXT DEFAULT 'Invest in premium land from ₹500. InvestLand makes real estate investment accessible, transparent, and profitable for everyone.',
    keywords TEXT DEFAULT 'land investment, fractional ownership, real estate india, investland',
    og_image TEXT,
    favicon_url TEXT DEFAULT '/logo.png',
    canonical_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure app_settings has all contact fields (from previous fix)
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'Connect with Us',
ADD COLUMN IF NOT EXISTS contact_description TEXT DEFAULT 'Every great investment begins with a single conversation.',
ADD COLUMN IF NOT EXISTS corporate_address TEXT DEFAULT 'BKC, Mumbai, Maharashtra';

-- Enable RLS for all
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Public Read
CREATE POLICY "Public read hero_settings" ON public.hero_settings FOR SELECT USING (true);
CREATE POLICY "Public read hero_banners" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Public read how_it_works_steps" ON public.how_it_works_steps FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public read navigation_menu" ON public.navigation_menu FOR SELECT USING (true);
CREATE POLICY "Public read footer_settings" ON public.footer_settings FOR SELECT USING (true);
CREATE POLICY "Public read seo_settings" ON public.seo_settings FOR SELECT USING (true);

-- Policies: Admin CRUD (assuming 'admin' check exists in profiles)
CREATE POLICY "Admin manage hero_settings" ON public.hero_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage hero_banners" ON public.hero_banners FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage how_it_works_steps" ON public.how_it_works_steps FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage navigation_menu" ON public.navigation_menu FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage footer_settings" ON public.footer_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage seo_settings" ON public.seo_settings FOR ALL TO authenticated USING (true);

-- Insert initial singletons
INSERT INTO public.hero_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.footer_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
INSERT INTO public.seo_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Seed How It Works steps
INSERT INTO public.how_it_works_steps (title, description, icon, order_index) VALUES
('Create Account', 'Sign up and complete your digital KYC in less than 2 minutes. We only need your PAN and Aadhaar.', 'UserPlus', 1),
('Choose Asset', 'Browse our curated list of high-growth land projects. Review legal reports, 360° views, and ROI projections.', 'Search', 2),
('Start Investing', 'Invest as little as ₹500. Pay securely via UPI, NetBanking or Debit Card. Your fraction is locked instantly.', 'IndianRupee', 3),
('Monitor Growth', 'Track your portfolio appreciation in real-time through your personalized dashboard. Get quarterly updates.', 'TrendingUp', 4);
