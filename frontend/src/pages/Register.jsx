import { useState } from "react";

function Register({
  switchToLogin,
  API_URL,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Registration failed"
        );
        return;
      }

      setSuccess(
        "Registration successful. Please login."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* App Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg mb-4">
            T
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Task Manager
          </h1>

          <p className="text-slate-500 mt-2">
            Organize your work and stay productive
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Create an account
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            Get started with your task manager
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

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
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="text-xs text-slate-400 mt-2">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm text-green-600">
                  {success}
                </p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}

              <button
                type="button"
                onClick={switchToLogin}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Task Manager
        </p>
      </div>
    </div>
  );
}

export default Register;