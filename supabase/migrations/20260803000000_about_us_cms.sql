-- Create about_settings table
CREATE TABLE IF NOT EXISTS public.about_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_subtitle TEXT DEFAULT 'The Visionaries',
    hero_title TEXT DEFAULT 'InvestLand is Democratizing Real Estate.',
    hero_description TEXT DEFAULT 'We believe that the power of land ownership should belong to everyone, not just the billionaire class. Our mission is to make real estate as liquid and accessible as stocks.',
    hero_image_url TEXT,

    stat1_label TEXT DEFAULT 'Assets Managed',
    stat1_val TEXT DEFAULT '₹150Cr+',
    stat2_label TEXT DEFAULT 'Total Investors',
    stat2_val TEXT DEFAULT '12,400+',
    stat3_label TEXT DEFAULT 'Verified Area',
    stat3_val TEXT DEFAULT '2,500+ Acres',
    stat4_label TEXT DEFAULT 'Avg. ROI',
    stat4_val TEXT DEFAULT '18.5%',

    story_subtitle TEXT DEFAULT 'Our Genesis',
    story_title TEXT DEFAULT 'Beyond the Concrete Jungle.',
    story_description TEXT DEFAULT 'InvestLand was born in 2024 with a simple observation: while the value of urban and suburban land in India was skyrocketing, the opportunity to benefit from this growth was restricted to a few high-net-worth individuals.',
    story_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000',
    story_points JSONB DEFAULT '["Built for the modern digital-first investor.", "Removing legal barriers and document complexity.", "Strategic focuses on India''s growth corridors.", "Complete transparency through blockchain technology."]',
    founders_quote TEXT DEFAULT 'We value your trust more than your capital.',
    founders_label TEXT DEFAULT 'Founders'' Promise',

    values_subtitle TEXT DEFAULT 'Corporate DNA',
    values_title TEXT DEFAULT 'Core Values',
    values_list JSONB DEFAULT '[
        {"title": "Transparency", "icon": "ShieldCheck", "desc": "Open books, open communication. No hidden charges ever."},
        {"title": "Security", "icon": "Award", "desc": "Every investment is protected by top-tier legal audits."},
        {"title": "Accessibility", "icon": "Rocket", "desc": "Investing should be for everyone, starting from just ₹500."},
        {"title": "Growth", "icon": "Target", "desc": "We focus on long-term value creation and sustainable wealth."}
    ]',

    team_subtitle TEXT DEFAULT 'The Engine Room',
    team_title TEXT DEFAULT 'Meet the Pioneers',
    team_members JSONB DEFAULT '[
        {"name": "Rahul Sharma", "role": "Co-Founder & CEO", "img": "https://i.pravatar.cc/300?u=rahul"},
        {"name": "Priya Varma", "role": "Chief Investment Officer", "img": "https://i.pravatar.cc/300?u=priya"},
        {"name": "Aditya Mehta", "role": "Head of Legal & Compliance", "img": "https://i.pravatar.cc/300?u=aditya"}
    ]',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public can view about settings" ON public.about_settings FOR SELECT USING (true);

-- Allow admin all
CREATE POLICY "Admins can manage about settings" ON public.about_settings
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)));

-- Insert default row
INSERT INTO public.about_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
