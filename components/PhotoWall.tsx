'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { Lightbox } from './Lightbox';
import { UploadModal } from './UploadModal';
import { FilterBar } from './FilterBar';
import { AdminButton } from './AdminButton';
import { deletePhotoAction } from '@/app/actions';
import type { Photo } from '@/lib/types';

interface Props {
  initialPhotos: Photo[];
  isAdmin: boolean;
}

export function PhotoWall({ initialPhotos, isAdmin }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedPhoto = useMemo(
    () => photos.find(p => p.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId]
  );

  const filteredPhotos = useMemo(
    () => selectedTag ? photos.filter(p => p.tags.includes(selectedTag)) : photos,
    [photos, selectedTag]
  );

  const handleDelete = async (id: string) => {
    // 樂觀更新：先從畫面移除
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (selectedPhotoId === id) setSelectedPhotoId(null);
    await deletePhotoAction(id);
  };

  const handlePhotoAdded = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
  };

  const handlePhotoUpdated = (id: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">

      {/* ── Header ─────────────────────────────────── */}
      <header className="px-8 py-12 flex flex-col items-center justify-center space-y-8 relative">
        <AdminButton isAdmin={isAdmin} />

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-scribble text-neutral-700 tracking-wider"
        >
          Our Memories
        </motion.h1>

        <FilterBar selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </header>

      {/* ── Photo Grid ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-12 space-y-12">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onClick={() => setSelectedPhotoId(photo.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredPhotos.length === 0 && (
          <p className="text-center text-neutral-400 font-handwriting text-2xl mt-20">
            No memories yet...
          </p>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="mt-20 py-12 border-t border-neutral-300/50 flex flex-col items-center">
        <p className="text-sm text-neutral-500 font-medium tracking-widest">
          &copy; {new Date().getFullYear()} Arcadia Bay Photography Club
        </p>
      </footer>

      {/* ── FAB（只有 admin 才看得到） ─────────────── */}
      <AnimatePresence>
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsUploading(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40"
          >
            <Plus size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Lightbox ───────────────────────────────── */}
      <Lightbox
        photo={selectedPhoto}
        isAdmin={isAdmin}
        onClose={() => setSelectedPhotoId(null)}
        onPhotoUpdated={handlePhotoUpdated}
        onDelete={handleDelete}
      />

      {/* ── Upload Modal ────────────────────────────── */}
      <UploadModal
        isOpen={isUploading}
        onClose={() => setIsUploading(false)}
        onSuccess={handlePhotoAdded}
      />
    </div>
  );
}
