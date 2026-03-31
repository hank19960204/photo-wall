'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Trash2 } from 'lucide-react';
import {
  updateCaptionAction,
  updateTagsAction,
  updateStickerColorAction,
  deletePhotoAction,
} from '@/app/actions';
import type { Photo, StickerColor } from '@/lib/types';

interface Props {
  photo: Photo | null;
  isAdmin: boolean;
  onClose: () => void;
  onPhotoUpdated: (id: string, updates: Partial<Photo>) => void;
  onDelete: (id: string) => void;
}

export function Lightbox({ photo, isAdmin, onClose, onPhotoUpdated, onDelete }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();

  // caption / tags ローカル編集用
  const [localCaption, setLocalCaption] = useState('');
  const [localTags, setLocalTags] = useState('');

  // photo が変わったら flip を閉じる
  const handleOpen = (p: Photo) => {
    setIsFlipped(false);
    setLocalCaption(p.caption);
    setLocalTags(p.tags.join(', '));
  };

  if (!photo) return null;

  const handleCaptionBlur = () => {
    if (localCaption === photo.caption) return;
    startTransition(async () => {
      await updateCaptionAction(photo.id, localCaption);
      onPhotoUpdated(photo.id, { caption: localCaption });
    });
  };

  const handleTagsBlur = () => {
    const newTags = localTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`));
    const same = JSON.stringify(newTags) === JSON.stringify(photo.tags);
    if (same) return;
    startTransition(async () => {
      await updateTagsAction(photo.id, newTags);
      onPhotoUpdated(photo.id, { tags: newTags });
    });
  };

  const handleColorChange = (color: StickerColor) => {
    onPhotoUpdated(photo.id, { sticker_color: color });
    startTransition(async () => {
      await updateStickerColorAction(photo.id, color);
    });
  };

  const handleDelete = () => {
    onDelete(photo.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key={photo.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/95 backdrop-blur-xl p-8"
        onClick={onClose}
        onAnimationStart={() => handleOpen(photo)}
      >
        <div
          className="relative w-full max-w-2xl perspective-1000"
          onClick={e => e.stopPropagation()}
        >
          {/* Controls bar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 z-50">
            <button
              onClick={() => setIsFlipped(f => !f)}
              className="bg-white text-neutral-800 px-6 py-2 rounded-full font-bold shadow-xl hover:bg-neutral-100 flex items-center gap-2"
            >
              <Maximize2 size={18} /> Flip Photo
            </button>

            {isAdmin && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600"
              >
                <Trash2 size={20} />
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-white text-neutral-800 p-2 rounded-full shadow-xl hover:bg-neutral-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* 3D flip card */}
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full aspect-[4/5] transform-style-3d cursor-pointer"
            onClick={() => setIsFlipped(f => !f)}
          >
            {/* ── Front ──────────────────────────────── */}
            <div className="absolute inset-0 bg-polaroid polaroid-texture p-6 pb-24 polaroid-shadow backface-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover shadow-inner"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full px-8">
                <p className="font-handwriting text-4xl font-bold text-neutral-700 truncate">
                  {photo.caption}
                </p>
              </div>
              <div className="absolute bottom-24 right-4 flex flex-col items-end gap-1 pointer-events-none">
                {photo.tags.map((tag, i) => (
                  <div
                    key={i}
                    className={`sticker sticker-${photo.sticker_color} scale-75 origin-right`}
                    style={{ transform: `rotate(${i * 2}deg) scale(0.75)` }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Back ───────────────────────────────── */}
            <div className="absolute inset-0 bg-[#fdfaf5] polaroid-texture p-12 polaroid-shadow rotate-y-180 backface-hidden flex flex-col items-center justify-center text-center">
              <div
                className="w-full h-full p-8 flex flex-col items-center justify-center space-y-6"
                onClick={e => e.stopPropagation()}
              >
                {isAdmin ? (
                  <div className="w-full space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        Caption
                      </label>
                      <textarea
                        value={localCaption}
                        onChange={e => setLocalCaption(e.target.value)}
                        onBlur={handleCaptionBlur}
                        disabled={isPending}
                        rows={2}
                        placeholder="Write a memory..."
                        className="w-full bg-transparent text-3xl font-handwriting font-bold text-neutral-700 text-center outline-none border-b border-neutral-200 focus:border-neutral-400 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={localTags}
                        onChange={e => setLocalTags(e.target.value)}
                        onBlur={handleTagsBlur}
                        disabled={isPending}
                        className="w-full bg-transparent text-xl font-handwriting font-bold text-neutral-700 text-center outline-none border-b border-neutral-200 focus:border-neutral-400"
                        placeholder="#tag1, #tag2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        Sticker Color
                      </label>
                      <div className="flex justify-center gap-4">
                        {(['pink', 'yellow', 'green'] as StickerColor[]).map(color => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            disabled={isPending}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              photo.sticker_color === color
                                ? 'border-neutral-800 scale-125'
                                : 'border-transparent'
                            }`}
                            style={{
                              backgroundColor:
                                color === 'pink'
                                  ? '#ff79c6'
                                  : color === 'yellow'
                                  ? '#f1fa8c'
                                  : '#50fa7b',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-4xl font-handwriting font-bold text-neutral-700 leading-relaxed max-w-md">
                      {photo.caption || 'No memory written yet...'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {photo.tags.map((tag, i) => (
                        <span key={i} className="text-xl font-handwriting text-neutral-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <p className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em] mb-2">
                    Timestamp
                  </p>
                  <p className="text-2xl font-handwriting text-neutral-400">{photo.date}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
