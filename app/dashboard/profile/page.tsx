"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showImage, setShowImage] = useState(false);
  const [zoom, setZoom] = useState(1);

  // 📦 FETCH PROFILE
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

  // 🖼️ AVATAR CHANGE
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  };

  // 💾 UPDATE PROFILE
  const updateProfile = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("full_name", user.full_name || "");
    formData.append("email", user.email || "");

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update profile");
      return;
    }

    alert("Profile updated!");
    fetchProfile(); // refresh updated data
  };

  return (
    <div className="relative max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border">

      {/* ❌ CLOSE BUTTON */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer"
      >
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </button>

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-8">

        {/* AVATAR */}
        <div className="relative w-20 h-20">

          <div
            onClick={() => {
                setShowImage(true);
                setZoom(1); // reset zoom every open
            }}
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

          {/* EDIT BUTTON */}
          <label className="absolute bottom-0 right-0 bg-gray-200 text-black p-2 rounded-full cursor-pointer hover:bg-gray-300 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            ✎
          </label>

        </div>

        {/* USER INFO */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {user.full_name || "No Name"}
          </h2>

          <p className="text-gray-500">@{user.username}</p>

          <span className="inline-block mt-1 text-xs bg-black text-white px-2 py-1 rounded-md">
            {user.role || "Admin"}
          </span>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-5">

        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input
            type="text"
            value={user.full_name || ""}
            onChange={(e) =>
              setUser({ ...user, full_name: e.target.value })
            }
            className="w-full mt-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black text-black"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
            className="w-full mt-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black text-black"
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={updateProfile}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>

      </div>
      
      {showImage && (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowImage(false)}
        >
            
            <div
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            >
            {/* IMAGE */}
            <img
                src={preview || user.avatar}
                style={{
                transform: `scale(${zoom})`,
                transition: "transform 0.2s ease",
                }}
                className="max-w-[90vw] max-h-[80vh] rounded-lg"
            />

            {/* CONTROLS */}
            <div onWheel={(e) => {
                e.preventDefault();

                if (e.deltaY < 0) {
                    setZoom((z) => Math.min(3, z + 0.1));
                } else {
                    setZoom((z) => Math.max(1, z - 0.1));
                }
                }}className="mt-30 flex gap-3 items-center bg-white px-4 py-2 rounded-full shadow">

                <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="text-black font-bold cursor-pointer"
                >
                −
                </button>

                <span className="text-sm text-black">{zoom.toFixed(1)}x</span>

                <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                className="text-black font-bold cursor-pointer"
                >
                +
                </button>

                <button
                onClick={() => setZoom(1)}
                className="text-xs text-red-600 ml-2 cursor-pointer"
                >
                Reset
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}