-- COMPLETE HOW IT WORKS CMS INFRASTRUCTURE
-- Expands app_settings to provide full administrative control over the instructional narrative.

ALTER TABLE public.app_settings
-- 1. Hero Section
ADD COLUMN IF NOT EXISTS how_subtitle TEXT DEFAULT 'The Investment Loop',
ADD COLUMN IF NOT EXISTS how_title TEXT DEFAULT 'Investment Simplified.',
ADD COLUMN IF NOT EXISTS how_hero_description TEXT DEFAULT 'We''ve broken down the barriers of traditional real estate.',
ADD COLUMN IF NOT EXISTS how_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Get Started Now',
ADD COLUMN IF NOT EXISTS how_cta_link TEXT DEFAULT '/register',

-- 2. Process Steps
ADD COLUMN IF NOT EXISTS how_step1_title TEXT DEFAULT 'Create Account',
ADD COLUMN IF NOT EXISTS how_step1_description TEXT DEFAULT 'Sign up and complete your digital KYC in less than 2 minutes.',
ADD COLUMN IF NOT EXISTS how_step1_icon TEXT DEFAULT 'UserPlus',
ADD COLUMN IF NOT EXISTS how_step2_title TEXT DEFAULT 'Choose Asset',
ADD COLUMN IF NOT EXISTS how_step2_description TEXT DEFAULT 'Browse our curated list of high-growth land projects.',
ADD COLUMN IF NOT EXISTS how_step2_icon TEXT DEFAULT 'Search',
ADD COLUMN IF NOT EXISTS how_step3_title TEXT DEFAULT 'Start Investing',
ADD COLUMN IF NOT EXISTS how_step3_description TEXT DEFAULT 'Invest as little as ₹500 securely via UPI or NetBanking.',
ADD COLUMN IF NOT EXISTS how_step3_icon TEXT DEFAULT 'IndianRupee',
ADD COLUMN IF NOT EXISTS how_step4_title TEXT DEFAULT 'Monitor Growth',
ADD COLUMN IF NOT EXISTS how_step4_description TEXT DEFAULT 'Track your portfolio appreciation in real-time.',
ADD COLUMN IF NOT EXISTS how_step4_icon TEXT DEFAULT 'TrendingUp',

-- 3. Statistics
ADD COLUMN IF NOT EXISTS how_stat1_number TEXT DEFAULT '12k+',
ADD COLUMN IF NOT EXISTS how_stat1_label TEXT DEFAULT 'Active Investors',
ADD COLUMN IF NOT EXISTS how_stat2_number TEXT DEFAULT '₹50Cr+',
ADD COLUMN IF NOT EXISTS how_stat2_label TEXT DEFAULT 'Assets Managed',
ADD COLUMN IF NOT EXISTS how_stat3_number TEXT DEFAULT '18.5%',
ADD COLUMN IF NOT EXISTS how_stat3_label TEXT DEFAULT 'Avg. Annual ROI',
ADD COLUMN IF NOT EXISTS how_stat4_number TEXT DEFAULT '100%',
ADD COLUMN IF NOT EXISTS how_stat4_label TEXT DEFAULT 'Verified Titles',

-- 4. Bottom CTA
ADD COLUMN IF NOT EXISTS how_bottom_title TEXT DEFAULT 'Still have questions?',
ADD COLUMN IF NOT EXISTS how_bottom_description TEXT DEFAULT 'Our investment specialists are here to guide you through your first fractional land purchase.',
ADD COLUMN IF NOT EXISTS how_bottom_button_text TEXT DEFAULT 'Talk to Specialist',
ADD COLUMN IF NOT EXISTS how_bottom_button_link TEXT DEFAULT '/contact';

-- Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
