const { createClient } = require('@supabase/supabase-js');

/**
 * Hero Banner CMS Backend Handler
 * Managed logic for homepage visual and textual identity.
 */
async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sodzuknsemsqaiakevjp.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing from backend terminal environment.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const DEFAULT_HERO = {
    goldSubtitle: "India's #1 Land Investment Platform",
    heroTitle: "Invest in Premium Land from ₹500",
    description: "Democratizing real estate ownership through fractional investment.",
    backgroundImage: "https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ctaText: "Start Investing",
    ctaLink: "/projects"
  };

  // GET: Fetch Active Hero Identity
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('hero_banner')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(200).json({ success: true, data: DEFAULT_HERO });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        goldSubtitle: data.gold_subtitle,
        heroTitle: data.hero_title,
        description: data.description,
        backgroundImage: data.background_image_url,
        videoUrl: data.video_url,
        ctaText: data.cta_text,
        ctaLink: data.cta_link
      }
    });
  }

  // POST/PUT: Deploy or Create Local Configuration
  if (req.method === 'PUT' || req.method === 'POST') {
    const { goldSubtitle, heroTitle, description, backgroundImage, videoUrl, ctaText, ctaLink } = req.body;
    const targetId = req.params?.id || req.query?.id;

    if (!heroTitle || !backgroundImage) {
      res.status(400);
      throw new Error('Hero Title and Background Image are mandatory attributes.');
    }

    const payload = {
      gold_subtitle: goldSubtitle,
      hero_title: heroTitle,
      description: description,
      background_image_url: backgroundImage,
      video_url: videoUrl,
      cta_text: ctaText,
      cta_link: ctaLink,
      updated_at: new Date().toISOString()
    };

    let resultData;
    if (targetId) {
      // Explicit ID update
      const { data, error } = await supabase
        .from('hero_banner')
        .update(payload)
        .eq('id', targetId)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    } else {
      // Find existing singleton to update or insert new
      const { data: existing } = await supabase
        .from('hero_banner')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const { data, error } = await supabase
        .from('hero_banner')
        .upsert(existing ? { id: existing.id, ...payload } : payload)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    }

    return res.status(200).json({
      success: true,
      data: {
        id: resultData.id,
        goldSubtitle: resultData.gold_subtitle,
        heroTitle: resultData.hero_title,
        description: resultData.description,
        backgroundImage: resultData.background_image_url,
        videoUrl: resultData.video_url,
        ctaText: resultData.cta_text,
        ctaLink: resultData.cta_link
      }
    });
  }

  // DELETE: Deactivate Configuration
  if (req.method === 'DELETE') {
    const targetId = req.params?.id || req.query?.id;
    if (!targetId) {
      res.status(400);
      throw new Error('Target ID required for deactivation.');
    }

    const { error } = await supabase
      .from('hero_banner')
      .update({ is_active: false })
      .eq('id', targetId);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Hero configuration deactivated.' });
  }

  res.status(405);
  throw new Error('Method Not Allowed');
}

module.exports = handler;
