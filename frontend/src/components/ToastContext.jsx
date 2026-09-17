import { createContext, useContext, useState, useCallback } from "react";
const ToastContext = createContext(null);
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );
  const toast = {
    success: (msg, dur) => showToast(msg, "success", dur),
    error: (msg, dur) => showToast(msg, "error", dur),
    info: (msg, dur) => showToast(msg, "info", dur),
    warning: (msg, dur) => showToast(msg, "warning", dur),
    remove: removeToast,
  };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}
function ToastContainer({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:top-6 sm:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
function ToastItem({ toast, onClose }) {
  const styles = {
    success: {
      bg: "bg-white dark:bg-slate-800",
      border: "border-emerald-200 dark:border-emerald-800/50",
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
    },
    error: {
      bg: "bg-white dark:bg-slate-800",
      border: "border-red-200 dark:border-red-800/50",
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      barColor: "bg-red-500",
    },
    info: {
      bg: "bg-white dark:bg-slate-800",
      border: "border-blue-200 dark:border-blue-800/50",
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-500",
    },
    warning: {
      bg: "bg-white dark:bg-slate-800",
      border: "border-amber-200 dark:border-amber-800/50",
      iconBg: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      barColor: "bg-amber-500",
    },
  };
  const s = styles[toast.type] || styles.info;
  const icons = {
    success: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    error: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </svg>
    ),
    warning: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      </svg>
    ),
  };
  return (
    <div
      className={`pointer-events-auto animate-[slideIn_0.3s_ease-out] overflow-hidden rounded-xl border shadow-lg ${s.bg} ${s.border}`}
      role="alert"
    >
      <div className="flex items-start gap-3 p-3.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.iconColor}`}
        >
          {icons[toast.type] || icons.info}
        </div>
        <p className="flex-1 pt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        className={`h-1 ${s.barColor} animate-[shrink_3.5s_linear_forwards]`}
      />
    </div>
  );
}
