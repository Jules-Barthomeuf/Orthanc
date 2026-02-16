"use client";

import { useToastStore } from "@/lib/toast";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3 rounded-lg border text-sm font-medium backdrop-blur-sm animate-slide-in ${
            toast.type === "success"
              ? "bg-green-900/30 border-green-500/30 text-green-400"
              : toast.type === "error"
              ? "bg-red-900/30 border-red-500/30 text-red-400"
              : "bg-dark-800/90 border-gold-400/20 text-gold-400"
          }`}
        >
          <div className="flex justify-between items-center gap-4">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-dark-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
