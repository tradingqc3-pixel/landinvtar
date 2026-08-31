-- Ensure app_settings has the correct columns for Contact sync
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'Connect with Us',
ADD COLUMN IF NOT EXISTS contact_description TEXT DEFAULT 'Every great investment begins with a single conversation.',
ADD COLUMN IF NOT EXISTS support_email TEXT DEFAULT 'hello@investland.app',
ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+91 98765 43210',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+91 98765 43210',
ADD COLUMN IF NOT EXISTS corporate_address TEXT DEFAULT 'BKC, Mumbai, Maharashtra',
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT 'Response time: < 120 minutes';

-- Rename headquarters_address if it exists from previous implementation to avoid confusion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'headquarters_address') THEN
        ALTER TABLE public.app_settings RENAME COLUMN headquarters_address TO corporate_address;
    END IF;
END $$;
