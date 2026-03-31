'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { TAG_HIERARCHY } from '@/lib/types';

interface Props {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function FilterBar({ selectedTag, onSelectTag }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const select = (tag: string | null) => {
    onSelectTag(tag);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-2 px-8 py-3 bg-white/60 backdrop-blur-sm rounded-full font-bold text-neutral-700 shadow-md hover:bg-white transition-all"
      >
        <Filter size={18} />
        {selectedTag || 'All Categories'}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden w-full"
          >
            <div className="filter-glass p-6 rounded-3xl flex flex-col space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={() => select(null)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    !selectedTag ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-200'
                  }`}
                >
                  ALL
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TAG_HIERARCHY.map(category => (
                  <div key={category.name} className="space-y-3">
                    <button
                      onClick={() => select(category.name)}
                      className={`text-lg font-scribble font-bold block w-full text-left px-2 py-1 rounded-lg transition-colors ${
                        selectedTag === category.name ? 'bg-yellow-200' : 'hover:bg-white/40'
                      }`}
                    >
                      {category.name}
                    </button>
                    <div className="flex flex-wrap gap-2 pl-2">
                      {category.subTags.map(sub => (
                        <button
                          key={sub}
                          onClick={() => select(sub)}
                          className={`px-3 py-1 rounded-full text-xs font-handwriting font-bold transition-all ${
                            selectedTag === sub
                              ? 'bg-yellow-300 scale-110'
                              : 'bg-white/60 hover:bg-white'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
