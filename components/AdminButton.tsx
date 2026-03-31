'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, X, Loader2 } from 'lucide-react';
import { loginAction, logoutAction } from '@/app/actions';

export function AdminButton({ isAdmin }: { isAdmin: boolean }) {
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const err = await loginAction(null, formData);
      if (err) {
        setError(err);
      } else {
        setShowLogin(false);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <div className="absolute top-8 right-8">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg transition-all disabled:opacity-50"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-full font-bold bg-white text-neutral-700 hover:bg-neutral-100 shadow-lg transition-all"
          >
            <LogIn size={18} />
            Admin Mode
          </button>
        )}
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-80"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Admin Login</h3>
                <button onClick={() => setShowLogin(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  name="password"
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-neutral-800"
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2 bg-neutral-800 text-white rounded-lg font-bold hover:bg-neutral-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
