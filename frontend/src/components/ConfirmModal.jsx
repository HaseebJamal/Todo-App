import { useEffect } from "react";
function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", 
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel, loading]);
  if (!isOpen) return null;
  const variants = {
    danger: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      button: "bg-red-600 hover:bg-red-700 dark:hover:bg-red-500",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      ),
    },
    warning: {
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      button: "bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-500",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        </svg>
      ),
    },
    info: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v4h1" />
        </svg>
      ),
    },
  };
  const v = variants[variant] || variants.danger;
  return (
    <div
      className="animate-overlay-in fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="animate-modal-in w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${v.iconBg} ${v.iconColor}`}>
              {v.icon}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:justify-end dark:border-slate-700 dark:bg-slate-900/30">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${v.button}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ConfirmModal;