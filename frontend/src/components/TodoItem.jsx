import { useState } from "react";
import { useToast } from "./ToastContext";
import ConfirmModal from "./ConfirmModal";

function TodoItem({ task, API_URL, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.due_date ? task.due_date.slice(0, 16) : "",
    status: task.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast(); // ✅ Fixed typo
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update task");
        toast.error(data.message || "Failed to update task"); // ✅ Added
        return;
      }

      onTaskUpdated(data.task);
      toast.success("Task updated successfully"); // ✅ Added
      setIsEditing(false);
    } catch (error) {
      console.error("Update task error:", error);
      setError("Unable to connect to server");
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE COMPLETE =================
  const handleToggleComplete = async () => {
    setError("");
    setLoading(true);

    const newStatus =
      task.status === "cancelled"
        ? "pending"
        : task.status === "completed"
          ? "pending"
          : "completed";

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
        setError(data.message || "Failed to update task");
        toast.error(data.message || "Failed to update task"); // ✅ Added
        return;
      }

      onTaskUpdated(data.task);

      // ✅ Added: Different toasts based on action
      if (newStatus === "completed") {
        toast.success("Task marked as complete 🎉");
      } else if (newStatus === "pending" && task.status === "cancelled") {
        toast.info("Task restored to pending");
      } else {
        toast.info("Task marked as pending");
      }
    } catch (error) {
      console.error("Toggle task error:", error);
      setError("Unable to connect to server");
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE (Now via Modal) =================
  const handleDelete = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete task");
        toast.error(data.message || "Failed to delete task");
        setShowDeleteModal(false); // ✅ Close modal on error
        return;
      }

      toast.success("Task deleted successfully"); // ✅ Added
      setShowDeleteModal(false); // ✅ Close modal
      onTaskDeleted(task.id);
    } catch (error) {
      console.error("Delete task error:", error);
      setError("Unable to connect to server");
      toast.error("Unable to connect to server");
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.due_date ? task.due_date.slice(0, 16) : "",
      status: task.status,
    });
    setError("");
    setIsEditing(false);
  };

  // ================= STYLES =================
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

  // ================= EDIT MODE =================
  if (isEditing) {
    return (
      <>
        {/* ✅ Confirm Modal (bhi edit mode mein available) */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete this task?"
          message={`"${task.title}" will be permanently deleted. This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant="danger"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />

        <article className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm dark:border-blue-800/50 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Edit Task
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Update task details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={loading}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Close edit"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Task title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Description
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Optional
                  </span>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add task details..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Due date
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Optional
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </article>
      </>
    );
  }

  // ================= VIEW MODE =================
  return (
    <>
      {/* ✅ Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete this task?"
        message={`"${task.title}" will be permanently deleted. This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <article
        className={`group rounded-xl border bg-white shadow-sm transition hover:shadow-md dark:bg-slate-800 ${
          task.status === "completed"
            ? "border-emerald-200 dark:border-emerald-800/50"
            : task.status === "cancelled"
              ? "border-red-200 dark:border-red-800/50"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={loading}
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                task.status === "completed"
                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                  : task.status === "cancelled"
                    ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
                    : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-400"
              }`}
              aria-label={
                task.status === "completed"
                  ? "Mark task as pending"
                  : task.status === "cancelled"
                    ? "Restore task as pending"
                    : "Mark task as complete"
              }
            >
              {task.status === "completed" ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              ) : task.status === "cancelled" ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="8" />
                </svg>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3
                    className={`break-words text-sm font-semibold sm:text-base ${
                      task.status === "completed" || task.status === "cancelled"
                        ? "text-slate-400 line-through dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p
                      className={`mt-1 break-words text-sm leading-5 ${
                        task.status === "completed" ||
                        task.status === "cancelled"
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${getPriorityStyles()}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${getPriorityDot()}`}
                  />
                  {task.priority}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${getStatusStyles()}`}
                >
                  {task.status === "completed" ? (
                    <>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                      Completed
                    </>
                  ) : task.status === "cancelled" ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Cancelled
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Pending
                    </>
                  )}
                </span>

                {task.due_date && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600">
                    <svg
                      className="h-3 w-3 text-slate-400 dark:text-slate-400"
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
                    {new Date(task.due_date).toLocaleString()}
                  </span>
                )}
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  disabled={loading}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    task.status === "completed"
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                      : task.status === "cancelled"
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  }`}
                >
                  {loading
                    ? "Saving..."
                    : task.status === "completed"
                      ? "Mark Pending"
                      : task.status === "cancelled"
                        ? "Restore Pending"
                        : "Mark Complete"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export default TodoItem;