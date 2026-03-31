'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Loader2 } from 'lucide-react';
import { uploadPhotoAction } from '@/app/actions';
import type { Photo } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (photo: Photo) => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClose = () => {
    if (isPending) return;
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await uploadPhotoAction(formData);
      if (result.success && result.photo) {
        onSuccess(result.photo);
        setPreview(null);
        onClose();
      } else {
        setError(result.error ?? '上傳失敗，請再試一次');
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Camera size={24} /> New Memory
              </h3>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* File Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Photo <span className="text-red-400">*</span>
                </label>
                <input
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                  disabled={isPending}
                  className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 file:cursor-pointer"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreview(url);
                    } else {
                      setPreview(null);
                    }
                  }}
                />
                {/* Preview */}
                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-48 object-cover rounded-xl mt-2 shadow-md"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Caption <span className="text-red-400">*</span>
                </label>
                <input
                  name="caption"
                  type="text"
                  required
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 ring-neutral-800 outline-none transition disabled:opacity-50"
                  placeholder="What happened?"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Tags
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    comma separated，e.g. #nature, sunset
                  </span>
                </label>
                <input
                  name="tags"
                  type="text"
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 ring-neutral-800 outline-none transition disabled:opacity-50"
                  placeholder="#nature, #sunset"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-neutral-800 text-white rounded-lg font-bold hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Pin to Wall'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
