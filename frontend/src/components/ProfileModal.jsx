import { useState, useEffect, useRef } from "react";
import { useToast } from "./ToastContext";
import ConfirmModal from "./ConfirmModal";

function ProfileModal({ isOpen, onClose, user, setUser, API_URL }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("info");

  // Personal Info
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [infoLoading, setInfoLoading] = useState(false);

  // Image
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [useUrlMode, setUseUrlMode] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setImageFile(null);
      setImageUrl("");
      setImagePreview(user?.profile_image || null);
      setUseUrlMode(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDeletePassword("");
      setActiveTab("info");
    }
  }, [isOpen, user]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Image URL
  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  // ========== FILE SELECT ==========
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2 MB");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setImageFile(file);
    setImageUrl("");
    setImagePreview(URL.createObjectURL(file));
  };

  // ========== URL CHANGE ==========
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    if (url.trim()) {
      setImagePreview(url.trim());
    }
  };

  // ========== REMOVE IMAGE ==========
  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ========== UPDATE PROFILE ==========
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setInfoLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());

      if (imageFile) {
        formData.append("profileImage", imageFile);
      } else if (imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      } else if (!imagePreview && user?.profile_image) {
        // User removed existing image
        formData.append("imageUrl", "");
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      setUser(data.user);
      toast.success("Profile updated successfully");
      setImageFile(null);
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Unable to connect to server");
    } finally {
      setInfoLoading(false);
    }
  };

  // ========== UPDATE PASSWORD ==========
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Update password error:", err);
      toast.error("Unable to connect to server");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ========== DELETE ACCOUNT ==========
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password");
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete account");
        setDeleteLoading(false);
        return;
      }

      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      onClose();
      setUser(null);
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("Unable to connect to server");
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete your account?"
        message="This will permanently delete your account and all your tasks. This action cannot be undone."
        confirmText="Yes, Delete Everything"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletePassword("");
        }}
      />

      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Profile
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Manage your account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-2 dark:border-slate-700">
            {[
              { id: "info", label: "Info" },
              { id: "password", label: "Password" },
              { id: "danger", label: "Danger" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 border-b-2 px-4 py-3 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* ============ INFO TAB ============ */}
            {activeTab === "info" && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={getImageSrc(imagePreview)}
                        alt="Profile"
                        className="h-24 w-24 rounded-full border-4 border-slate-100 object-cover dark:border-slate-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                          setImagePreview(null);
                        }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                        {avatarLetter}
                      </div>
                    )}

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                        title="Remove image"
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
                    )}
                  </div>

                  {/* Toggle: File / URL */}
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setUseUrlMode(false)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        !useUrlMode
                          ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      📁 Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseUrlMode(true)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        useUrlMode
                          ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      🔗 URL
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                {!useUrlMode && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      Choose Image
                    </button>
                    <p className="mt-1.5 text-center text-[11px] text-slate-400 dark:text-slate-500">
                      JPG, PNG, WebP, GIF — Max 2 MB
                    </p>
                  </div>
                )}

                {/* URL Input */}
                {useUrlMode && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com/photo.jpg"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={infoLoading}
                  className="h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
                >
                  {infoLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* ============ PASSWORD TAB ============ */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Current Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    placeholder="Re-enter new password"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                  />
                  Show passwords
                </label>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="h-10 w-full rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {/* ============ DANGER TAB ============ */}
            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Delete Account
                  </p>
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Once you delete your account, there is no going back. All
                    your tasks will be permanently deleted.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="h-10 w-full rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 dark:hover:bg-red-500"
                >
                  Delete My Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileModal;