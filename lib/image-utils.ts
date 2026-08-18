import { getSupabaseRuntimeConfig } from './supabase';

/**
 * Optimizes an image URL for display by using Supabase Image Transformation
 * or adding quality/width parameters if supported by the provider.
 *
 * @param url The original image URL
 * @param options Optimization options (width, quality)
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(url: string, { width = 800, quality = 80 } = {}): string {
  if (!url) return '';

  // If it's not a Supabase URL, we can't easily transform it without a proxy
  const config = getSupabaseRuntimeConfig();
  if (!url.includes(config.url)) {
    return url;
  }

  // Handle Supabase Storage Public URLs
  // Original: https://xyz.supabase.co/storage/v1/object/public/bucket/path/image.jpg
  // Transformed: https://xyz.supabase.co/storage/v1/render/image/public/bucket/path/image.jpg?width=800&quality=80
  if (url.includes('/storage/v1/object/public/')) {
    return url
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      + `?width=${width}&quality=${quality}&resize=cover`;
  }

  return url;
}
