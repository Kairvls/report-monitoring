"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, ZoomIn, ZoomOut } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showImage, setShowImage] = useState(false);
  const [zoom, setZoom] = useState(1);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

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
    fetchProfile();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          {/* Top accent */}
          <div className="h-24 sm:h-28 md:h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-black" />

          {/* Close button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur hover:bg-white hover:text-black transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="px-4 pb-5 sm:px-6 md:px-8 lg:px-10">
            {/* Profile header */}
            <div className="-mt-12 sm:-mt-14 md:-mt-16 flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-end">
                {/* Avatar */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (preview || user.avatar) {
                        setShowImage(true);
                        setZoom(1);
                      }
                    }}
                    className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-xl sm:h-28 sm:w-28 md:h-32 md:w-32 cursor-pointer"
                  >
                    {preview || user.avatar ? (
                      <img
                        src={preview || user.avatar}
                        alt="Profile avatar"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black text-3xl font-bold text-white sm:text-4xl">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </button>

                  {/* Edit */}
                  <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white bg-white text-slate-800 shadow-lg transition hover:bg-slate-100">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Camera size={18} />
                  </label>
                </div>

                {/* Info */}
                <div className="text-center md:text-left">
                  <h1 className="max-w-[280px] break-words text-xl font-bold tracking-tight text-yellow-600 sm:max-w-none sm:text-2xl md:text-3xl">
                    {user.full_name || "No Name"}
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-500 sm:text-base">
                    @{user.username || "username"}
                  </p>

                  <div className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    {user.role || "Admin"}
                  </div>
                </div>
              </div>

              {/* Save button desktop top alignment */}
              <div className="hidden md:block">
                <button
                  onClick={updateProfile}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 cursor-pointer"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Form card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your personal information and account details.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.full_name || ""}
                      onChange={(e) =>
                        setUser({ ...user, full_name: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email || ""}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="md:hidden pt-2">
                    <button
                      onClick={updateProfile}
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 cursor-pointer"
                    >
                      {loading ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Side info card */}
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5 md:p-6">
                <h3 className="text-lg font-semibold text-slate-900">Account Overview</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick summary of your profile details.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Username
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      @{user.username || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user.role || "Admin"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {user.email || "No email set"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <p className="text-sm text-slate-600">
                      Tap your profile image to preview it, and use the camera button to upload a new one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Viewer Modal */}
        {showImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-3 py-4 sm:px-6"
            onClick={() => setShowImage(false)}
          >
            <div
              className="relative flex w-full max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImage(false)}
                className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition cursor-pointer"
                aria-label="Close image viewer"
              >
                <X size={22} />
              </button>

              <div className="mt-12 flex h-[55vh] w-full items-center justify-center overflow-hidden sm:h-[65vh] md:h-[72vh]">
                <img
                  src={preview || user.avatar}
                  alt="Profile preview"
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 0.2s ease",
                  }}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                />
              </div>

              <div
                onWheel={(e) => {
                  e.preventDefault();

                  if (e.deltaY < 0) {
                    setZoom((z) => Math.min(3, z + 0.1));
                  } else {
                    setZoom((z) => Math.max(1, z - 0.1));
                  }
                }}
                className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl sm:px-4"
              >
                <button
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 cursor-pointer"
                >
                  <ZoomOut size={18} />
                </button>

                <span className="min-w-[52px] text-center text-sm font-medium text-black">
                  {zoom.toFixed(1)}x
                </span>

                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 cursor-pointer"
                >
                  <ZoomIn size={18} />
                </button>

                <button
                  onClick={() => setZoom(1)}
                  className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
