-- Extend app_settings for Contact Page CMS
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'We are Listening.',
ADD COLUMN IF NOT EXISTS contact_description TEXT DEFAULT 'Have a specific query about an asset or need technical support? Our investment desk is available 24/7.',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+91 98765 43210',
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT 'Response time: < 120 minutes',
ADD COLUMN IF NOT EXISTS contact_success_message TEXT DEFAULT 'Our investment specialists have been notified. We will reach out to you within the next 2 hours.';
