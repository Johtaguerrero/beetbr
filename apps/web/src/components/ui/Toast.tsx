'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Toast } from '@/lib/store';

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const colors = {
        success: { bg: 'bg-beet-green/10', border: 'border-beet-green/30', text: 'text-beet-green', icon: 'bg-beet-green/20 text-beet-green' },
        error: { bg: 'bg-beet-red/10', border: 'border-beet-red/30', text: 'text-beet-red', icon: 'bg-beet-red/20 text-beet-red' },
        info: { bg: 'bg-beet-blue/10', border: 'border-beet-blue/30', text: 'text-beet-blue', icon: 'bg-beet-blue/20 text-beet-blue' },
    };
    const c = colors[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${c.bg} ${c.border}`}
        >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${c.icon}`}>
                {icons[toast.type]}
            </span>
            <p className={`text-sm font-medium ${c.text}`}>{toast.message}</p>
            <button onClick={onRemove} className="ml-2 text-beet-muted hover:text-white transition-colors text-sm">✕</button>
        </motion.div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = useStore();

    return (
        <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 lg:bottom-6">
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}
