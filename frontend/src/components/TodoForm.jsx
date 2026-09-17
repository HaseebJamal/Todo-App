import { useState } from "react";
import { useToast } from "./ToastContext";
function TodoForm({ API_URL, onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title.trim()) {
      setError("Task title is required");
      toast.error("Task title is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create task");
        toast.error("Failed to create task");
        return;
      }

      onTaskCreated(data.task);
toast.success("Task created successfully 🎉");

      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
    } catch (error) {
      console.error("Create task error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-700">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Create New Task
          </h2>

          <p className="text-xs text-slate-400 dark:text-slate-400">
            Add a task to your workspace
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Task title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="e.g. Complete project documentation"
                value={formData.title}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <label
                  htmlFor="description"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Description
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Optional
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                placeholder="Add some details about this task..."
                value={formData.description}
                onChange={handleChange}
                rows={1}
                className="h-10 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Priority
              </label>

              <select
                id="priority"
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

            {/* Due Date */}
            <div>
              <div className="mb-1.5 flex items-center gap-3">
                <label
                  htmlFor="dueDate"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Due date
                </label>

                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Optional
                </span>
              </div>

              <input
                id="dueDate"
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:bg-slate-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-50 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4m0 4h.01" />
                  <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
                </svg>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <p className="hidden text-[11px] text-slate-400 sm:block dark:text-slate-500">
              * Required field
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}

export default TodoForm;
