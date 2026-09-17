import { useState } from "react";
function Login({
  setUser,
  switchToRegister,
  API_URL,
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPasword]=useState(false)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed"
        );
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);

      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / App Name */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg mb-4">
            T
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Task Manager
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your tasks efficiently
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            Login to continue to your tasks
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type={showPassword?"text":"password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?
              <button
                type="button"
                onClick={switchToRegister}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Task Manager
        </p>
      </div>
    </div>
  );
}

export default Login;