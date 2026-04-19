"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      alert(data.error);
      return;
    }

    alert("Password updated!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="relative max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border">

        <button
            onClick={() => router.push("/dashboard")} // or router.back()
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 16 16"
            >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
        </button>

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-8">

        
        <div
            
            className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shadow-lg cursor-pointer hover:scale-105 transition"
            >
            {preview || user.avatar ? (
                <img src={preview || user.avatar} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-bold">
                {user.username?.charAt(0)?.toUpperCase()}
                </div>
            )}
            </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Security Settings
          </h2>

          <p className="text-gray-500">
            @{user.username || "user"}
          </p>

          <span className="inline-block mt-1 text-xs bg-black text-white px-2 py-1 rounded-md">
            {user.role || "Admin"}
          </span>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-5">

        {/* CURRENT PASSWORD */}
        <div>
          <label className="text-sm text-gray-600">
            Current Password
          </label>

          <div className="relative mt-1">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="Enter current password"
            />

            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showCurrent ? (
                /* eye-off */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                </svg>
              ) : (
                /* eye */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                <   path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* NEW PASSWORD */}
        <div>
          <label className="text-sm text-gray-600">
            New Password
          </label>

          <div className="relative mt-1">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="Enter new password"
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showNew ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={changePassword}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}