import { useEffect, useState } from "react";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import ThemeToggle from "./ThemeToggle";
import { useToast } from "./ToastContext";
function TodoList({ user, setUser, API_URL }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTasks = async (pageNumber = page, searchValue = search) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) params.append("search", searchValue.trim());
      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);
      if (sort) params.append("sort", sort);

      params.append("page", pageNumber);
      params.append("limit", 10);

      const response = await fetch(`${API_URL}/tasks?${params.toString()}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch tasks");
        return;
      }

      setTasks(data.tasks || []);

      setPagination(
        data.pagination || {
          page: pageNumber,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );
    } catch (error) {
      console.error("Fetch tasks error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, status, priority, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTasks(1, search);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const handleTaskCreated = (newTask) => {
    setPage(1);
    setTasks((currentTasks) => [newTask, ...currentTasks]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === updatedTask.id ? updatedTask : currentTask,
      ),
    );
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask.id !== deletedTaskId),
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setSort("");
    setPage(1);
  };

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high",
  ).length;

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    // Main Background
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden dark:bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 dark:border-slate-700 dark:bg-slate-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center border-b border-slate-100 px-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              T
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Task Manager
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Stay productive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspace
          </p>
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              document.getElementById("tasks-section")?.scrollIntoView({
                behavior: "smooth",
              });
              closeSidebar();
            }}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            My Tasks
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {pagination.total}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              document.getElementById("create-task")?.scrollIntoView({
                behavior: "smooth",
              });
              closeSidebar();
            }}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-400 text-xs dark:border-slate-500">
              +
            </span>
            Create Task
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById("statistics")?.scrollIntoView({
                behavior: "smooth",
              });
              closeSidebar();
            }}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19V5M4 19h17" />
              <path d="M8 16v-4M12 16V8M16 16v-7M20 16v-4" />
            </svg>
            Statistics
          </button>
        </nav>

        {/* User Profile + Theme + Logout */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-700">
          {/* Theme Toggle Row */}
          <div className="mb-2 flex items-center justify-between rounded-lg px-3 py-2">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Theme
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Toggle appearance
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Row */}
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17l5-5-5-5"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 19V5a2 2 0 00-2-2h-6"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-slate-700 dark:bg-slate-800/95">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Open sidebar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Task Manager
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {user?.name?.charAt(0) || "U"}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Welcome Section */}
          <section className="mb-7">
            <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Your workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Welcome back, {user?.name || "User"} 👋
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Manage your tasks and stay productive.
            </p>
          </section>

          {/* Stats Cards */}
          <section
            id="statistics"
            className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {/* Total Tasks */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Tasks
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 12h8M8 8h8M8 16h5" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {pagination.total}
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pending
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {pendingTasks}
              </p>
            </div>

            {/* Completed */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Completed
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {completedTasks}
              </p>
            </div>

            {/* High Priority */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  High Priority
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3l9 18H3L12 3z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {highPriorityTasks}
              </p>
            </div>
          </section>

          <div className="mx-auto w-full max-w-6xl space-y-8">
            {/* Create Task Form */}
            <section id="create-task">
              <TodoForm API_URL={API_URL} onTaskCreated={handleTaskCreated} />
            </section>

            {/* Tasks Section */}
            <section id="tasks-section">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    My Tasks
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {pagination.total}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  View and manage your tasks.
                </p>
              </div>

              {/* Filters */}
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-wrap items-center gap-3 md:flex-nowrap"
                >
                  <div className="relative min-w-[200px] flex-1">
                    <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:hover:bg-blue-500"
                  >
                    Search
                  </button>
                  <div className="w-full min-w-0 shrink-0 sm:w-36">
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="w-full min-w-0 shrink-0 sm:w-36">
                    <select
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="w-full min-w-0 shrink-0 sm:w-36">
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
                    >
                      <option value="">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="due_date">Due Date</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </form>

                {(search || status || priority || sort) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-3 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading your tasks...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Something went wrong
                  </p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchTasks()}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-500"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && tasks.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect width="14" height="17" x="5" y="5" rx="2" />
                      <path d="M9 11h6M9 15h4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                    No tasks found
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search or filters, or create a new task.
                  </p>
                </div>
              )}

              {/* Task List */}
              {!loading && !error && tasks.length > 0 && (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TodoItem
                      key={task.id}
                      task={task}
                      API_URL={API_URL}
                      onTaskUpdated={handleTaskUpdated}
                      onTaskDeleted={handleTaskDeleted}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && pagination.totalPages > 0 && (
                <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {pagination.totalPages}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      ← Previous
                    </button>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-medium text-white">
                      {pagination.page}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TodoList;
