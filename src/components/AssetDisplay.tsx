import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { Asset } from '../lib/assetLibrary';

interface AssetDisplayProps {
  assets: Asset[];
}

export default function AssetDisplay({ assets }: AssetDisplayProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  if (!assets.length) return null;

  const asset = assets[current];

  const prev = () => setCurrent((c) => (c - 1 + assets.length) % assets.length);
  const next = () => setCurrent((c) => (c + 1) % assets.length);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="asset-display-card mt-3"
      >
        {/* Image container */}
        <div className="asset-image-wrap" onClick={() => setLightbox(true)}>
          {/* Skeleton pulse */}
          {!imageLoaded[current] && (
            <div className="asset-skeleton" />
          )}
          <AnimatePresence mode="wait">
            <motion.img
              key={asset.id}
              src={asset.path}
              alt={asset.alt}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded[current] ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImageLoaded((prev) => ({ ...prev, [current]: true }))}
              className="asset-image"
            />
          </AnimatePresence>

          {/* Expand icon */}
          <div className="asset-expand-btn">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Footer bar */}
        <div className="asset-footer">
          <div className="asset-meta">
            <Image className="w-3 h-3 text-[#c5a47e]" />
            <span className="asset-label">{asset.alt}</span>
            <span className="asset-category">{asset.category}</span>
          </div>

          {assets.length > 1 && (
            <div className="asset-nav">
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="asset-nav-btn">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="asset-counter">
                {current + 1}/{assets.length}
              </span>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="asset-nav-btn">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="asset-lightbox-overlay"
            onClick={() => setLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="asset-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="asset-lightbox-close" onClick={() => setLightbox(false)}>
                <X className="w-5 h-5" />
              </button>
              <img src={asset.path} alt={asset.alt} className="asset-lightbox-img" />
              <p className="asset-lightbox-caption">{asset.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
