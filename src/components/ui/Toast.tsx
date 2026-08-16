"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; type?: "success" | "error" | "info" }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ title, description, type = "success" }: { title: string; description?: string; type?: "success" | "error" | "info" }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container: bottom-center on mobile, bottom-right on desktop */}
      <div className="fixed z-50 flex flex-col gap-2 pointer-events-none bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 max-w-sm w-full mx-auto sm:mx-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-card border border-divider p-4 shadow-elevated transition-all duration-200 animate-in slide-in-from-bottom-4 fade-in bg-white",
              t.type === "success" && "border-l-4 border-l-status-available",
              t.type === "error" && "border-l-4 border-l-status-sold-out",
              t.type === "info" && "border-l-4 border-l-brand-accent"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-status-available shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-status-sold-out shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-primary leading-snug">{t.title}</p>
              {t.description && <p className="text-xs text-brand-secondary mt-0.5">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-brand-secondary hover:text-brand-primary p-1 -mr-1 -mt-1 rounded-md transition"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
