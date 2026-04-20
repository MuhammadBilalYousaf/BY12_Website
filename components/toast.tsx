"use client"

import { useEffect } from "react"
import { X, CheckCircle } from "lucide-react"

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
  type?: "success" | "error" | "info"
}

export default function Toast({ message, onClose, duration = 3000, type = "success" }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
            : type === "error"
            ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
            : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
        }`}
      >
        <CheckCircle
          size={20}
          className={
            type === "success"
              ? "text-green-600 dark:text-green-400"
              : type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-blue-600 dark:text-blue-400"
          }
        />
        <p
          className={`font-medium ${
            type === "success"
              ? "text-green-800 dark:text-green-200"
              : type === "error"
              ? "text-red-800 dark:text-red-200"
              : "text-blue-800 dark:text-blue-200"
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition ${
            type === "success"
              ? "text-green-600 dark:text-green-400"
              : type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}