import { useState } from "react";
import TodoRow from "./TodoRow";
import { useToast } from "./ToastContext";

function TodoTable({ tasks, API_URL, onTaskUpdated, onTaskDeleted }) {
  const toast = useToast();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [bulkLoading, setBulkLoading] = useState(false);

  // ============ SORT ============
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === "due_date") {
      aVal = aVal ? new Date(aVal).getTime() : Infinity;
      bVal = bVal ? new Date(bVal).getTime() : Infinity;
    }

    if (sortKey === "priority") {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      aVal = order[aVal] ?? 4;
      bVal = order[bVal] ?? 4;
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // ============ SELECT ============
  const allSelected =
    tasks.length > 0 && selectedIds.length === tasks.length;

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(tasks.map((t) => t.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ============ BULK ACTIONS ============
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} task${selectedIds.length > 1 ? "s" : ""}?`
      )
    )
      return;

    setBulkLoading(true);
    let successCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          onTaskDeleted(id);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setSelectedIds([]);
    setBulkLoading(false);
    toast.success(`${successCount} task${successCount > 1 ? "s" : ""} deleted`);
  };

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    let successCount = 0;

    for (const id of selectedIds) {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.status === "completed") continue;

      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            dueDate: task.due_date || null,
            status: "completed",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          onTaskUpdated(data.task);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setSelectedIds([]);
    setBulkLoading(false);
    toast.success(
      `${successCount} task${successCount > 1 ? "s" : ""} completed`
    );
  };

  // ============ SORT ICON ============
  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) {
      return (
        <svg
          className="h-3 w-3 text-slate-300 dark:text-slate-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
        </svg>
      );
    }
    return sortDir === "asc" ? (
      <svg
        className="h-3 w-3 text-blue-600 dark:text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m7 14 5-5 5 5" />
      </svg>
    ) : (
      <svg
        className="h-3 w-3 text-blue-600 dark:text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2.5 dark:border-blue-800/50 dark:bg-blue-900/20">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
            {selectedIds.length} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkComplete}
              disabled={bulkLoading}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              ✅ Mark Complete
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              🗑️ Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                />
              </th>
              <th className="w-10 px-2 py-2.5"></th>
              <th className="px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Task <SortIcon columnKey="title" />
                </button>
              </th>
              <th className="w-28 px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => handleSort("priority")}
                  className="flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Priority <SortIcon columnKey="priority" />
                </button>
              </th>
              <th className="w-24 px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Status <SortIcon columnKey="status" />
                </button>
              </th>
              <th className="w-32 px-2 py-2.5">
                <button
                  type="button"
                  onClick={() => handleSort("due_date")}
                  className="flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Due Date <SortIcon columnKey="due_date" />
                </button>
              </th>
              <th className="w-12 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <TodoRow
                key={task.id}
                task={task}
                API_URL={API_URL}
                isSelected={selectedIds.includes(task.id)}
                onSelect={toggleSelect}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodoTable;