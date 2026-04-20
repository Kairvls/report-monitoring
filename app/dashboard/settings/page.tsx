"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, X } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUser(data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const changePassword = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to update password");
      return;
    }

    alert("Password updated!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          {/* top header accent */}
          <div className="h-24 sm:h-28 md:h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-black" />

          {/* close button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur hover:bg-white hover:text-black transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="px-4 pb-5 sm:px-6 md:px-8 lg:px-10">
            {/* header section */}
            <div className="-mt-12 sm:-mt-14 md:-mt-16 flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-end">
                {/* avatar */}
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-xl sm:h-28 sm:w-28 md:h-32 md:w-32">
                    {preview || user.avatar ? (
                      <img
                        src={preview || user.avatar}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black text-3xl font-bold text-white sm:text-4xl">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>

                {/* title */}
                <div className="text-center md:text-left">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                    Security Settings
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-500 sm:text-base">
                    @{user.username || "user"}
                  </p>

                  <div className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    {user.role || "Admin"}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <ShieldCheck size={18} className="text-slate-900" />
                Password protection enabled
              </div>
            </div>

            {/* body */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              {/* form card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Change Password
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your password to keep your account secure.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {/* current password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Current Password
                    </label>

                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Enter current password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-black"
                        aria-label={showCurrent ? "Hide current password" : "Show current password"}
                      >
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* new password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Enter new password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-black"
                        aria-label={showNew ? "Hide new password" : "Show new password"}
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* action */}
                  <div className="pt-2">
                    <button
                      onClick={changePassword}
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 sm:text-base"
                    >
                      {loading ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>

              {/* side card */}
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Security Overview
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick details about your account security.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <LockKeyhole size={16} className="text-slate-700" />
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Account
                      </p>
                    </div>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                      @{user.username || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Role
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {user.role || "Admin"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Security Tip
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Use a strong password with a mix of letters, numbers, and symbols, and avoid reusing old passwords.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <p className="text-sm text-slate-600">
                      Changing your password regularly helps protect your account and system access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* mobile security badge */}
            <div className="mt-5 md:hidden flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <ShieldCheck size={18} className="text-slate-900" />
              Password protection enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
