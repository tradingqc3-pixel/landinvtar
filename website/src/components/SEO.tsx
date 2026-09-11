import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useBranding } from '../context/BrandingContext';

const SEO: React.FC = () => {
  const { settings } = useBranding();

  const schemaOrgJSONLD = settings.organization_schema || {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings.brand_name || "InvestLand",
    "url": window.location.origin,
    "logo": settings.logo_url ? (settings.logo_url.startsWith('http') ? settings.logo_url : `${window.location.origin}${settings.logo_url}`) : `${window.location.origin}/logo.png`
  };

  return (
    <Helmet>
      {/* General Meta Tags */}
      <title>{settings.seo_title}</title>
      <meta name="description" content={settings.seo_description} />
      <meta name="keywords" content={settings.seo_keywords} />
      <link rel="canonical" href={settings.canonical_url || window.location.href} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={settings.canonical_url || window.location.href} />
      <meta property="og:title" content={settings.og_title || settings.seo_title} />
      <meta property="og:description" content={settings.og_description || settings.seo_description} />
      {settings.og_image && <meta property="og:image" content={settings.og_image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={settings.twitter_card || "summary_large_image"} />
      <meta name="twitter:url" content={settings.canonical_url || window.location.href} />
      <meta name="twitter:title" content={settings.twitter_title || settings.seo_title} />
      <meta name="twitter:description" content={settings.twitter_description || settings.seo_description} />
      {settings.twitter_image && <meta name="twitter:image" content={settings.twitter_image} />}

      {/* Favicon */}
      {settings.favicon_url && <link rel="icon" type="image/png" href={settings.favicon_url} />}

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
    </Helmet>
  );
};

export default SEO;
