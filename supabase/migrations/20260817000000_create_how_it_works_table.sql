-- Create How It Works table
CREATE TABLE IF NOT EXISTS public.how_it_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.how_it_works ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read how_it_works" ON public.how_it_works
    FOR SELECT TO public USING (true);

-- Allow admin write access
CREATE POLICY "Admin manage how_it_works" ON public.how_it_works
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
        )
    );

-- Seed data
INSERT INTO public.how_it_works (step_number, title, description, display_order)
VALUES
(1, 'Discover Opportunities', 'Browse through our curated list of high-potential land parcels.', 1),
(2, 'Invest Securely', 'Choose your investment amount and complete the transaction via Razorpay.', 2),
(3, 'Monitor Growth', 'Track your portfolio and capital appreciation in real-time.', 3)
ON CONFLICT DO NOTHING;
