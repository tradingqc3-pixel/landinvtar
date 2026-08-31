import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface ProjectImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  type?: 'cover' | 'gallery';
}

const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt = 'Project image', className, type = 'gallery' }) => {
  const [error, setError] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setError(false);
  }, [src]);

  const placeholderUrl = type === 'cover'
    ? 'https://via.placeholder.com/1200x600?text=Cover+Unavailable'
    : 'https://via.placeholder.com/400x400?text=Object+Unavailable';

  if (!src || src === 'undefined' || src === 'null' || error) {
    console.log(`[PROJECT MEDIA] Showing placeholder. Src: ${src}, Error: ${error}`);
    return (
      <div className={clsx(
        "flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400",
        className
      )}>
        <ImageIcon size={type === 'cover' ? 48 : 24} className="opacity-20" />
        <span className="text-[8px] font-black uppercase mt-2 tracking-widest">Null Object</span>
      </div>
    );
  }

  // Resolve Supabase path to public URL if it's not already a full URL
  const bucket = type === 'cover' || type === 'gallery' ? 'project-media' : 'project-documents';

  // High-reliability URL resolution
  let baseUrl = 'https://sodzuknsemsqaiakevjp.supabase.co';
  if (import.meta.env.VITE_SUPABASE_URL) {
    baseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  const fullUrl = src.startsWith('http')
    ? src
    : `${baseUrl}/storage/v1/object/public/${bucket}/${src}?t=${Date.now()}`;

  console.log(`[PROJECT MEDIA] Rendering image. Type: ${type}, Stored: ${src}, Final URL: ${fullUrl}`);

  return (
    <img
      src={fullUrl}
      key={fullUrl}
      alt={alt}
      className={clsx("object-cover", className)}
      onLoad={() => console.log('[PROJECT MEDIA] IMAGE DISPLAYED SUCCESSFULLY:', fullUrl)}
      onError={(e) => {
        console.error('[PROJECT MEDIA] IMAGE DISPLAY ERROR:', e.currentTarget.src);
        setError(true);
      }}
    />
  );
};

export default ProjectImage;
