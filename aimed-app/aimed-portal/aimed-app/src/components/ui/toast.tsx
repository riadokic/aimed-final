"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const typeStyles: Record<ToastType, string> = {
  success: "border-aimed-green bg-aimed-green-light text-aimed-green",
  error: "border-aimed-red bg-aimed-red-light text-aimed-red",
  info: "border-aimed-blue bg-aimed-blue-light text-aimed-blue",
};

let addToastGlobal: ((message: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "info") {
  addToastGlobal?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-in slide-in-from-top rounded-xl border px-5 py-3 text-sm font-medium shadow-md",
            "font-[var(--font-inter),Inter,system-ui,sans-serif]",
            typeStyles[t.type]
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
