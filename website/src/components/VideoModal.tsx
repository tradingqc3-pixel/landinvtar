import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import ReactPlayer from 'react-player';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  thumbnailUrl?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, thumbnailUrl }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // To avoid TypeScript issues with certain react-player versions, we cast to any
  const Player = ReactPlayer as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10 z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full h-full flex items-center justify-center relative group">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <Loader2 className="w-12 h-12 text-emerald-500 animate-spin opacity-50" />
              </div>
              <Player
                url={videoUrl}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                light={thumbnailUrl}
                playIcon={
                   <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-100 hover:scale-110 transition-transform">
                      <PlayIcon className="w-8 h-8 fill-current" />
                   </div>
                }
                className="relative z-10"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

export default VideoModal;
