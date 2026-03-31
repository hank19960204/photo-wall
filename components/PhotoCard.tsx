'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import type { Photo } from '@/lib/types';

interface PhotoCardProps {
  photo: Photo;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function PhotoCard({ photo, isAdmin, onDelete, onClick }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: isHovered ? 0 : photo.rotation,
        y: isHovered ? -10 : 0,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block w-full break-inside-avoid bg-polaroid polaroid-texture p-3 pb-16 polaroid-shadow transition-shadow cursor-pointer ${
        isHovered ? 'polaroid-shadow-hover z-30' : 'z-10'
      }`}
      onClick={onClick}
    >
      {/* Pushpin */}
      <div className="pushpin" />

      {/* Image */}
      <div className="relative overflow-hidden bg-neutral-200 aspect-[4/5] shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-full h-full object-cover grayscale-[15%] sepia-[10%] contrast-[105%]"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Admin Delete */}
        {isAdmin && (
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(photo.id);
            }}
            className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Caption + Stickers */}
      <div className="mt-4 px-1 relative h-12 flex items-center justify-center">
        <p className="font-handwriting text-2xl font-bold leading-tight text-neutral-700 text-center truncate w-full">
          {photo.caption}
        </p>

        <div className="absolute -bottom-2 -right-2 flex flex-col items-end gap-1 pointer-events-none">
          {photo.tags.length > 0 ? (
            photo.tags.map((tag, i) => (
              <div
                key={i}
                className={`sticker sticker-${photo.sticker_color} scale-75 origin-right`}
                style={{
                  transform: `rotate(${i * 3 - 5}deg) scale(0.75)`,
                  marginTop: i > 0 ? '-12px' : '0',
                }}
              >
                {tag}
              </div>
            ))
          ) : (
            <div className={`sticker sticker-${photo.sticker_color} scale-75`}>
              #Memory
            </div>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="absolute bottom-2 left-4">
        <p className="text-[9px] uppercase tracking-tighter text-neutral-400 font-bold">
          {photo.date}
        </p>
      </div>

      {/* Hover overlay */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-white/5 pointer-events-none"
      />
    </motion.div>
  );
}
