"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // ✅ VALIDATION FUNCTION
  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (username.trim().length < 2) return "Username must be at least 2 characters";

    if (!password) return "Password is required";
    if (password.length < 3) return "Password must be at least 6 characters";

    return "";
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    // run validation first
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.message || "Invalid username or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !username.trim() || !password || password.length < 3 || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 px-4">

      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8">

        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center -mt-10">
          <img
            className="h-50 w-auto mx-auto"
            src="/image/logo.png"
            alt="logo"
          />

          <p className="text-white/60 text-sm -mt-16">
            Sign in to access your dashboard
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Username */}
          <div>
            <label className="text-sm text-white/70">Username</label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm text-white/70">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-white/60 hover:text-white transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition active:scale-[0.99] sm:h-13 sm:text-base
                ${
                  isDisabled
                    ? "cursor-not-allowed bg-gray-800/10 opacity-50"
                    : "bg-gray-600 text-slate-950 shadow-lg shadow-black/20 hover:bg-gray-800 cursor-pointer"
                }`}
            >
              {!loading && <ShieldCheck size={18} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Secure Admin Login System
        </p>
      </div>
    </div>
  );
}
