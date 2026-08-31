-- Create about_us_settings table
CREATE TABLE IF NOT EXISTS public.about_us_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtitle TEXT DEFAULT 'The Visionaries',
    main_title TEXT DEFAULT 'InvestLand is Democratizing Real Estate.',
    description TEXT DEFAULT 'We believe that the power of land ownership should belong to everyone, not just the billionaire class. Our mission is to make real estate as liquid and accessible as stocks.',
    stat1_label TEXT DEFAULT 'Assets Managed',
    stat1_value TEXT DEFAULT '₹150Cr+',
    stat2_label TEXT DEFAULT 'Total Investors',
    stat2_value TEXT DEFAULT '12,400+',
    stat3_label TEXT DEFAULT 'Verified Area',
    stat3_value TEXT DEFAULT '2,500+ Acres',
    stat4_label TEXT DEFAULT 'Avg. ROI',
    stat4_value TEXT DEFAULT '18.5%',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_us_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view about settings" ON public.about_us_settings;
DROP POLICY IF EXISTS "Admins can manage about settings" ON public.about_us_settings;
DROP POLICY IF EXISTS "Anyone can select about us settings" ON public.about_us_settings;
DROP POLICY IF EXISTS "Authenticated users can update about us settings" ON public.about_us_settings;

-- Create Policies
CREATE POLICY "Anyone can select about us settings" ON public.about_us_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update about us settings" ON public.about_us_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert initial row if empty
INSERT INTO public.about_us_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.about_us_settings);
