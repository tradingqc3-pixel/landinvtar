import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  brand_name: string;
  hero_headline: string;
  platform_description: string;
  support_email: string;
  contact_phone: string;
  corporate_address: string;
  footer_description: string;
  footer_copyright: string;
  seo_title: string;
  seo_description: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const defaultSettings: BrandingSettings = {
  logo_url: '/logo.png',
  favicon_url: '/logo.png',
  primary_color: '#10b981',
  secondary_color: '#f59e0b',
  brand_name: 'InvestLand',
  hero_headline: 'Invest in Premium Land from ₹500',
  platform_description: 'Democratizing real estate ownership through fractional investment.',
  support_email: 'hello@investland.app',
  contact_phone: '+91 98765 43210',
  corporate_address: 'BKC, Mumbai, Maharashtra',
  footer_description: 'Democratizing land ownership through fractional investment.',
  footer_copyright: '© 2026 InvestLand Financial Services Pvt Ltd. All rights reserved.',
  seo_title: 'InvestLand — Premium Fractional Land Investment',
  seo_description: 'Invest in premium land from ₹500. InvestLand makes real estate investment accessible.'
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      // Fetch from branding_settings, app_settings, seo_settings, and footer_settings
      const [brandingRes, appRes, seoRes, footerRes] = await Promise.all([
        supabase.from('branding_settings').select('*').limit(1).maybeSingle(),
        supabase.from('app_settings').select('*').limit(1).maybeSingle(),
        supabase.from('seo_settings').select('*').limit(1).maybeSingle(),
        supabase.from('footer_settings').select('*').limit(1).maybeSingle()
      ]);

      const brandingData = brandingRes.data || {};
      const appData = appRes.data || {};
      const seoData = seoRes.data || {};
      const footerData = footerRes.data || {};

      const finalSettings: BrandingSettings = {
        ...defaultSettings,
        brand_name: appData?.brand_name || defaultSettings.brand_name,
        hero_headline: appData?.hero_headline || defaultSettings.hero_headline,
        platform_description: appData?.platform_description || defaultSettings.platform_description,
        support_email: appData?.support_email || defaultSettings.support_email,
        contact_phone: appData?.contact_phone || defaultSettings.contact_phone,
        corporate_address: appData?.headquarters_address || appData?.corporate_address || defaultSettings.corporate_address,
        footer_description: footerData?.description || appData?.platform_description || defaultSettings.footer_description,
        footer_copyright: footerData?.copyright || defaultSettings.footer_copyright,
        seo_title: seoData?.meta_title || defaultSettings.seo_title,
        seo_description: seoData?.meta_description || defaultSettings.seo_description,
        // Visual branding takes precedence
        logo_url: brandingData?.logo_url || appData?.logo_url || defaultSettings.logo_url,
        favicon_url: brandingData?.favicon_url || seoData?.favicon_url || appData?.favicon_url || defaultSettings.favicon_url,
        primary_color: brandingData?.primary_color || appData?.primary_color || defaultSettings.primary_color,
        secondary_color: brandingData?.secondary_color || appData?.secondary_color || defaultSettings.secondary_color,
      };

      setSettings(finalSettings);

      // Update Favicon
      if (finalSettings.favicon_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = finalSettings.favicon_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = finalSettings.favicon_url;
          document.head.appendChild(newLink);
        }
      }

      // Update Theme Colors (CSS Variables)
      if (finalSettings.primary_color) {
        document.documentElement.style.setProperty('--color-primary', finalSettings.primary_color);
      }
      if (finalSettings.secondary_color) {
        document.documentElement.style.setProperty('--color-secondary', finalSettings.secondary_color);
      }

    } catch (err) {
      console.error('[Branding] Sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();

    const channel = supabase
      .channel('branding_global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branding_settings' }, () => fetchBranding())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => fetchBranding())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_settings' }, () => fetchBranding())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_settings' }, () => fetchBranding())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ settings, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
