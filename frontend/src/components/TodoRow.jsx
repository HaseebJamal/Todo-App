import { useState, useRef, useEffect } from "react";
import { useToast } from "./ToastContext";
import ConfirmModal from "./ConfirmModal";

function TodoRow({
  task,
  API_URL,
  isSelected,
  onSelect,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showActions]);

  // ============ STYLES ============
  const getPriorityStyles = () => {
    if (task.priority === "urgent")
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50";
    if (task.priority === "high")
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50";
    if (task.priority === "medium")
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50";
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50";
  };

  const getPriorityDot = () => {
    if (task.priority === "urgent") return "bg-purple-500";
    if (task.priority === "high") return "bg-red-500";
    if (task.priority === "medium") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusStyles = () => {
    if (task.status === "completed")
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    if (task.status === "cancelled")
      return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
  };

  const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now && task.status !== "completed";
    return {
      text: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isOverdue,
    };
  };

  const dueInfo = task.due_date ? formatDue(task.due_date) : null;

  // ============ ACTIONS ============
  const handleToggleComplete = async () => {
    setLoading(true);
    setShowActions(false);
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          dueDate: task.due_date || null,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to update task");
        return;
      }

      onTaskUpdated(data.task);
      toast.success(
        newStatus === "completed"
          ? "Task marked as complete 🎉"
          : "Task marked as pending",
      );
    } catch (err) {
      console.error(err);
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to delete task");
        return;
      }
      toast.success("Task deleted successfully");
      setShowDeleteModal(false);
      onTaskDeleted(task.id);
    } catch (err) {
      console.error(err);
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete this task?"
        message={`"${task.title}" will be permanently deleted.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Main Row */}
      <tr
        className={`group border-b border-slate-100 transition hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50 ${
          isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
        }`}
      >
        {/* Checkbox */}
        <td className="w-10 px-3 py-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task.id)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
          />
        </td>

        {/* Complete Toggle */}
        <td className="w-10 px-2 py-2">
          <button
            type="button"
            onClick={handleToggleComplete}
            disabled={loading}
            className={`flex h-6 w-6 items-center justify-center rounded transition disabled:opacity-50 ${
              task.status === "completed"
                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-700 dark:hover:bg-blue-900/40"
            }`}
            aria-label="Toggle complete"
          >
            {task.status === "completed" && (
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            )}
          </button>
        </td>

        {/* Task Title + Description */}
        <td className="min-w-0 px-2 py-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-start gap-2 text-left"
          >
            <svg
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${
                  task.status === "completed" || task.status === "cancelled"
                    ? "text-slate-400 line-through dark:text-slate-500"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {task.description}
                </p>
              )}
            </div>
          </button>
        </td>

        {/* Priority */}
        <td className="w-28 px-2 py-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getPriorityStyles()}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${getPriorityDot()}`} />
            {task.priority}
          </span>
        </td>

        {/* Status */}
        <td className="w-24 px-2 py-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ${getStatusStyles()}`}
          >
            {task.status === "completed" && "✅"}
            {task.status === "cancelled" && "❌"}
            {task.status === "pending" && "⏳"}
            {task.status}
          </span>
        </td>

        {/* Due Date */}
        <td className="w-32 px-2 py-2">
          {dueInfo ? (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                dueInfo.isOverdue
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              {dueInfo.text}
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              —
            </span>
          )}
        </td>

        {/* Actions Dropdown */}
        <td className="w-12 px-2 py-2 text-right">
          <div className="relative inline-block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowActions(!showActions)}
              disabled={loading}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Actions"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {task.status === "completed"
                    ? "⏳ Mark Pending"
                    : "✅ Mark Complete"}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {isExpanded && (
        <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30">
          <td colSpan={7} className="px-6 py-4">
            <div className="space-y-3 text-sm">
              {task.description && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {task.description}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">
                    Priority:
                  </strong>{" "}
                  {task.priority}
                </span>
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">
                    Status:
                  </strong>{" "}
                  {task.status}
                </span>
                {task.due_date && (
                  <span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      Due:
                    </strong>{" "}
                    {new Date(task.due_date).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default TodoRow;
